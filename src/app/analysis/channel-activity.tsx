import TimeSeriesChart from "@/components/timeseries-chart";
import { AnalyzerKeys } from "@/lib/analyzers/unified-analyzer";
import { NodeId, useAnalysisStore } from "@/lib/store";

export function ChannelActivity({ nodeId }: { nodeId: NodeId }) {
  const system = useAnalysisStore((state) => state.system);
  return (
    <div className="flex gap-12 min-w-fit">
      {Object.entries(system.analyzer.getAnalyzerResult(AnalyzerKeys.ChannelActivity)?.[nodeId] || {}).map(
        ([driver, data]) => (
          <TimeSeriesChart
            key={driver}
            chartTitle={`Channels: ${driver} <-> Main`}
            chartLines={[
              {
                dataKey: "sentMessages",
                dataPoints: data.sentMessages,
                color: "#f0932b",
                name: `${driver} -> Main`,
              },
              {
                dataKey: "receivedMessages",
                dataPoints: data.receivedMessages,
                color: "#22a6b3",
                name: `${driver} <- Main`,
              },
              // {
              //   dataKey: "transmissions",
              //   dataPoints: transmissionCounts[logDataKey][driver],
              //   color: "#6ab04c",
              //   name: "Transmissions",
              //   type: "linear",
              //   dashed: true,
              // },
              // Transmission counts visualization can be added once implemented
            ]}
          />
        )
      )}
    </div>
  );
}
