"use client";

import * as React from "react";
import { useDataTable } from "./data-table";
import { DataTableRow } from "./data-table-row";

export function DataTableBody() {
  const { data } = useDataTable();

  return (
    <tbody>
      {data.map((row, index) => (
        <DataTableRow key={index} row={row} index={index} />
      ))}
    </tbody>
  );
}
