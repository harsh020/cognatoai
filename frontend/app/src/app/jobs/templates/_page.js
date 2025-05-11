"use client"

import React from 'react';
import Table from '@/components/table';
import {DATA} from "@/lib/data";
import Link from 'next/link';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import PaginationBar from "@/components/pagination-bar";
import {cn} from "@/lib/utils";
import {Inbox} from "lucide-react";

export default function Jobs(props) {
  return (
      <div className='flex flex-col h-full w-full m-auto'>
        <div className={cn(
            'flex flex-col m-auto text-foreground/60 text-lg font-normal gap-1'
        )}>
          <Inbox className='flex flex-row m-auto h-5 w-5' />
          <span className='flex flex-row m-auto text-sm'>No job selected</span>
        </div>
      </div>
  );
}