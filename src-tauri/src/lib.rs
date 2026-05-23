use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Listener, Manager, WebviewUrl, WebviewWindowBuilder};  

static LISTENING: AtomicBool = AtomicBool::new(true);

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
            Err(e) => {
                eprintln!("[grow-pet] CGEventTap 생성 실패 (권한 확인 필요): {:?}", e);
            }
        }
    });
}

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

// 딥링크 콜백 URL을 오버레이가 아닌 메인 윈도우로 포워딩
#[tauri::command]
fn focus_main(app: tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
    // ── 오버레이 윈도우 생성 ──────────────────────────────
    let screen = app
        .primary_monitor()
        .ok()
        .flatten()
        .map(|m| m.size().clone());

    let (ox, oy) = screen
        .map(|s| (s.width as f64 - 160.0, s.height as f64 - 160.0))
        .unwrap_or((1760.0, 920.0));

    WebviewWindowBuilder::new(
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

    // ── 딥링크 이벤트 → 메인 윈도우로 전달 ──────────────
    let handle = app.handle().clone();
    app.listen("deep-link://new-url", move |event| {   // use tauri::Listener 추가하면 동작
        if let Some(main) = handle.get_webview_window("main") {
            let _ = main.emit("deep-link-url", event.payload());
        }
    });

    // ── 글로벌 키 리스너 ────────────────────────────────
    let handle2 = app.handle().clone();
    start_key_listener(handle2);

    Ok(())
})
        .invoke_handler(tauri::generate_handler![
            set_listening,
            move_overlay,
            move_overlay_by,
            set_overlay_visible,
            focus_main
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}