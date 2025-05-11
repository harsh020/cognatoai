// components/scheduling/Step2_SelectCandidate.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { useScheduleInterview } from '@/contexts/schedule-interview-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Table from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusCircle, Search } from "lucide-react";
import {DATA} from "@/lib/data";
import {useQueryParams} from "@/lib/hooks";
import Link from "next/link";
import PaginationBar from "@/components/pagination-bar";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {listCandidates} from "@/store/candidate/actions";
import {JOB_FETCH_MORE_RESET} from "@/store/job/constants";
import {fetchMoreJobs} from "@/store/job/actions";
import {useDebounce} from "@/hooks/use-debounce";
import CandidateFormSheet from "@/components/candidate-form-sheet"; // Assuming a debounce hook exists


// Mock API function (replace with actual API call)
async function fetchCandidates(page, limit, searchTerm = '') {
  // console.log(`Fetching candidates - Page: ${page}, Limit: ${limit}, Term: ${searchTerm}`);

  return DATA.candidates;
}

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
  // {
  //   id: 'phone',
  //   header: 'Phone',
  //   cell: ({row}) => {
  //     return <div>{row.phone}</div>
  //   },
  //
  // },
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

export const SelectCandidate = () => {
  const dispatch = useDispatch();
  const { selectedCandidates, setCandidates, goToNextStep, goToPreviousStep } = useScheduleInterview();
  const router = useRouter();
  // const [candidates, setCandidates] = useState([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState(null);
  const [page, setPage] = useState(1);
  const [isCreateNewCandidateOpen, setIsCreateNewCandidateOpen] = useState(false);

  const { error, loading, candidates } = useSelector(state => state.listCandidates);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!loading && !candidates) {
      dispatch(listCandidates());
    }
  }, [error, loading, candidates]);


  useEffect(() => {
    if(candidates && page !== candidates.page) {
      const trimmed = searchTerm?.trim();

      dispatch(listCandidates({
        name: trimmed,
        page: page,
      }));
    }
  }, [page]);


  const handleSearch = (searchValue) => {
    const trimmed = searchValue.trim();

    // Don't fire if search is empty AND jobs already loaded (first load)
    if (!trimmed && candidates?.results?.length) return;

    dispatch(listCandidates(
      trimmed ? { name: trimmed } : undefined
    ));
  }

  useDebounce({
    callback: handleSearch,
    value: searchTerm
  })



  const handleSelectCandidate = (candidates) => {
    // Single selection logic
    setCandidates(candidates);
  };

  const handleCreateNewCandidate = () => {
    const redirectUrl = '/schedule-interview?step=2'; // Return to step 2
    setIsCreateNewCandidateOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <CandidateFormSheet isOpen={isCreateNewCandidateOpen} onOpenChange={setIsCreateNewCandidateOpen} />

      <h2 className="text-xl font-semibold text-gray-900">Step 2: Select Candidate</h2>
      <p className="text-sm text-gray-600">Choose the candidate you want to schedule the interview with.</p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button variant="outline" onClick={handleCreateNewCandidate} className="w-full sm:w-auto shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Candidate
        </Button>
      </div>

      {/* Candidate Table */}
      <div className="">
        <Table
          loading={loading}
          data={candidates?.results}
          columns={candidateTableColumns}
          enableRowSelection={true}
          onRowSelectionChange={
          (selections) => {
            setCandidates([...Object.values(selections)]);
          }
        } />
      </div>

      {/* Pagination */}
      {
        candidates?.results && (
          <PaginationBar
            currentPage={candidates.page}
            pages={candidates.pages}
            overflow={5}
            next={candidates.next}
            previous={candidates.previous}
            enableQueryParams={false}
            onPageChange={(p) => setPage(p)}
          />
        )
      }


      <div className="flex justify-between pt-4 pb-8">
        <Button variant="outline" onClick={goToPreviousStep}>
          Previous: Select Job
        </Button>
        <Button onClick={goToNextStep} disabled={!selectedCandidates.length}>
          Next: Select Schedule
        </Button>
      </div>
    </div>
  );
};
