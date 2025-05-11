"use client"

import React, {useEffect, useMemo, useState} from 'react';
import { cn } from "@/lib/utils"; // Assuming you have a utility for classnames
import { Checkbox } from "@/components/ui/checkbox"; // Assuming shadcn Checkbox
import { LoaderCircle } from 'lucide-react';
import Loader from "@/components/loader"; // Keep existing imports

// Assuming NoData is a component you have defined elsewhere
const NoData = () => <div className="text-center text-muted-foreground">No data available</div>;


export default function Table({
  data = [], // Default data to empty array
  columns = [], // Default columns to empty array
  loading = false,
  className,
  // --- Row Selection Props ---
  enableRowSelection = false, // Default to false
  initialRowSelection = {}, // Default to empty selection
  onRowSelectionChange = () => {}, // Default to no-op function
}) {
  const [selectedRows, setSelectedRows] = useState({...initialRowSelection});
  // --- Row Selection Logic ---

  const numSelected = Object.keys(selectedRows).length;
  const numRows = data.length;
  const canSelectAll = numRows > 0; // Can only select all if there are rows

  // Determine the state of the header checkbox
  const headerCheckboxState = useMemo(() => {
    if (!canSelectAll || !enableRowSelection) return false;
    if (numSelected === numRows) return true;
    if (numSelected > 0 && numSelected < numRows) return 'indeterminate';
    return false;
  }, [numSelected, numRows, canSelectAll, enableRowSelection]);

  useEffect(() => {
    setSelectedRows({...initialRowSelection})
  }, []);


  // Handler for the header checkbox change
  const handleSelectAllChange = (checked) => {
    if (!enableRowSelection) return;

    // If currently all selected (checked is true), deselect all.
    // Otherwise (checked is false or indeterminate), select all.
    if (headerCheckboxState === true) {
      onRowSelectionChange({}); // Deselect all
    } else {
      const newSelection = data.reduce((acc, row) => {
        acc[row.id] = row;
        return acc;
      }, {});
      setSelectedRows({...newSelection});
      onRowSelectionChange(newSelection);
    }
  };

  // Handler for individual row checkbox change
  const handleRowCheckboxChange = (rowId, value, checked) => {
    if (!enableRowSelection) return;

    const newSelection = { ...selectedRows }; // Create a copy
    if (checked === true) {
      newSelection[rowId] = value; // Add to selection
    } else {
      delete newSelection[rowId]; // Remove from selection
    }
    setSelectedRows({...newSelection});
    onRowSelectionChange(newSelection); // Update parent state
  };

  // Calculate colspan dynamically
  const totalColumns = columns.length + (enableRowSelection ? 1 : 0);

  // --- Render ---

  return (
    <div className={cn(
      'w-full h-full overflow-x-auto', // Added overflow-x-auto for smaller screens
      className
    )}>
      <table className='min-w-full w-full text-[0.9rem] border-collapse'>
        <thead>
        {/* Add border-b for header separation */}
        <tr className='w-full rounded-lg bg-muted border-b z-10'>
          {/* Conditional Header Checkbox */}
          {enableRowSelection && (
            <th className="py-2 px-4 text-left sticky left-0 bg-muted z-20"> {/* Sticky checkbox column */}
              <Checkbox
                checked={headerCheckboxState}
                onCheckedChange={handleSelectAllChange}
                aria-label="Select all rows"
                disabled={!canSelectAll}
              />
            </th>
          )}
          {/* Data Columns Headers */}
          {columns.map((column, index) => (
            <th key={column.id} className={cn(
              'py-2 px-4 justify-start font-normal text-foreground/50 text-left whitespace-nowrap', // Added whitespace-nowrap
              // Adjust rounding logic if checkbox is present
              !enableRowSelection && index === 0 && '[&:nth-child(1)]:rounded-l-lg',
              index === columns.length - 1 && '[&:last-child]:rounded-r-lg'
            )}>
              {column.header}
            </th>
          ))}
        </tr>
        </thead>

        <tbody>
        {data && data.length > 0 ? (
          data.map((row) => (
            <tr key={row.id} className='hover:bg-muted/40 border-b-[1px] last:border-b-0 -z-10'>
              {/* Conditional Row Checkbox */}
              {enableRowSelection && (
                <td className="p-4 sticky left-0 bg-background hover:bg-muted/40 z-50"> {/* Sticky checkbox column, match background */}
                  <Checkbox
                    // checked={!!selectedRows[row.id]} // Check if row.id exists in selection
                    onCheckedChange={(checked) => handleRowCheckboxChange(row.id, row, checked)}
                    aria-label={`Select row ${row.id}`}
                  />
                </td>
              )}
              {/* Data Cells */}
              {columns.map(column => (
                <td key={`${row.id}-${column.id}`} className='p-4 align-top'> {/* Use unique key, align-top */}
                  {column.cell({ row })}
                </td>
              ))}
            </tr>
          ))
        ) : loading ? (
          <tr>
            {/* Adjust colspan for loading state */}
            <td className='py-12 text-center' colSpan={totalColumns}>
              <Loader />
            </td>
          </tr>
        ) : (
          <tr>
            {/* Adjust colspan for no data state */}
            <td className='py-12 text-center' colSpan={totalColumns}>
              <NoData />
            </td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
}

