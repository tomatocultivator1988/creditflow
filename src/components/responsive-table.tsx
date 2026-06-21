"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type Column<T> = {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  hide?: "sm" | "md" | "lg";
  hideOnMobile?: boolean;
};

type ResponsiveTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
  mobileAccordion?: {
    summaryColumns: string[];
  };
};

export function ResponsiveTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data found",
  keyExtractor,
  mobileAccordion,
}: ResponsiveTableProps<T>) {
  const getKey = keyExtractor || ((item: T) => item.id);
  const visibleMobile = columns.filter((c) => !c.hideOnMobile);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const summaryCols = mobileAccordion
    ? columns.filter((c) => mobileAccordion.summaryColumns.includes(c.key))
    : [];
  const detailCols = mobileAccordion
    ? visibleMobile.filter((c) => !mobileAccordion.summaryColumns.includes(c.key))
    : [];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block print:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-slate-600 ${col.hide ? "hidden" : ""} ${col.hide === "sm" ? "sm:table-cell" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={getKey(item)} className="border-b border-slate-100 hover:bg-slate-50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.hide ? "hidden" : ""} ${col.hide === "sm" ? "sm:table-cell" : ""}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden print:hidden space-y-3">
        {data.length === 0 ? (
          <div className="rounded-xl bg-white px-4 py-12 text-center text-sm text-slate-400">
            {emptyMessage}
          </div>
        ) : mobileAccordion ? (
          data.map((item) => {
            const id = getKey(item);
            const isExpanded = expandedRows.has(id);

            return (
              <div key={id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleRow(id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {summaryCols.map((col, ci) => (
                      <div key={col.key} className={ci === 0 ? "truncate font-medium text-slate-900" : "text-slate-600"}>
                        {col.render(item)}
                      </div>
                    ))}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ml-2 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-3 pt-2 space-y-2">
                    {detailCols.map((col) => (
                      <div key={col.key} className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500 shrink-0">{col.label}</span>
                        <span className="text-right text-sm font-medium text-slate-900">
                          {col.render(item)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          data.map((item) => (
            <div key={getKey(item)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {visibleMobile.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span className="shrink-0 text-xs font-medium text-slate-400 uppercase w-24">{col.label}</span>
                  <span className="text-right text-slate-900">{col.render(item)}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
