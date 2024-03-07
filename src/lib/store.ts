import { Spans, extractSpans } from "@/components/gantt-chart";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  TransmissionRecord,
  countTransmissionsPerSecond,
} from "./logging-transmissions";
import {
  ChannelActivityRecord,
  EventCountRecord,
  LogEntry,
  MessageTypeCountRecord,
  analyzeChannelActivity,
  countLogEvents,
  countMessageTypes,
} from "./logging-utils";

interface AnalysisState {
  logData: Record<string, LogEntry[]>;
  channelActivity: Record<string, ChannelActivityRecord>;
  transmissionCounts: Record<string, TransmissionRecord>;
  eventCounts: Record<string, EventCountRecord>;
  messageTypeCounts: Record<string, MessageTypeCountRecord>;
  spans: Record<string, Spans>;
  setLogData: (logData: Record<string, LogEntry[]>) => void;
  addLogEntries: (logs: string, entries: LogEntry[]) => void;
  addLogEntry: (logs: string, entry: LogEntry) => void;
  removeLogEntries: (logs: string) => void;
  analyzeChannelActivity: (logDataKey: string) => void;
  countTransmissionsPerSecond: (logDataKey: string) => void;
  countLogEvents: (logDataKey: string) => void;
  countMessageTypes: (logDataKey: string, messageType: string) => void;
  extractSpans: (logDataKey: string) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  immer((set, get) => ({
    spans: {},
    eventCounts: {},
    messageTypeCounts: {},
    channelActivity: {},
    transmissionCounts: {},
    logData: {},
    setLogData: (logData) => set({ logData }),
    addLogEntries: (logs: string, entries: LogEntry[]) => {
      set((state) => {
        state.logData[logs] = entries;
      });
      get().analyzeChannelActivity(logs);
      get().countTransmissionsPerSecond(logs);
      get().countLogEvents(logs);
      get().extractSpans(logs);
    },
    removeLogEntries: (logs: string) => {
      set((state) => {
        delete state.logData[logs];
        delete state.channelActivity[logs];
        delete state.transmissionCounts[logs];
        delete state.eventCounts[logs];
        delete state.spans[logs];
      });
    },
    addLogEntry: (logs: string, entry: LogEntry) => {
      set((state) => {
        if (!state.logData[logs]) {
          state.logData[logs] = [];
        }
        state.logData[logs].push(entry);
      });
      get().analyzeChannelActivity(logs);
      get().countTransmissionsPerSecond(logs);
      get().countLogEvents(logs);
      get().extractSpans(logs);
    },
    analyzeChannelActivity: (logDataKey) => {
      set((state) => {
        if (!state.logData[logDataKey]) return;
        state.channelActivity[logDataKey] = analyzeChannelActivity(
          state.logData[logDataKey]
        );
      });
    },
    countTransmissionsPerSecond: (logDataKey) => {
      set((state) => {
        if (!state.logData[logDataKey]) return;
        state.transmissionCounts[logDataKey] = countTransmissionsPerSecond(
          state.logData[logDataKey]
        );
      });
    },
    countLogEvents: (logDataKey) => {
      set((state) => {
        if (!state.logData[logDataKey]) return;
        state.eventCounts[logDataKey] = countLogEvents(
          state.logData[logDataKey]
        );
      });
    },
    countMessageTypes: (logDataKey, messageType) => {
      set((state) => {
        if (!state.logData[logDataKey]) return;
        state.messageTypeCounts[logDataKey] = countMessageTypes(
          state.logData[logDataKey],
          messageType
        );
      });
    },
    extractSpans: (logDataKey) => {
      set((state) => {
        if (!state.logData[logDataKey]) return;
        state.spans[logDataKey] = extractSpans(state.logData[logDataKey]);
      });
    },
  }))
);
