"use client";

import FileUploader from "@/components/file-uploader";
import Title from "@/components/title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyzerKeys } from "@/lib/analyzers/unified-analyzer";
import { useAnalysisStore } from "@/lib/store";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const system = useAnalysisStore((state) => state.system);
  const nodes = useAnalysisStore((state) => state.nodes);
  const removeNode = useAnalysisStore((state) => state.removeNode);

  const router = useRouter();
  return (
    <div className="flex flex-col p-6 w-full">
      <Title>System View</Title>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col ">
          <h2 className="text-xl font-semibold ">System ID: {system.id}</h2>
          <h3 className="text-md text-muted">
            Packet Delivery Rate:{" "}
            {system.analyzer.getAnalyzerResult(AnalyzerKeys.PacketDeliveryRatio)?.ratio.toPrecision(2) || 0}
          </h3>
        </div>
        <FileUploader />
        <div className="flex gap-6">
          {system.nodes.map((nodeId) => (
            <Card key={nodeId} className="w-64" onDoubleClick={() => router.push("/analysis")}>
              <CardHeader className="relative">
                <CardTitle>{nodes[nodeId].name}</CardTitle>
                <CardDescription className="text-muted text-xs">{nodeId}</CardDescription>
                <Button
                  onClick={() => removeNode(nodeId)}
                  variant="destructive"
                  size="icon"
                  className="w-6 h-6 absolute right-4 top-2"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {system.analyzer.getAnalyzerResult(AnalyzerKeys.NodeRssi) && (
                  <p>
                    RSSI:{" "}
                    {system.analyzer.getAnalyzerResult(AnalyzerKeys.NodeRssi)![nodeId].averageRssi?.toPrecision(2) ||
                      "0"}{" "}
                    dbm
                  </p>
                )}
                {system.analyzer.getAnalyzerResult(AnalyzerKeys.NodeSnr) && (
                  <p>
                    SNR:{" "}
                    {system.analyzer.getAnalyzerResult(AnalyzerKeys.NodeSnr)![nodeId].averageSnr?.toPrecision(2) ||
                      "0"}{" "}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted">Double click to view analysis...</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
