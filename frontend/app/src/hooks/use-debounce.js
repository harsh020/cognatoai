"use client"

import { useEffect, useRef } from 'react';
import {Value} from "@radix-ui/react-select";

export const useDebounce = ({
  callback,
  value,
  delay = 500,
  immediate = false,
  watchValueChange = true,    // this var is just to help with the use case when we want recursive irrespective of value change
  recursive = false
}) => {
  const timeoutRef = useRef(null);
  const firstCallRef = useRef(true);
  const previousValueRef = useRef(value);

  useEffect(() => {
    // Run immediately on first render if desired
    if (immediate && firstCallRef.current) {
      callback(value);
      firstCallRef.current = false;
    }

    // Skip if watching value and value hasn't changed
    if (watchValueChange && previousValueRef.current === value) {
      return;
    }

    previousValueRef.current = value;

    const run = () => {
      callback(value);

      // If recursive, call again after delay
      if (recursive) {
        timeoutRef.current = setTimeout(run, delay);
      }
    };

    timeoutRef.current = setTimeout(run, delay);

    return () => clearTimeout(timeoutRef.current);
  }, [value, callback, delay, immediate, watchValueChange, recursive]);
};

