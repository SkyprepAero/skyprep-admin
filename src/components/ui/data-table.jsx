import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DataTable({
  columns,
  data,
  onRowClick,
  className,
  pageSize = 20,
  manualPagination = false,
  pageCount = 0,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
}) {
  const [sorting, setSorting] = React.useState([])
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    onPaginationChange: manualPagination && onPageChange ? (updater) => {
      const newState = typeof updater === 'function' 
        ? updater({ pageIndex: currentPage - 1, pageSize })
        : updater
      onPageChange(newState.pageIndex + 1)
    } : undefined,
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
  })

  return (
    <div className={cn("space-y-5", className)}>
      <div className="rounded-lg overflow-hidden border border-gray-200/60 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider",
                        header.column.columnDef.meta?.align === "right" && "text-right"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-100/50">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-white transition-all duration-200 border-b border-gray-100/50 group",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-6 py-5 group-hover:bg-transparent",
                          cell.column.columnDef.meta?.align === "right" && "text-right"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-gray-400 mb-2">
                        <Users className="h-12 w-12 mx-auto opacity-50" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No results found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {(manualPagination ? pageCount > 1 : table.getPageCount() > 1) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-gray-200/60">
          <div className="text-sm text-gray-600">
            {manualPagination ? (
              <>
                Showing <span className="font-semibold text-gray-900">
                  {((currentPage - 1) * pageSize) + 1}
                </span> to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span> of{' '}
                <span className="font-semibold text-gray-900">{totalItems}</span> results
              </>
            ) : (
              <>
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} results
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => manualPagination ? onPageChange?.(1) : table.setPageIndex(0)}
              disabled={manualPagination ? currentPage === 1 : !table.getCanPreviousPage()}
              className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-40"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => manualPagination ? onPageChange?.(currentPage - 1) : table.previousPage()}
              disabled={manualPagination ? currentPage === 1 : !table.getCanPreviousPage()}
              className="h-9 px-4 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-40 font-medium"
            >
              <ChevronLeft className="h-4 w-4 mr-1.5" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: manualPagination ? pageCount : table.getPageCount() }, (_, i) => i + 1)
                .filter((page) => {
                  const current = manualPagination ? currentPage : table.getState().pagination.pageIndex + 1
                  const totalPages = manualPagination ? pageCount : table.getPageCount()
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= current - 1 && page <= current + 1)
                  )
                })
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1]
                  const showEllipsis = prevPage && page - prevPage > 1
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-2 text-gray-400 font-medium">...</span>
                      )}
                      <Button
                        variant={
                          page === (manualPagination ? currentPage : table.getState().pagination.pageIndex + 1)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => manualPagination ? onPageChange?.(page) : table.setPageIndex(page - 1)}
                        className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 font-medium"
                      >
                        {page}
                      </Button>
                    </div>
                  )
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => manualPagination ? onPageChange?.(currentPage + 1) : table.nextPage()}
              disabled={manualPagination ? currentPage >= pageCount : !table.getCanNextPage()}
              className="h-9 px-4 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-40 font-medium"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => manualPagination ? onPageChange?.(pageCount) : table.setPageIndex(table.getPageCount() - 1)}
              disabled={manualPagination ? currentPage >= pageCount : !table.getCanNextPage()}
              className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-40"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

