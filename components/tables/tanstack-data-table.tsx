"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreVertical, Pencil, Trash2, UserCog, ShieldCheck, ShieldOff, SlidersHorizontal, Building2, Eye, Play, X, UserX, ArrowDownAZ, ArrowUpZA, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onDeactivate?: (row: TData) => void;
  onView?: (row: TData) => void;
  onActivate?: (row: TData) => void;
  onClose?: (row: TData) => void;
  onAssignRole?: (row: TData) => void;
  onRemoveRole?: (row: TData) => void;
  onAssignPermissions?: (row: TData) => void;
  onAssignDepartment?: (row: TData) => void;
  onAssignUnit?: (row: TData) => void;
  onResetPassword?: (row: TData) => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  editLabel?: string;
  searchKey?: string;
  searchPlaceholder?: string;
  // Server-side pagination + search across the full dataset
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
}

export function TanStackDataTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  onDeactivate,
  onView,
  onActivate,
  onClose,
  onAssignRole,
  onRemoveRole,
  onAssignPermissions,
  onAssignDepartment,
  onAssignUnit,
  onResetPassword,
  onAdd,
  addButtonLabel = "Create",
  editLabel = "Edit",
  searchKey = "name",
  searchPlaceholder = "Search...",
  totalCount,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearchChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const isServerPaginated = !!onPageChange;
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [searchInput, setSearchInput] = React.useState("");
  const skipSearchNotify = React.useRef(true);
  const onSearchChangeRef = React.useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  React.useEffect(() => {
    if (!onSearchChangeRef.current) return;
    if (skipSearchNotify.current) {
      skipSearchNotify.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      onSearchChangeRef.current?.(searchInput.trim());
    }, 600);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const resolvedSearchKey = React.useMemo(() => {
    const dataColumns = columns.filter((col) => "accessorKey" in col && col.accessorKey);
    const hasSearchColumn = dataColumns.some(
      (col) => "accessorKey" in col && col.accessorKey === searchKey
    );
    if (hasSearchColumn) return searchKey;
    const firstKey = dataColumns.find((col) => "accessorKey" in col)?.accessorKey;
    return typeof firstKey === "string" ? firstKey : undefined;
  }, [columns, searchKey]);

  // Add actions column when action handlers are provided
  const hasActions = onEdit || onDelete || onDeactivate || onView || onAssignRole || onRemoveRole || onAssignPermissions || onAssignDepartment || onAssignUnit || onActivate || onClose || onResetPassword;

  const columnWidthClass = (columnId: string) => {
    if (columnId === "actions") return "w-20";
    return undefined;
  };

  const columnsWithActions = React.useMemo(() => {
    if (!hasActions) return columns;

    const actionsColumn: ColumnDef<TData, TValue> = {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const rowData = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(rowData)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(rowData)}>
                  {editLabel === "Continue" ? (
                    <Play className="mr-2 h-4 w-4" />
                  ) : (
                    <Pencil className="mr-2 h-4 w-4" />
                  )}
                  {editLabel}
                </DropdownMenuItem>
              )}
              {onAssignRole && (
                <DropdownMenuItem onClick={() => onAssignRole(rowData)}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Assign Role
                </DropdownMenuItem>
              )}
              {onRemoveRole && (
                <DropdownMenuItem
                  onClick={() => onRemoveRole(rowData)}
                  className="text-destructive focus:text-destructive"
                >
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Remove Role
                </DropdownMenuItem>
              )}
              {onAssignPermissions && (
                <DropdownMenuItem onClick={() => onAssignPermissions(rowData)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Assign Permissions
                </DropdownMenuItem>
              )}
              {onAssignDepartment && (
                <DropdownMenuItem onClick={() => onAssignDepartment(rowData)}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Assign Head of Division
                </DropdownMenuItem>
              )}
              {onAssignUnit && (
                <DropdownMenuItem onClick={() => onAssignUnit(rowData)}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Assign Head of Unit
                </DropdownMenuItem>
              )}
              {onResetPassword && (
                <DropdownMenuItem onClick={() => onResetPassword(rowData)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
              )}
              {onActivate && (
                <DropdownMenuItem onClick={() => onActivate(rowData)}>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {onClose && (
                <DropdownMenuItem onClick={() => onClose(rowData)}>
                  <X className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {onDeactivate && (
                <DropdownMenuItem
                  onClick={() => onDeactivate(rowData)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(rowData)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    };

    return [...columns, actionsColumn];
  }, [columns, hasActions, onEdit, editLabel, onDelete, onDeactivate, onView, onAssignRole, onRemoveRole, onAssignPermissions, onAssignDepartment, onAssignUnit, onResetPassword, onActivate, onClose]);

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-4">
        {resolvedSearchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              onSearchChange
                ? searchInput
                : ((table.getColumn(resolvedSearchKey)?.getFilterValue() as string) ?? "")
            }
            onChange={(event) => {
              const value = event.target.value;
              if (onSearchChange) {
                setSearchInput(value);
                return;
              }
              table.getColumn(resolvedSearchKey)?.setFilterValue(value);
            }}
            className="max-w-sm"
          />
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
                {sortOrder === "asc" ? (
                  <>
                    <ArrowDownAZ className="h-4 w-4 mr-1" />
                    A - Z
                  </>
                ) : (
                  <>
                    <ArrowUpZA className="h-4 w-4 mr-1" />
                    Z - A
                  </>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem
                onClick={() => {
                  setSortOrder("asc");
                  if (resolvedSearchKey) {
                    setSorting([{ id: resolvedSearchKey, desc: false }]);
                  }
                }}
              >
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                A - Z
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortOrder("desc");
                  if (resolvedSearchKey) {
                    setSorting([{ id: resolvedSearchKey, desc: true }]);
                  }
                }}
              >
                <ArrowUpZA className="mr-2 h-4 w-4" />
                Z - A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Customize Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {onAdd && (
            <Button onClick={onAdd} size="sm">
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>
      <div className={cn("rounded-md border overflow-x-auto", isLoading && "opacity-60 pointer-events-none")}>
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn("font-medium", columnWidthClass(header.column.id))}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="border-b last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={columnWidthClass(cell.column.id)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithActions.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-600">
          {isServerPaginated ? (
            <>
              Page {currentPage} of {Math.ceil((totalCount ?? 0) / pageSize)} &mdash;{" "}
              {totalCount ?? 0} total record(s)
            </>
          ) : (
            <>{table.getFilteredRowModel().rows.length} record(s)</>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isServerPaginated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.ceil((totalCount ?? 0) / pageSize) }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === Math.ceil((totalCount ?? 0) / pageSize) || Math.abs(p - currentPage) <= 2)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">...</span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => onPageChange!(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(currentPage + 1)}
                disabled={currentPage >= Math.ceil((totalCount ?? 0) / pageSize)}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to create sortable column header
export function SortableHeader({ column, title }: { column: any; title: string }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
