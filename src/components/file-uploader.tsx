import { Input } from "@/components/ui/input";
import { LogEntry } from "@/lib/logging-utils";
import { useAnalysisStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";

export default function FileUploader() {
  const addLogEntries = useAnalysisStore((state) => state.addLogEntries);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          // Transform the string into a valid JSON array
          const jsonArrayString = `[${text.replace(/}\s*{/g, "},{")}]`;
          try {
            const logEntries: LogEntry[] = JSON.parse(jsonArrayString);
            addLogEntries(file.name, logEntries);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Input type="file" onChange={handleFileChange} className={cn("w-64")} />
  );
}
