// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;

use std::sync::Arc;

use tauri::Manager;
use tokio::time::sleep;

use crate::utils::mavlink_utils::{create_groundstation_mavlink, MavlinkHeaderGenerator};

fn main() {
    tauri::Builder::default()
        .setup(setup)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup<'a>(app: &'a mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // This one
    let handle = app.handle();

    // let mavconn = create_groundstation_mavlink();
    // let mavconn = Arc::new(mavconn);
    // let mavconn_clone = mavconn.clone();
    // tauri::async_runtime::spawn(async move {
    //     let generator = MavlinkHeaderGenerator::new();

    //     loop {
    //         let heartbeat = generator.create_mavlink_heartbeat_frame();
    //         mavconn_clone.send_frame(&heartbeat).unwrap();
    //         println!(
    //             "Sent mavlink heartbeat frame with sequence: {:?}",
    //             heartbeat.header.sequence
    //         );
    //         sleep(std::time::Duration::from_millis(1000)).await;
    //     }
    // });
    // let mavconn_clone2 = mavconn.clone();
    // tauri::async_runtime::spawn(async move {
    //     println!("Created MAVLink connection");
    //     loop {
    //         let mav_frame = mavconn_clone2.recv_frame().unwrap();
    //         println!("Received mavlink frame: {:?}", mav_frame);
    //         handle.emit_all("uav_message", mav_frame).unwrap();
    //     }
    // });
    Ok(())
}
