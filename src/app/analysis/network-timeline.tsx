import GanttChart from "@/components/gantt-chart";
import { AnalyzerKeys } from "@/lib/analyzers/unified-analyzer";
import { NodeId, useAnalysisStore } from "@/lib/store";

export default function NetworkTimeline({ nodeId }: { nodeId: NodeId }) {
  const system = useAnalysisStore((state) => state.system);

  return (
    <div className="ml-6">
      <h3 className="text-2xl font-semibold mb-8">Network Timeline</h3>
      <GanttChart spans={system.analyzer.getAnalyzerResult(AnalyzerKeys.Span)?.[nodeId] || {}} />
    </div>
  );
}
