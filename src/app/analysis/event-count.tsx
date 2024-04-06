import AnalysisBarChart from "@/components/bar-chart";
import { AnalyzerKeys } from "@/lib/analyzers/unified-analyzer";
import { NodeId, useAnalysisStore } from "@/lib/store";

export default function EventCount({ nodeId }: { nodeId: NodeId }) {
  const system = useAnalysisStore((state) => state.system);

  return (
    <div className="flex gap-12 min-w-fit">
      {Object.entries(system.analyzer.getAnalyzerResult(AnalyzerKeys.EventCount)?.[nodeId] || {}).map(
        ([driver, data]) => (
          <AnalysisBarChart key={driver} chartTitle={`${driver} Events Count`} data={data} />
        )
      )}
    </div>
  );
}
