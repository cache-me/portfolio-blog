import React, { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { TablePagination } from "./table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnsVisibilityState?: VisibilityState;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (data: TData) => string;
  className?: string;
  style?: React.CSSProperties;
  initialPageSize?: number;
  hidePagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  columnsVisibilityState,
  rowSelection = {},
  onRowSelectionChange,
  getRowId,
  hidePagination = false,
  initialPageSize,
  className,
  style,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange,
    getRowId,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    initialState: {
      columnVisibility: columnsVisibilityState,
    },
  });
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalPages = table.getPageOptions().length;

  return (
    <div className={className} style={style}>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted hover:bg-muted"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow
                key={footerGroup.id}
                className="bg-muted hover:bg-muted"
              >
                {footerGroup.headers.map((footer) => {
                  return (
                    <TableHead
                      key={footer.id}
                      className="text-muted-foreground"
                    >
                      {footer.isPlaceholder
                        ? null
                        : flexRender(
                            footer.column.columnDef.footer,
                            footer.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </div>
      {!hidePagination ? (
        <>
          <TablePagination
            className="mt-4"
            totalPages={totalPages}
            page={pageIndex + 1}
            onPageChange={(page) => {
              table.setPageIndex(page - 1);
            }}
            pageSize={pageSize}
            onPageSizeChange={(_pageSize) => {
              table.setPageSize(_pageSize);
            }}
            hasPreviousPage={table.getCanPreviousPage()}
            onPreviousPageClick={() => {
              table.previousPage();
            }}
            hasNextPage={table.getCanNextPage()}
            onNextPageClick={() => {
              table.nextPage();
            }}
          />
        </>
      ) : null}
    </div>
  );
}
