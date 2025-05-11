"use client"


import {cn} from "@/lib/utils";

export default function PdfViewer({ src, className }) {
    return (
        <embed
            className={cn(
            'h-full w-full border-0 scrollbar-thin',
                className
            )}
            src={`${src}#navpanes=0&scrollbar=0`}
        ></embed>
    );
};