use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Listener, Manager, WebviewUrl, WebviewWindowBuilder};

static LISTENING: AtomicBool = AtomicBool::new(true);

// ── macOS ──────────────────────────────────────────────────────────────────
#[cfg(target_os = "macos")]
fn start_key_listener(app_handle: AppHandle) {
    use core_foundation::runloop::{kCFRunLoopCommonModes, CFRunLoop};
    use core_graphics::event::{
        CGEventTap, CGEventTapLocation, CGEventTapOptions, CGEventTapPlacement, CGEventType,
    };

    // CGEventTap은 반드시 CFRunLoop가 살아있는 스레드에서 생성+실행해야 함.
    // 메인 스레드 RunLoop를 직접 쓰면 UI가 블로킹되므로,
    // 새 스레드에서 CFRunLoop::run_current()로 독립 RunLoop를 돌린다.
    // (HID tap은 메인 스레드 제약 없음 — SessionEventTap만 메인 필요)
    std::thread::spawn(move || {
        let handle_clone = app_handle.clone();

        let tap = CGEventTap::new(
            CGEventTapLocation::HID,
            CGEventTapPlacement::HeadInsertEventTap,
            CGEventTapOptions::ListenOnly,
            vec![CGEventType::KeyDown],
            move |_, _, _| {
                if LISTENING.load(Ordering::Relaxed) {
                    let _ = handle_clone.emit("global-keypress", ());
                }
                None
            },
        );

        match tap {
            Ok(tap) => {
                let loop_source = tap
                    .mach_port
                    .create_runloop_source(0)
                    .expect("CFRunLoopSource 생성 실패");
                let run_loop = CFRunLoop::get_current();
                run_loop.add_source(&loop_source, unsafe { kCFRunLoopCommonModes });
                tap.enable();
                // 이 스레드의 RunLoop를 영구 구동 — 키 이벤트 수신 루프
                CFRunLoop::run_current();
            }
            Err(_) => {
                eprintln!(
                    "[grow-pet] CGEventTap 생성 실패 — \
                     시스템 설정 > 개인 정보 보호 > 손쉬운 사용에서 앱을 허용해 주세요."
                );
                // 사용자에게 안내 다이얼로그
                let _ = app_handle.emit("accessibility-permission-needed", ());
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
                let _ = app_handle.emit("global-keypress", ());
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
fn move_overlay(app: tauri::AppHandle, x: f64, y: f64) {
    if let Some(w) = app.get_webview_window("overlay") {
        let _ = w.set_position(tauri::PhysicalPosition {
            x: x as i32,
            y: y as i32,
        });
    }
}

#[tauri::command]
fn move_overlay_by(app: tauri::AppHandle, dx: i32, dy: i32) {
    if let Some(w) = app.get_webview_window("overlay") {
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
    if let Some(w) = app.get_webview_window("overlay") {
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

// ── 앱 진입점 ──────────────────────────────────────────────────────────────
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // ── 오버레이 윈도우 생성 ───────────────────────────
            let screen = app
                .primary_monitor()
                .ok()
                .flatten()
                .map(|m| m.size().clone());

            let (ox, oy) = screen
                .map(|s| (s.width as f64 - 200.0, s.height as f64 - 200.0))
                .unwrap_or((1760.0, 880.0));

            // ★ 핵심: _ 로 받으면 즉시 drop됨 → 반드시 변수명으로 바인딩
            // Tauri가 내부적으로 윈도우를 관리하므로 _overlay는 경고 억제용
            let _overlay = WebviewWindowBuilder::new(
                app,
                "overlay",
                WebviewUrl::App("overlay.html".into()),
            )
            .title("grow-pet-overlay")
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .inner_size(200.0, 200.0)
            .position(ox, oy)
            .build()?;

            // ── 딥링크 → 메인 윈도우 포워딩 ──────────────────
            let handle = app.handle().clone();
            app.listen("deep-link://new-url", move |event| {
                if let Some(main) = handle.get_webview_window("main") {
                    let _ = main.emit("deep-link-url", event.payload());
                }
            });

            // ── 글로벌 키 리스너 시작 ─────────────────────────
            let handle2 = app.handle().clone();
            start_key_listener(handle2);

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