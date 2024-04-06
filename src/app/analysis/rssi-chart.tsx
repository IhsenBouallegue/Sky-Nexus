import TimeSeriesChart from "@/components/timeseries-chart";
import { AnalyzerKeys } from "@/lib/analyzers/unified-analyzer";
import { NodeId, useAnalysisStore } from "@/lib/store";

export default function RssiChart({ nodeId }: { nodeId: NodeId }) {
  const system = useAnalysisStore((state) => state.system);

  return (
    <div className="flex gap-12 min-w-fit">
      {system.analyzer.getAnalyzerResult(AnalyzerKeys.NodeRssi) && (
        <TimeSeriesChart
          chartTitle={`RSSI for Node ${nodeId}`}
          chartLines={[
            {
              dataKey: "sentMessages",
              dataPoints: system.analyzer.getAnalyzerResult(AnalyzerKeys.NodeRssi)![nodeId].rssiTimeSeries,
              color: "#f0932b",
              name: "RSSI",
            },
          ]}
        />
      )}
    </div>
  );
}
