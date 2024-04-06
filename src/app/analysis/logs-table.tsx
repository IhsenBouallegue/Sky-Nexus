import LogEntriesDataTable from "@/components/data-table";
import { columns } from "@/components/data-table/columns";
import { NodeId, useAnalysisStore } from "@/lib/store";

export default function LogsTable({ nodeId }: { nodeId: NodeId }) {
  const nodes = useAnalysisStore((state) => state.nodes);

  return <LogEntriesDataTable data={nodes[nodeId].logEntries} columns={columns} />;
}
