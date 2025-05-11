"use client"

import React from 'react';
import {cn} from "@/lib/utils";
import NoData from "@/components/no-data";
import {LoaderCircle} from "lucide-react";


export default function Table({ data, columns, loading, className }) {

  return (
    <div className={cn(
      'w-full h-full',
      className
    )}>
      <table className='h-full w-full text-[0.9rem]'>
        <thead>
        <tr className='w-full rounded-lg bg-muted'>
          {
            columns.map(column => (
              <th key={column.id} className={cn(
                'py-2 px-4 justify-start font-normal text-foreground/50 text-left',
                `[&:nth-child(1)]:rounded-l-lg [&:nth-child(4)]:rounded-r-lg [&:nth-child(${columns.length})]:rounded-r-lg`
              )}>
                {column.header}
              </th>
            ))
          }
        </tr>
        </thead>

        <tbody>
        {
          data && data.length ? (
            data.map((row, index) => (
              <tr key={row.id} className='hover:bg-muted/40 border-b-[1px]'>
                {
                  columns.map(column => (
                    <td key={column.id} className='p-4'>{column.cell({row})}</td>
                  ))
                }
              </tr>
            ))
          ) : loading ? (
            <tr>
              <td className='py-12' colSpan={columns.length}>
                <LoaderCircle className='m-auto h-12 w-12 animate-spin' />
              </td>
            </tr>
          ) : (
            <tr>
              <td className='py-12' colSpan={columns.length}>
                <NoData />
              </td>
            </tr>
          )
        }
        </tbody>
      </table>
    </div>
  );
}
