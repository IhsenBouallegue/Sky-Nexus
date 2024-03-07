import { useAnalysisStore } from "@/lib/store";
import { UploadIcon } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { Button } from "./ui/button";

export default function FileUploader() {
  const addDataSource = useAnalysisStore((state) => state.addDataSource);
  const updateLogEntry = useAnalysisStore((state) => state.updateLogEntry);
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref for the file input

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
            const logEntries = JSON.parse(jsonArrayString);
            addDataSource(file.name);
            for (const entry of logEntries) updateLogEntry(file.name, entry);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Programmatically click the hidden file input when the button is clicked
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" // Keep the input hidden
      />
      <Button
        className="border-dashed w-64"
        variant="outline"
        onClick={handleButtonClick}
      >
        <span className="flex items-center justify-center space-x-2 p-4">
          <UploadIcon className="h-6 w-6" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Upload Logs
          </span>
        </span>
      </Button>
    </>
  );
}
