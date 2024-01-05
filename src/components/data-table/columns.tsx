import { LogEntry } from "@/lib/logging-utils";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { DataTableColumnHeader } from "./data-table-column-header";
import { drivers, levels } from "./data-table-toolbar";

export const columns: ColumnDef<LogEntry>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Timestamp" />;
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("timestamp")}</div>
    ),
  },
  {
    accessorKey: "level",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Level" />;
    },
    cell: ({ row }) => {
      const level = levels.find(
        (level) => level.value === row.getValue("level")
      );

      if (!level) {
        return "n/a";
      }

      return (
        <div className="flex w-[100px] items-center">
          {level.icon && (
            <level.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{level.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: "fields.message",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Event" />;
    },
  },
  {
    accessorKey: "fields.driver",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Driver" />;
    },
    cell: ({ row }) => {
      const driver = drivers.find(
        (driver) => driver.value.toLowerCase() === row.original.fields.driver
      );

      if (!driver) {
        return "n/a";
      }

      return (
        <div className="flex w-[100px] items-center">
          {driver.icon && (
            <driver.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{driver.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "fields.json_packet",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Packet" />;
    },
    cell: ({ row }) => {
      const packet = row.original.fields.json_packet;

      if (!packet) {
        return "n/a";
      }
      const packetJson = JSON.parse(packet);
      return (
        <div>
          <HoverCard openDelay={200}>
            <HoverCardTrigger className="cursor-pointer">
              <Badge>Message</Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit ">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(packetJson, null, 2)}
              </pre>
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    },
  },
  {
    accessorKey: "target",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Target" />;
    },
  },
];
