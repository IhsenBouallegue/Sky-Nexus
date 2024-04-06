import { LogEntry } from "../logging-utils";

export type Driver = string;
export type Event = string;

export interface ILogEntryAnalyzer<T> {
  /**
   * Updates the analyzer's state based on the provided log entry.
   * @param nodeId The ID of the node from which the log entry originates.
   * @param entry The log entry to process.
   */
  update(nodeId: string, entry: LogEntry): void;

  /**
   * Retrieves the analysis results.
   */
  getResults(): T;
}
