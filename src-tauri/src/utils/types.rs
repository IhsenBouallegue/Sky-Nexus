use mavlink::ardupilotmega::MavMessage;
use mavlink::{MavConnection, MavFrame};

pub type MavDevice = Box<dyn MavConnection<MavMessage> + Send + Sync>;

pub type MavFramePacket = MavFrame<MavMessage>;
