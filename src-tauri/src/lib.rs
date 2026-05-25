#![allow(unexpected_cfgs)]

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Listener, Manager, WebviewUrl, WebviewWindowBuilder};

static LISTENING: AtomicBool = AtomicBool::new(true);
static OVERLAY_VISIBLE: AtomicBool = AtomicBool::new(true);
const OVERLAY_WIDTH: f64 = 360.0;
const OVERLAY_HEIGHT: f64 = 220.0;
const OVERLAY_MARGIN: f64 = 12.0;
const FRIEND_OVERLAY_COUNT: usize = 3;

// ── macOS: 현재 포커스된 앱의 bundle ID로 XP 카테고리 분류 ────────────────
#[cfg(target_os = "macos")]
fn get_active_app_category() -> &'static str {
    use std::process::Command;

    let output = Command::new("osascript")
        .args(["-e", "id of app (path to frontmost application as text)"])
        .output();

    let bundle_id = match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).trim().to_lowercase(),
        Err(_) => return "adventure",
    };

    // 코딩 도구 → intelligence
    if bundle_id.contains("xcode")
        || bundle_id.contains("vscode")
        || bundle_id.contains("visualstudio")
        || bundle_id.contains("jetbrains")
        || bundle_id.contains("intellij")
        || bundle_id.contains("webstorm")
        || bundle_id.contains("cursor")
        || bundle_id.contains("nova")
        || bundle_id.contains("sublime")
        || bundle_id.contains("zed")
        || bundle_id.contains("terminal")
        || bundle_id.contains("iterm")
        || bundle_id.contains("warp")
        || bundle_id.contains("hyper")
    {
        return "intelligence";
    }

    // 글쓰기/창작 → creativity
    if bundle_id.contains("word")
        || bundle_id.contains("pages")
        || bundle_id.contains("notes")
        || bundle_id.contains("notion")
        || bundle_id.contains("obsidian")
        || bundle_id.contains("bear")
        || bundle_id.contains("ulysses")
        || bundle_id.contains("typora")
        || bundle_id.contains("craft")
        || bundle_id.contains("logseq")
        || bundle_id.contains("textedit")
        || bundle_id.contains("scrivener")
        || bundle_id.contains("garageband")
        || bundle_id.contains("logic")
        || bundle_id.contains("ableton")
    {
        return "creativity";
    }

    // 채팅/소통 → social
    if bundle_id.contains("kakao")
        || bundle_id.contains("discord")
        || bundle_id.contains("slack")
        || bundle_id.contains("telegram")
        || bundle_id.contains("whatsapp")
        || bundle_id.contains("messages")
        || bundle_id.contains("facetime")
        || bundle_id.contains("zoom")
        || bundle_id.contains("teams")
        || bundle_id.contains("skype")
        || bundle_id.contains("line")
    {
        return "social";
    }

    // 게임 → interest
    if bundle_id.contains("steam")
        || bundle_id.contains("epicgames")
        || bundle_id.contains("battle.net")
        || bundle_id.contains("gog")
        || bundle_id.contains("itch")
        || bundle_id.contains("minecraft")
        || bundle_id.contains("roblox")
    {
        return "interest";
    }

    // 브라우저/기타 → adventure
    "adventure"
}

// ── macOS ──────────────────────────────────────────────────────────────────
#[cfg(target_os = "macos")]
fn start_key_listener(app_handle: AppHandle) {
    use core_foundation::runloop::{kCFRunLoopCommonModes, CFRunLoop};
    use core_graphics::event::{
        CGEventTap, CGEventTapLocation, CGEventTapOptions, CGEventTapPlacement, CGEventType,
    };

    std::thread::spawn(move || {
        let handle_clone = app_handle.clone();

        eprintln!("[grow-pet] CGEventTap 생성 시도...");

        let tap = CGEventTap::new(
            CGEventTapLocation::HID,
            CGEventTapPlacement::HeadInsertEventTap,
            CGEventTapOptions::ListenOnly,
            vec![CGEventType::KeyDown],
            move |_, _, _| {
                if LISTENING.load(Ordering::Relaxed) {
                    let category = get_active_app_category();
                    eprintln!("[grow-pet] 키 감지! category={}", category);
                    if let Some(window) = handle_clone.get_webview_window("main") {
                        let _ = window.emit("global-keypress", category);
                    }
                }
                None
            },
        );

        eprintln!("[grow-pet] tap 결과: {:?}", tap.is_ok());

        match tap {
            Ok(tap) => {
                eprintln!("[grow-pet] CGEventTap 생성 성공 — RunLoop 시작");
                let loop_source = tap
                    .mach_port
                    .create_runloop_source(0)
                    .expect("CFRunLoopSource 생성 실패");
                let run_loop = CFRunLoop::get_current();
                run_loop.add_source(&loop_source, unsafe { kCFRunLoopCommonModes });
                tap.enable();
                CFRunLoop::run_current();
            }
            Err(e) => {
                eprintln!(
                    "[grow-pet] CGEventTap 생성 실패 (err: {:?}) — \
                    시스템 설정 > 개인 정보 보호 > 손쉬운 사용에서 앱을 허용해 주세요.",
                    e
                );
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.emit("accessibility-permission-needed", ());
                }
                std::process::Command::new("osascript")
                    .args([
                        "-e",
                        r#"display dialog "Grow Pet이 전역 키 입력을 감지하려면 '손쉬운 사용' 권한이 필요합니다.\n\n시스템 설정 > 개인 정보 보호 및 보안 > 손쉬운 사용에서 앱을 허용한 뒤 재시작해 주세요." buttons {"확인"} default button 1"#,
                    ])
                    .spawn()
                    .ok();
            }
        }
    });
}

// ── Windows / Linux ────────────────────────────────────────────────────────
#[cfg(not(target_os = "macos"))]
fn start_key_listener(app_handle: AppHandle) {
    use rdev::{listen, Event, EventType};
    std::thread::spawn(move || {
        let result = listen(move |event: Event| {
            if !LISTENING.load(Ordering::Relaxed) {
                return;
            }
            if let EventType::KeyPress(_) = event.event_type {
                let _ = app_handle.emit("global-keypress", "adventure");
            }
        });
        if let Err(e) = result {
            eprintln!("[grow-pet] 키 입력 감지 실패: {:?}", e);
        }
    });
}

// ── Tauri 커맨드 ───────────────────────────────────────────────────────────
#[tauri::command]
fn set_listening(enabled: bool) {
    LISTENING.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
fn move_overlay(app: tauri::AppHandle, label: String, x: f64, y: f64) {
    if let Some(w) = app.get_webview_window(&label) {
        let _ = w.set_position(tauri::PhysicalPosition {
            x: x as i32,
            y: y as i32,
        });
    }
}

#[tauri::command]
fn move_overlay_by(app: tauri::AppHandle, label: String, dx: i32, dy: i32) {
    if let Some(w) = app.get_webview_window(&label) {
        if let Ok(pos) = w.outer_position() {
            let _ = w.set_position(tauri::PhysicalPosition {
                x: pos.x + dx,
                y: pos.y + dy,
            });
        }
    }
}

#[tauri::command]
fn set_overlay_visible(app: tauri::AppHandle, visible: bool) {
    OVERLAY_VISIBLE.store(visible, Ordering::Relaxed);
    if visible {
        configure_overlay_windows(&app);
        reset_overlay_positions(&app);
    }
    for w in overlay_windows(&app) {
        let _ = if visible { w.show() } else { w.hide() };
    }
}

#[tauri::command]
fn focus_main(app: tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.set_focus();
    }
}

#[tauri::command]
fn check_accessibility() -> bool {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            #[link(name = "ApplicationServices", kind = "framework")]
            extern "C" {
                fn AXIsProcessTrustedWithOptions(options: *const std::ffi::c_void) -> bool;
            }
            AXIsProcessTrustedWithOptions(std::ptr::null())
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

fn monitor_bounds(monitor: &tauri::Monitor) -> (f64, f64, f64, f64) {
    let position = monitor.position();
    let size = monitor.size();
    let scale = monitor.scale_factor();

    (
        position.x as f64 / scale,
        position.y as f64 / scale,
        size.width as f64 / scale,
        size.height as f64 / scale,
    )
}

fn friend_overlay_label(index: usize) -> String {
    format!("overlay-friend-{}", index)
}

fn overlay_labels() -> Vec<String> {
    let mut labels = vec!["overlay".to_string()];
    labels.extend((0..FRIEND_OVERLAY_COUNT).map(friend_overlay_label));
    labels
}

fn overlay_windows(app: &tauri::AppHandle) -> Vec<tauri::WebviewWindow> {
    overlay_labels()
        .into_iter()
        .filter_map(|label| app.get_webview_window(&label))
        .collect()
}

#[cfg(target_os = "macos")]
fn apply_macos_overlay_style(window: &tauri::WebviewWindow) {
    use core_graphics::display::CGShieldingWindowLevel;
    use objc::{msg_send, sel, sel_impl};
    use objc::runtime::Object;

    const NS_WINDOW_COLLECTION_BEHAVIOR_CAN_JOIN_ALL_SPACES: usize = 1 << 0;
    const NS_WINDOW_COLLECTION_BEHAVIOR_TRANSIENT: usize = 1 << 3;
    const NS_WINDOW_COLLECTION_BEHAVIOR_STATIONARY: usize = 1 << 4;
    const NS_WINDOW_COLLECTION_BEHAVIOR_IGNORES_CYCLE: usize = 1 << 6;
    const NS_WINDOW_COLLECTION_BEHAVIOR_FULL_SCREEN_AUXILIARY: usize = 1 << 8;
    const NS_WINDOW_STYLE_MASK_UTILITY_WINDOW: usize = 1 << 4;
    const NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL: usize = 1 << 7;
    const NS_WINDOW_ANIMATION_BEHAVIOR_NONE: i64 = 2;

    let Ok(ns_window) = window.ns_window() else {
        return;
    };
    let ns_window = ns_window as *mut Object;

    unsafe {
        let current_style_mask: usize = msg_send![ns_window, styleMask];
        let next_style_mask = current_style_mask
            | NS_WINDOW_STYLE_MASK_UTILITY_WINDOW
            | NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL;
        let _: () = msg_send![ns_window, setStyleMask: next_style_mask];

        let current_behavior: usize = msg_send![ns_window, collectionBehavior];
        let next_behavior = current_behavior
            | NS_WINDOW_COLLECTION_BEHAVIOR_CAN_JOIN_ALL_SPACES
            | NS_WINDOW_COLLECTION_BEHAVIOR_TRANSIENT
            | NS_WINDOW_COLLECTION_BEHAVIOR_STATIONARY
            | NS_WINDOW_COLLECTION_BEHAVIOR_IGNORES_CYCLE
            | NS_WINDOW_COLLECTION_BEHAVIOR_FULL_SCREEN_AUXILIARY;
        let _: () = msg_send![ns_window, setCollectionBehavior: next_behavior];
        let _: () = msg_send![ns_window, setLevel: CGShieldingWindowLevel() as i64 + 1];
        let _: () = msg_send![ns_window, setAnimationBehavior: NS_WINDOW_ANIMATION_BEHAVIOR_NONE];
        let _: () = msg_send![ns_window, setCanHide: false];
        let _: () = msg_send![ns_window, setHidesOnDeactivate: false];
        let _: () = msg_send![ns_window, setReleasedWhenClosed: false];
        let _: () = msg_send![ns_window, orderFrontRegardless];
    }
}

#[cfg(not(target_os = "macos"))]
fn apply_macos_overlay_style(_window: &tauri::WebviewWindow) {}

fn configure_overlay_window(w: &tauri::WebviewWindow) {
    let _ = w.set_focusable(false);
    let _ = w.set_visible_on_all_workspaces(true);
    let _ = w.set_always_on_top(true);
    let _ = w.set_size(tauri::LogicalSize {
        width: OVERLAY_WIDTH,
        height: OVERLAY_HEIGHT,
    });
    apply_macos_overlay_style(w);
}

fn configure_overlay_windows(app: &tauri::AppHandle) {
    for w in overlay_windows(app) {
        configure_overlay_window(&w);
    }
}

fn reset_overlay_positions(app: &tauri::AppHandle) {
    let Some(monitor) = app.primary_monitor().ok().flatten() else {
        for (index, w) in overlay_windows(app).into_iter().enumerate() {
            let _ = w.set_position(tauri::LogicalPosition {
                x: 1200.0 - OVERLAY_WIDTH - OVERLAY_MARGIN - index as f64 * 86.0,
                y: 800.0 - OVERLAY_HEIGHT - OVERLAY_MARGIN,
            });
        }
        return;
    };

    let position = monitor.position();
    let size = monitor.size();
    let scale = monitor.scale_factor();
    let overlay_width = OVERLAY_WIDTH * scale;
    let overlay_height = OVERLAY_HEIGHT * scale;
    let margin = OVERLAY_MARGIN * scale;

    for (index, w) in overlay_windows(app).into_iter().enumerate() {
        let _ = w.set_position(tauri::PhysicalPosition {
            x: (position.x as f64 + size.width as f64 - overlay_width - margin
                - index as f64 * 86.0 * scale) as i32,
            y: (position.y as f64 + size.height as f64 - overlay_height - margin) as i32,
        });
    }
}

#[cfg(target_os = "macos")]
fn start_overlay_keeper(app: tauri::AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_millis(700));
        if !OVERLAY_VISIBLE.load(Ordering::Relaxed) {
            continue;
        }
        let app_for_main = app.clone();
        let _ = app.run_on_main_thread(move || {
            configure_overlay_windows(&app_for_main);
        });
    });
}

#[cfg(not(target_os = "macos"))]
fn start_overlay_keeper(_app: tauri::AppHandle) {}

// ── 앱 진입점 ──────────────────────────────────────────────────────────────
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // ── 오버레이 윈도우 생성 ───────────────────────────
            let (screen_x, screen_y, screen_width, screen_height) = app
                .primary_monitor()
                .ok()
                .flatten()
                .map(|monitor| monitor_bounds(&monitor))
                .unwrap_or((0.0, 0.0, 1200.0, 800.0));

            for (index, label) in overlay_labels().into_iter().enumerate() {
                let overlay = WebviewWindowBuilder::new(
                    app,
                    label.clone(),
                    WebviewUrl::App("overlay.html".into()),
                )
                .title(format!("grow-pet-{}", label))
                .transparent(true)
                .decorations(false)
                .always_on_top(true)
                .visible_on_all_workspaces(true)
                .skip_taskbar(true)
                .focusable(false)
                .focused(false)
                .resizable(false)
                .inner_size(OVERLAY_WIDTH, OVERLAY_HEIGHT)
                .position(
                    screen_x + screen_width - OVERLAY_WIDTH - OVERLAY_MARGIN - index as f64 * 86.0,
                    screen_y + screen_height - OVERLAY_HEIGHT - OVERLAY_MARGIN,
                )
                .build()?;
                configure_overlay_window(&overlay);
            }

            // ── 딥링크 → 메인 윈도우 포워딩 ──────────────────
            let handle = app.handle().clone();
            app.listen("deep-link://new-url", move |event| {
                if let Some(main) = handle.get_webview_window("main") {
                    let _ = main.emit("deep-link-url", event.payload());
                }
            });

            // ── 글로벌 키 리스너 시작 ─────────────────────────
            eprintln!("[grow-pet] setup 완료 — start_key_listener 호출");
            let handle2 = app.handle().clone();
            start_key_listener(handle2);
            start_overlay_keeper(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_listening,
            move_overlay,
            move_overlay_by,
            set_overlay_visible,
            focus_main,
            check_accessibility,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
