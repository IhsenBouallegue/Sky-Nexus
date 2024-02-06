// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;

use std::time::Duration;

use tauri::{Manager, Window};

use futures_util::stream::StreamExt;
use tauri::command;
use tokio::net::{TcpListener, UdpSocket};
use tokio::time::Instant;
use tokio_tungstenite::accept_async;

const SERVER_DISCOVERY_MSG: &str = "WebSocketServer";
const CLIENT_DISCOVERY_MSG: &str = "Connected";

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

#[command]
async fn connect() {
    let broadcast_addr = "192.168.1.255:8080";
    let socket = UdpSocket::bind("0.0.0.0:8080")
        .await
        .expect("Failed to bind UDP socket");
    socket
        .set_broadcast(true)
        .expect("Failed to set socket to broadcast mode");

    let mut count = 3;
    while count > 0 {
        let start_time = Instant::now();
        println!("Searching for Client");
        while start_time.elapsed() < Duration::from_secs(1) {
            let _ = socket
                .send_to(SERVER_DISCOVERY_MSG.as_bytes(), broadcast_addr)
                .await;
            let mut buffer = [0; 1024];
            match socket.recv_from(&mut buffer).await {
                Ok((size, _)) => {
                    let message = std::str::from_utf8(&buffer[..size]).unwrap_or("");
                    if message.trim() == CLIENT_DISCOVERY_MSG {
                        println!("Client Connected");
                        break;
                    }
                }
                Err(_) => {
                    println!("Error occurred");
                    break;
                }
            }
        }
        count -= 1;
    }

    println!("No Client Found");
}

fn main() {
    tauri::Builder::default()
        .setup(setup)
        .invoke_handler(tauri::generate_handler![start_websocket_server, connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup<'a>(app: &'a mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    tauri::async_runtime::spawn(start_websocket_server(app.get_window("main").unwrap()));
    // let _ = add_firewall_rule_with_elevation();
    Ok(())
}

// fn add_firewall_rule_with_elevation() -> std::io::Result<()> {
//     // The name of the firewall rule to check for
//     let rule_name = "TauriAppInboundRule";

//     // Command to check if the firewall rule already exists
//     let check_command_output = Command::new("netsh")
//         .args([
//             "advfirewall",
//             "firewall",
//             "show",
//             "rule",
//             "name=",
//             rule_name,
//         ])
//         .output()?;

//     // Convert the output to a string for analysis
//     let check_output_str = std::str::from_utf8(&check_command_output.stdout).unwrap_or("");

//     // Check if the rule already exists by looking for the rule name in the output
//     if !check_output_str.contains(rule_name) {
//         // The rule does not exist, so create it
//         let powershell_script = format!(
//             "Start-Process netsh -ArgumentList 'advfirewall firewall add rule name=\"{}\" dir=in action=allow protocol=TCP localport=8080' -Verb RunAs",
//             rule_name
//         );

//         // Execute the PowerShell command to create the rule with elevation
//         Command::new("powershell")
//             .args(["-Command", &powershell_script])
//             .output()?;

//         println!("Firewall rule '{}' has been added.", rule_name);
//     } else {
//         // The rule already exists
//         println!(
//             "Firewall rule '{}' already exists. No action taken.",
//             rule_name
//         );
//     }

//     Ok(())
// }
