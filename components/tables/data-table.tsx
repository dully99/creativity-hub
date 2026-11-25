"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Pencil, Trash2, UserCog, ShieldCheck } from "lucide-react";

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onAssignRole?: (row: T) => void;
  onAssignPermissions?: (row: T) => void;
  showActions?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  onAssignRole,
  onAssignPermissions,
  showActions = true,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={String(column.key)}>{column.header}</TableHead>
          ))}
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.render
                  ? column.render(row[column.key], row)
                  : String(row[column.key])}
              </TableCell>
            ))}
            {showActions && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(row)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onAssignRole && (
                      <DropdownMenuItem onClick={() => onAssignRole(row)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Assign Role
                      </DropdownMenuItem>
                    )}
                    {onAssignPermissions && (
                      <DropdownMenuItem onClick={() => onAssignPermissions(row)}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Assign Permissions
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(row)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Helper components for common cell renderers
export function StatusBadge({ status, activeLabel, inactiveLabel }: { status: string; activeLabel: string; inactiveLabel: string }) {
  return (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status === "active" ? activeLabel : inactiveLabel}
    </Badge>
  );
}
