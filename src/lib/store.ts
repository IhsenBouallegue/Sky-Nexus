import { create } from "zustand";
import { LogEntry } from "./logging-utils";

interface AnalysisState {
  logData: Record<string, LogEntry[]>;
  setLogData: (logData: Record<string, LogEntry[]>) => void;
  addLogEntries: (logs: string, entries: LogEntry[]) => void;
  removeLogEntries: (logs: string) => void;
}

export const useAnalysisStore = create<AnalysisState>()((set) => ({
  logData: {},
  setLogData: (logData) => set({ logData }),
  addLogEntries: (logs: string, entries: LogEntry[]) => {
    set((state) => {
      const logData = { ...state.logData };
      logData[logs] = entries;
      return { logData };
    });
  },
  removeLogEntries: (logs: string) => {
    set((state) => {
      const logData = { ...state.logData };
      delete logData[logs];
      return { logData };
    });
  },
}));
