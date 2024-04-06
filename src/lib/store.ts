import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UnifiedAnalyzer } from "./analyzers/unified-analyzer";
import { LogEntry } from "./logging-utils";

export type NodeId = string;
type SystemId = string;
interface Node {
  id: NodeId;
  logEntries: LogEntry[];
  name: string;
}

interface System {
  id: SystemId;
  analyzer: UnifiedAnalyzer;
  nodes: NodeId[];
}

interface AnalysisState {
  system: System;
  nodes: Record<NodeId, Node>;

  addNode: (nodeId: string, nodeName: string) => void;
  removeNode: (nodeId: string) => void;
  addLogEntry: (nodeId: string, entry: LogEntry) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  immer((set) => ({
    system: {
      id: "system1",
      analyzer: new UnifiedAnalyzer(),
      nodes: [],
    },
    nodes: {},

    addNode: (nodeId, nodeName) => {
      set((state) => {
        // Create a new node with empty log entries
        state.nodes[nodeId] = { id: nodeId, logEntries: [], name: nodeName };
        // Add the node ID to the system's node list
        state.system.nodes.push(nodeId);
      });
    },

    removeNode: (nodeId) => {
      set((state) => {
        // Remove the node from the system's node list
        state.system.nodes = state.system.nodes.filter((id) => id !== nodeId);
        // Delete the node from the nodes record
        delete state.nodes[nodeId];
      });
    },

    addLogEntry: (nodeId, entry) => {
      set((state) => {
        // Add the log entry to the specified node
        const node = state.nodes[nodeId];
        if (node) {
          node.logEntries.push(entry);
          // Recalculate analyzers for the node (assuming an appropriate method on UnifiedAnalyzer)
          state.system.analyzer.update(nodeId, entry);
        }
      });
    },
  }))
);
