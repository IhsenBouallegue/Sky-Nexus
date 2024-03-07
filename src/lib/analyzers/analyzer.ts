import { LogEntry } from "../logging-utils";

export type Driver = string;
export type Event = string;

export interface ILogEntryAnalyzer<T> {
  /**
   * Updates the analyzer's state based on the provided log entry.
   * @param entry The log entry to process.
   */
  update(entry: LogEntry): void;

  /**
   * Retrieves the analysis results accumulated by the analyzer.
   */
  getResults(): T;
}
