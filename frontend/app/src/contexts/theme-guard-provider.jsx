'use client'
import { useEffect, useState } from 'react'
import {ThemeProvider, useTheme} from 'next-themes'
import {getUserTheme} from "@/lib/utils";
import useHasMounted from "@/hooks/has-mounted";

export default function ThemeGuardProvider({ children }) {
    const { theme, setTheme} = useTheme();
    const hasMounted = useHasMounted();

    useEffect(() => {
        setTheme(getUserTheme());
    }, []);

    if(!hasMounted) return null;

    return (
        <ThemeProvider attribute="class" defaultTheme="light" >
            {children}
        </ThemeProvider>
    )
}
