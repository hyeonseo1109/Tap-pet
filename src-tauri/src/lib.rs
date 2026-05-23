use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Listener, Manager, WebviewUrl, WebviewWindowBuilder};

static LISTENING: AtomicBool = AtomicBool::new(true);

// ── macOS: CGEventTap ──────────────────────────────────────────────────────
#[cfg(target_os = "macos")]
fn check_accessibility_permission() -> bool {
    use core_graphics::event::CGEventTap;
    // AXIsProcessTrusted() 대신 실제 tap 생성 시도로 권한 확인
    // trusted_with_prompt = true 로 시스템 팝업 유도
    unsafe {
        // AXIsProcessTrustedWithOptions FFI
        #[link(name = "ApplicationServices", kind = "framework")]
        extern "C" {
            fn AXIsProcessTrustedWithOptions(options: *const std::ffi::c_void) -> bool;
        }

        // CFDictionary 없이 NULL 넘기면 팝업 없이 확인만
        // 팝업을 띄우려면 kAXTrustedCheckOptionPrompt = true 딕셔너리 필요
        // 간단히: NULL → 현재 상태만 반환
        AXIsProcessTrustedWithOptions(std::ptr::null())
    }
}

#[cfg(target_os = "macos")]
fn request_accessibility_permission() {
    // 시스템 설정 > 개인 정보 보호 > 손쉬운 사용 팝업 띄우기
    std::process::Command::new("osascript")
        .args([
            "-e",
            r#"tell application "System Events" to display dialog "Grow Pet이 전역 키 입력을 감지하려면 '손쉬운 사용' 권한이 필요합니다.\n\n시스템 설정 > 개인 정보 보호 및 보안 > 손쉬운 사용에서 앱을 허용해 주세요." buttons {"확인"} default button 1"#,
        ])
        .spawn()
        .ok();
}

#[cfg(target_os = "macos")]
fn start_key_listener(app_handle: AppHandle) {
    use core_foundation::runloop::{kCFRunLoopCommonModes, CFRunLoop};
    use core_graphics::event::{
        CGEventTap, CGEventTapLocation, CGEventTapOptions, CGEventTapPlacement, CGEventType,
    };

    std::thread::spawn(move || {
        let tap = CGEventTap::new(
            CGEventTapLocation::HID,
            CGEventTapPlacement::HeadInsertEventTap,
            CGEventTapOptions::ListenOnly,
            vec![CGEventType::KeyDown],
            move |_, _, _| {
                if LISTENING.load(Ordering::Relaxed) {
                    let _ = app_handle.emit("global-keypress", ());
                }
                None
            },
        );

        match tap {
            Ok(tap) => {
                let loop_source = tap.mach_port.create_runloop_source(0).unwrap();
                let run_loop = CFRunLoop::get_current();
                run_loop.add_source(&loop_source, unsafe { kCFRunLoopCommonModes });
                tap.enable();
                CFRunLoop::run_current();
            }
            Err(_) => {
                eprintln!("[grow-pet] CGEventTap 생성 실패 → 손쉬운 사용 권한을 확인하세요");
                request_accessibility_permission();
            }
        }
    });
}

// ── Windows / Linux: rdev ──────────────────────────────────────────────────
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

/// macOS: 손쉬운 사용 권한 여부 반환 (프론트에서 권한 안내 UI 표시용)
#[tauri::command]
fn check_accessibility() -> bool {
    #[cfg(target_os = "macos")]
    {
        check_accessibility_permission()
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
                .map(|s| (s.width as f64 - 160.0, s.height as f64 - 160.0))
                .unwrap_or((1760.0, 920.0));

            let overlay = WebviewWindowBuilder::new(
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
            .inner_size(160.0, 160.0)
            .position(ox, oy)
            .build()?;

            // macOS: 클릭이 아래 앱으로 통과되도록 (마우스 드래그는 JS에서 직접 처리)
            // ignore_cursor_events는 드래그를 막으므로 사용 안 함
            // 대신 오버레이 배경을 투명하게 유지

            // ── 딥링크 → 메인 윈도우 포워딩 ──────────────────
            let handle = app.handle().clone();
            app.listen("deep-link://new-url", move |event| {
                if let Some(main) = handle.get_webview_window("main") {
                    let _ = main.emit("deep-link-url", event.payload());
                }
            });

            // ── 글로벌 키 리스너 ──────────────────────────────
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