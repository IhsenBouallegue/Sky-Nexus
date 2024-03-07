// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures_util::stream::StreamExt;
use mavlink_network_node::discover::DiscoveryService;

use tauri::command;
use tauri::{Manager, Window};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;

fn main() {
    let (discovery_service, _discovery_notifier) = DiscoveryService::new();
    tauri::async_runtime::spawn(async move {
        discovery_service.listen().await;
    });

    tauri::Builder::default()
        .setup(setup)
        .invoke_handler(tauri::generate_handler![start_websocket_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup<'a>(app: &'a mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    tauri::async_runtime::spawn(start_websocket_server(app.get_window("main").unwrap()));
    Ok(())
}

#[command]
async fn start_websocket_server(window: Window) {
    let try_socket = TcpListener::bind("0.0.0.0:8080").await;
    let listener = try_socket.expect("Failed to bind");
    println!("WebSocket Server listening on ws://0.0.0.0:8080");

    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(window.clone(), stream, addr));
    }
}

async fn handle_connection(
    window: Window,
    stream: tokio::net::TcpStream,
    addr: std::net::SocketAddr,
) {
    if let Ok(ws_stream) = accept_async(stream).await {
        let (_write, mut read) = ws_stream.split();
        while let Some(message) = read.next().await {
            if let Ok(msg) = message {
                println!("Received message: {}", msg.to_string());
                window
                    .emit("message", (msg.to_string(), addr.to_string()))
                    .expect("Failed to emit message");
            }
        }
    }
}
