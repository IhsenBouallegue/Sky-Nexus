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
    id: "event",
    accessorFn: (row) => row.span?.name || row.fields.message,
    accessorKey: "fields.message",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Event" />;
    },
    cell: ({ row }) => {
      const event = row.original.fields.message;
      const span = row.original.span?.name;

      return (
        <div className="flex flex-col gap-2">
          {span ? (
            <div className="text-sm">{span}</div>
          ) : (
            <div className="text-sm">{event}</div>
          )}
        </div>
      );
    },
  },

  {
    id: "driver",
    accessorFn: (row) => row.fields.driver || row.span?.driver,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Driver" />;
    },
    cell: ({ row }) => {
      const driver = drivers.find(
        (driver) =>
          driver.value.toLowerCase() ===
          (row.original.fields.driver || row.original.span?.driver)
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
    id: "details",
    accessorFn: (row) =>
      row.fields.json_packet ||
      row.fields.rssi ||
      row.fields["time.busy"] ||
      row.fields["time.idle"],
    accessorKey: "fields.json_packet",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Details" />;
    },
    cell: ({ row }) => {
      const packet = row.original.fields.json_packet || undefined;
      const rssi = row.original.fields.rssi;
      const busy = row.original.fields["time.busy"];
      const idle = row.original.fields["time.idle"];

      return (
        <div className="flex flex-col gap-2">
          {rssi && (
            <Badge variant="secondary" className="w-fit">
              RSSI: {rssi}
            </Badge>
          )}
          {busy && (
            <Badge variant="secondary" className="w-fit">
              Busy: {busy}
            </Badge>
          )}
          {idle && (
            <Badge variant="secondary" className="w-fit">
              Idle: {idle}
            </Badge>
          )}
          {packet && (
            <>
              <HoverCard openDelay={200}>
                <HoverCardTrigger className="cursor-pointer">
                  <Badge>Packet</Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit ">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(JSON.parse(packet), null, 2)}
                  </pre>
                </HoverCardContent>
              </HoverCard>
              <Badge className="w-fit">{JSON.parse(packet).msg.type}</Badge>
            </>
          )}
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
