"use client";

import Title from "@/components/title";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RECEIVE_PACKET_MSG, SEND_PACKET_MSG } from "@/lib/events";
import { useAnalysisStore } from "@/lib/store";
import { XIcon } from "lucide-react";
import FileUploader from "../../components/file-uploader";
import { ChannelActivity } from "./channel-activity";
import EventCount from "./event-count";
import LogsTable from "./logs-table";
import MessageTypes from "./message-types";
import NetworkTimeline from "./network-timeline";

export default function Page() {
  const systemNodes = useAnalysisStore((state) => state.system.nodes);
  const removeNode = useAnalysisStore((state) => state.removeNode);
  return (
    <div className="flex flex-col p-6 w-full">
      <Title>Log Event Analysis</Title>
      <Tabs defaultValue="account">
        <div className="flex justify-between w-full gap-4">
          <TabsList className="w-full justify-start">
            {systemNodes.map((nodeId) => (
              <TabsTrigger key={nodeId} value={nodeId}>
                {nodeId}
                <Button onClick={() => removeNode(nodeId)} variant="destructive" size="icon" className="w-6 h-6 ml-2">
                  <XIcon className="w-4 h-4" />
                </Button>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-4">
            <FileUploader />
          </div>
        </div>
        {systemNodes.map((nodeId) => (
          <TabsContent key={nodeId} value={nodeId}>
            <div className="flex flex-col gap-12">
              <ChannelActivity nodeId={nodeId} />
              <EventCount nodeId={nodeId} />
              {[RECEIVE_PACKET_MSG, SEND_PACKET_MSG].map((event) => (
                <MessageTypes key={event} nodeId={nodeId} event={event} />
              ))}
              <NetworkTimeline nodeId={nodeId} />
              <LogsTable nodeId={nodeId} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
