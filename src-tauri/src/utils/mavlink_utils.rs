use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

use mavlink::ardupilotmega::MavMessage;
use mavlink::MavHeader;

use super::types::{MavDevice, MavFramePacket};

const GROUNDSATION_IP: &str = "0.168.1.150";
const QGROUNDCONTROL_PORT: &str = "14550";

/// Create mavlink connection from groundstation
pub fn create_groundstation_mavlink() -> MavDevice {
    let mut mavconn = mavlink::connect::<MavMessage>(
        format!("udpin:{}:{}", "0.0.0.0", QGROUNDCONTROL_PORT).as_str(),
    )
    .unwrap();
    mavconn.set_protocol_version(mavlink::MavlinkVersion::V2);
    mavconn
}

/// Create a heartbeat message using 'ardupilotmega' dialect
pub fn heartbeat_message() -> MavMessage {
    MavMessage::HEARTBEAT(mavlink::ardupilotmega::HEARTBEAT_DATA {
        custom_mode: 0,
        mavtype: mavlink::ardupilotmega::MavType::MAV_TYPE_GCS,
        autopilot: mavlink::ardupilotmega::MavAutopilot::MAV_AUTOPILOT_INVALID,
        base_mode: mavlink::ardupilotmega::MavModeFlag::empty(),
        system_status: mavlink::ardupilotmega::MavState::MAV_STATE_UNINIT,
        mavlink_version: 0x3,
    })
}

// /// Create a message requesting the parameters list
// pub fn request_parameters() -> MavMessage {
//     MavMessage::PARAM_REQUEST_LIST(mavlink::ardupilotmega::PARAM_REQUEST_LIST_DATA {
//         target_system: 1,
//         target_component: 1,
//     })
// }

// /// Create a message enabling data streaming
// pub fn request_stream() -> MavMessage {
//     mavlink::ardupilotmega::MavMessage::REQUEST_DATA_STREAM(mavlink::ardupilotmega::REQUEST_DATA_STREAM_DATA {
//         target_system: 0,
//         target_component: 0,
//         req_stream_id: 0,
//         req_message_rate: 10,
//         start_stop: 1,
//     })
// }

pub fn deserialize_frame(buffer: &[u8]) -> Option<MavFramePacket> {
    let mavlink_frame_result = MavFramePacket::deser(mavlink::MavlinkVersion::V2, buffer);
    match mavlink_frame_result {
        Ok(mavlink_frame) => Some(mavlink_frame),
        Err(_) => {
            println!("Failed to deserialize mavlink frame: {:?}", buffer);
            None
        }
    }
}

pub fn mavlink_receive(mavlink_device: MavDevice) -> Option<MavFramePacket> {
    let mut mavlink_frame: Option<MavFramePacket> = None;

    match mavlink_device.recv_frame() {
        Ok(size) => mavlink_frame,
        Err(err) => None,
    }
}

pub fn mavlink_send(mavlink_device: &MavDevice, mavlink_frame: &MavFramePacket) {
    mavlink_device.send_frame(&mavlink_frame).unwrap();
}

pub struct MavlinkHeaderGenerator {
    sequence: AtomicUsize,
}

impl MavlinkHeaderGenerator {
    pub fn new() -> MavlinkHeaderGenerator {
        MavlinkHeaderGenerator {
            sequence: AtomicUsize::new(0),
        }
    }

    fn create_mavlink_header(&self) -> MavHeader {
        let system_id = 244;

        let sequence = self.sequence.fetch_add(1, Ordering::SeqCst);

        MavHeader {
            sequence: sequence as u8,
            system_id: system_id,
            component_id: 1,
        }
    }

    pub fn create_mavlink_heartbeat_frame(&self) -> MavFramePacket {
        MavFramePacket {
            header: self.create_mavlink_header(),
            msg: heartbeat_message(),
            protocol_version: mavlink::MavlinkVersion::V2,
        }
    }
}
