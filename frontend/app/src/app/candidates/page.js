"use client"

import React from 'react';
import Table from '@/components/table';
import {DATA} from "@/lib/data";
import Link from 'next/link';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import PaginationBar from "@/components/pagination-bar";
import {cn} from "@/lib/utils";
import {Inbox} from "lucide-react";

const candidateTableColumns = [
  {
    id: 'name',
    header: 'Name',
    cell: ({row}) => {
      return <div>{row.first_name} {row.last_name}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'email',
    header: 'Email',
    cell: ({row}) => {
      return <div>{row.email}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'phone',
    header: 'Phone',
    cell: ({row}) => {
      return <div>{row.phone}</div>
    },

  },
  {
    id: 'resume',
    header: 'Resume',
    cell: ({row}) => {
      return <Link className='underline' href={row.resume} target='_blank'>Resume</Link>
    },
    enableSorting: false,
    enableHiding: false,
  },
]

function CandidatesTableCard() {
  const candidates = DATA.candidates;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Candidates
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table columns={candidateTableColumns} data={candidates.results} loading={false} />
      </CardContent>

      <CardFooter>
        <PaginationBar pages={candidates.pages} next={candidates.next} previous={candidates.next} />
      </CardFooter>
    </Card>
  )
}

function CandidatesX(props) {
  const candidates = DATA.candidates;

  return (
    <div className='flex flex-col h-full w-full m-auto p-4'>
      {/*<div className='flex flex-col h-full w-[70vw] mx-auto '>*/}
      {/*  <Table columns={candidateTableColumns} data={candidates.results} loading={false} />*/}
      {/*</div>*/}
      <CandidatesTableCard />
    </div>
  );
}

export default function Candidates(props) {
  return (
      <div className='flex flex-col h-full w-full m-auto'>
        <div className={cn(
            'flex flex-col m-auto text-foreground/60 text-lg font-normal gap-1'
        )}>
          <Inbox className='flex flex-row m-auto h-5 w-5' />
          <span className='flex flex-row m-auto text-sm'>No candidate selected</span>
        </div>
      </div>
  );
}