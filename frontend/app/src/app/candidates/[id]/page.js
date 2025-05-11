"use client"

import React, {useMemo} from 'react';
import {useParams} from "next/navigation";
import {DATA} from "@/lib/data";
import PdfViewer from "@/components/pdf-viewer";
import {useSelector} from "react-redux";

export default function Candidate(props) {
    const { id } = useParams();

    const { candidates } = useSelector(state => state.listCandidates);

    // const candidate = DATA.candidates.results.find(c => c.id === id);
    const candidate = useMemo(() => {
        return candidates.results.find(c => c.id === id);
    }, [id]);

    return (
        <div className='h-full w-full'>
            <PdfViewer src={candidate.resume} />
        </div>
    );
}
