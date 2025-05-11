"use client"

import React from 'react';
import {cn} from "@/lib/utils";
import {Inbox} from "lucide-react";
import NoData from "@/components/no-data";

export default function Interview(props) {
  return (
    <div className='flex flex-col h-full w-full m-auto'>
      <NoData text='No interview selected' />
    </div>
  );
}