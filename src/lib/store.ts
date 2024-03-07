import { Event, listen } from "@tauri-apps/api/event";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  AnalysisStateResults,
  UnifiedLogEntryAnalyzer,
} from "./analyzers/unified-analyzer";
import { LogEntry } from "./logging-utils";

interface AnalysisState {
  analyzers: Record<string, UnifiedLogEntryAnalyzer>;
  results: Record<string, Partial<AnalysisStateResults>>;
  // Methods to manage data sources and their analyses
  addDataSource: (sourceId: string) => void;
  removeDataSource: (sourceId: string) => void;
  updateLogEntry: (sourceId: string, entry: LogEntry) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  immer((set, get) => ({
    analyzers: {},
    results: {},

    addDataSource: (sourceId: string) => {
      set((state) => {
        state.analyzers[sourceId] = new UnifiedLogEntryAnalyzer();
      });
    },

    removeDataSource: (sourceId: string) => {
      set((state) => {
        delete state.analyzers[sourceId];
        delete state.results[sourceId];
      });
    },

    updateLogEntry: (sourceId: string, entry: LogEntry) => {
      const analyzer = get().analyzers[sourceId];
      if (analyzer) {
        analyzer.updateLogEntry(entry);
        set((state) => {
          state.results[sourceId] = analyzer.aggregateResults();
        });
      }
    },
  }))
);

listen("message", (event: Event<[string, string]>) => {
  const [logEntryJson, sourceId] = event.payload;
  const logEntry: LogEntry = JSON.parse(logEntryJson);
  const store = useAnalysisStore.getState();
  if (!store.analyzers[sourceId]) {
    store.addDataSource(sourceId);
  }
  store.updateLogEntry(sourceId, logEntry);
});
