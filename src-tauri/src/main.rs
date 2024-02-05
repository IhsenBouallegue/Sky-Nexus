// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;

use tauri::{Manager, Window};

use futures_util::stream::StreamExt;
use tauri::command;
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;

#[command]
async fn start_websocket_server(window: Window) {
    let try_socket = TcpListener::bind("0.0.0.0:8080").await;
    let listener = try_socket.expect("Failed to bind");
    println!("WebSocket Server listening on ws://0.0.0.0:8080");

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection(window.clone(), stream));
    }
}

async fn handle_connection(window: Window, stream: tokio::net::TcpStream) {
    if let Ok(ws_stream) = accept_async(stream).await {
        let (_write, mut read) = ws_stream.split();
        while let Some(message) = read.next().await {
            if let Ok(msg) = message {
                // Echo the message back or handle accordingly
                println!("Received message: {}", msg.to_string());
                window
                    .emit("message", msg.to_string())
                    .expect("Failed to emit message");
                // write.send(msg).await.unwrap();
            }
        }
    }
}

fn main() {
    tauri::Builder::default()
        .setup(setup)
        .invoke_handler(tauri::generate_handler![start_websocket_server])
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
