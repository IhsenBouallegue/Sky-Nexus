import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { LogEntry } from "./logging-utils";

interface AnalysisState {
  logData: Record<string, LogEntry[]>;
  setLogData: (logData: Record<string, LogEntry[]>) => void;
  addLogEntries: (logs: string, entries: LogEntry[]) => void;
  addLogEntry: (logs: string, entry: LogEntry) => void;
  removeLogEntries: (logs: string) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  immer((set) => ({
    logData: {},
    setLogData: (logData) => set({ logData }),
    addLogEntries: (logs: string, entries: LogEntry[]) => {
      set((state) => {
        state.logData[logs] = entries;
      });
    },
    removeLogEntries: (logs: string) => {
      set((state) => {
        delete state.logData[logs];
      });
    },
    addLogEntry: (logs: string, entry: LogEntry) => {
      set((state) => {
        if (!state.logData[logs]) {
          state.logData[logs] = [];
        }
        state.logData[logs].push(entry);
      });
    },
  }))
);
