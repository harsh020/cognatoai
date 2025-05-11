"use client"

import { Geist, Geist_Mono } from "next/font/google";
import AppNavbar from "@/components/app-navbar";
import Footer from "@/components/footer";
import StoreProvider from "@/contexts/store-provider";
import {usePathname} from "next/navigation";
import {ThemeProvider, useTheme} from "next-themes";
import {useEffect, useMemo, useState} from "react";
import {getToken} from "@/lib/utils";
import ThemeGuardProvider from "@/contexts/theme-guard-provider";
import useHasMounted from "@/hooks/has-mounted";
import {Toaster} from "@/components/ui/sonner";


function Guard({ children }) {
  const hasMounted = useHasMounted();

  if(!hasMounted) return null;

  return (
    <>
      {children}
    </>
  );
}

export default function App({ children }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [showAppNavbar, setShowAppNavbar] = useState(false);

  const independentScreens = ['/auth'];

  useEffect(() => {
    const token = getToken(false);
    if(token) window.location.replace(process.env.NEXT_PUBLIC_APP_FRONTEND_URL)

    const shouldShowAppNavbar = !independentScreens.some(path => pathname.includes(path))
    setShowAppNavbar(shouldShowAppNavbar);
  }, [pathname]);

  return (
    <>
      <Guard>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {
              showAppNavbar && (
                <AppNavbar />
              )
            }
            {children}
            {
              showAppNavbar && (
                <Footer />
              )
            }
          </ThemeProvider>
        </StoreProvider>
      </Guard>

      <Toaster theme={theme} richColors />
    </>
  );
}
