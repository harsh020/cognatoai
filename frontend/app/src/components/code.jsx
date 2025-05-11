"use client"

import { useEffect, useRef } from "react";
import hljs from "highlight.js";
// import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css";
import {cn} from "@/lib/utils";

export default function Code({ className, children, language = "python" }) {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [children]);

  return (
    <pre className={cn(
      'bg-muted/60 rounded-md p-2 text-sm',
      className
    )}>
      <code
        ref={codeRef}
        className={cn(
          'bg-transparent text-sm'
          // `language-${language}`
        )}
        style={{
          background: 'transparent'
        }}
      >
        {children}
      </code>
    </pre>
  );
}
