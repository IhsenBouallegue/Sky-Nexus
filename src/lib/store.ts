import { create } from "zustand";
import { LogEntry } from "./logging-utils";

interface AnalysisState {
  logEntries: LogEntry[];
  setLogEntries: (logEntries: LogEntry[]) => void;
}

export const useAnalysisStore = create<AnalysisState>()((set) => ({
  logEntries: [],
  setLogEntries: (logEntries) => set({ logEntries }),
}));
