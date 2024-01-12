"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import {
  AlertCircleIcon,
  AntennaIcon,
  AudioWaveformIcon,
  BugIcon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

export const levels = [
  {
    label: "Debug",
    value: "DEBUG",
    icon: BugIcon,
  },
  {
    label: "Info",
    value: "INFO",
    icon: AlertCircleIcon,
  },
  {
    label: "Error",
    value: "ERROR",
    icon: XCircleIcon,
  },
];

export const drivers = [
  {
    label: "LoRa",
    value: "lora_driver",
    icon: AntennaIcon,
  },
  {
    label: "UDP",
    value: "udp_driver",
    icon: AudioWaveformIcon,
  },
];

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter events..."
          value={(table.getColumn("event")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("event")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("level") && (
          <DataTableFacetedFilter
            column={table.getColumn("level")}
            title="Levels"
            options={levels}
          />
        )}
        {table.getColumn("driver") && (
          <DataTableFacetedFilter
            column={table.getColumn("driver")}
            title="Driver"
            options={drivers}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
