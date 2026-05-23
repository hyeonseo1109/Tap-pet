use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter};

static LISTENING: AtomicBool = AtomicBool::new(true);

#[cfg(target_os = "macos")]
fn start_key_listener(app_handle: AppHandle) {
    use core_foundation::runloop::{kCFRunLoopCommonModes, CFRunLoop};
    use core_graphics::event::{CGEventTap, CGEventTapLocation, CGEventTapPlacement, CGEventTapOptions, CGEventType};

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle().clone();
            start_key_listener(handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_listening])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}