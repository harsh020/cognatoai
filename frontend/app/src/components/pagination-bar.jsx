"use client"

import React, {useEffect, useState} from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {cn, isNull, range} from "@/lib/utils";
import {useQueryParams} from "@/lib/hooks";
import {useSearchParams} from "next/navigation";

function PaginationBar({ pages, next, previous, currentPage=1, overflow=5, enableQueryParams=true, onPageChange = null }) {
  const [page, setPage] = useState(currentPage);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const updateQueryParams = useQueryParams();

  useEffect(() => {
    if(enableQueryParams) {
      if(currentPage !== page)
        updateQueryParams({page: page});
    }
  }, [page]);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={cn(
              'cursor-pointer',
              // isNull(previous) && 'text-muted cursor-not-allowed'
            )}
            onClick={(e) => {
              e.preventDefault();
              if(previous) {
                if(onPageChange) onPageChange(page-1);
                setPage(page => page - 1);
              }
            }}
          />
        </PaginationItem>
        {
          pages > overflow ? (
            <>
              {(page >= overflow) && (
                <PaginationItem>
                  <PaginationEllipsis/>
                </PaginationItem>
              )}

              {
                range(
                  Math.max(1, page - overflow + 2),
                  Math.max(1, page - overflow + 2) + overflow
                ).map((pageNo, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href='#' isActive={page === pageNo}
                      onClick={(e) => {
                        e.preventDefault();
                        if(onPageChange) onPageChange(pageNo);
                        setPage(p => pageNo)
                      }}
                    >
                      {pageNo}
                    </PaginationLink>
                  </PaginationItem>
                ))
              }
            </>

          ) : pages > 0 ? (
            range(1, pages+1).map((pageNo, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  className='cursor-pointer'
                  isActive={page === pageNo}
                  onClick={(e) => {
                    e.preventDefault();
                    if(onPageChange) onPageChange(pageNo);
                    setPage(p => pageNo)
                  }}
                >
                  {pageNo}
                </PaginationLink>
              </PaginationItem>
            ))
          ) : (
            <></>
          )
        }

        <PaginationItem>
          <PaginationNext
            className={cn(
              'cursor-pointer',
              // isNull(previous) && 'text-muted cursor-not-allowed'
            )}
            onClick={(e) => {
              e.preventDefault();
              if(next) {
                if(onPageChange) onPageChange(page+1);
                setPage(page => page + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PaginationBar;