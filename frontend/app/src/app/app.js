"use client"

import React, {useEffect, useMemo} from 'react';
import {usePathname} from "next/navigation";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {cn, getToken, setOrganization, toTitleCase} from "@/lib/utils";
import {ThemeToggle} from "@/components/theme-toggle";
import {ThemeProvider, useTheme} from "next-themes";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {retrieveOrganization} from "@/store/organization/actions";
import {retrieveUser} from "@/store/user/actions";
import Loader from "@/components/loader";
import useHasMounted from "@/hooks/has-mounted";
import StoreProvider from "@/contexts/store-provider";
import ThemeGuardProvider from "@/contexts/theme-guard-provider";
import {Toaster} from "@/components/ui/sonner";


function Layout({ theme, children }) {
  const pathName = usePathname();

  const paths = useMemo(() => {
    return pathName.split('/').filter(p => p.length)
  }, [pathName]);

  return (
    <SidebarProvider className={theme}>
      <AppSidebar />

      <SidebarInset className='flex flex-col'>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
                {
                  paths.map((path, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem key={index}>
                        <BreadcrumbLink asChild>
                          <Link href={`/${paths.slice(0, index+1).join('/')}` !== pathName ? `/${paths.slice(0, index+1).join('/')}` : ''}>
                            {toTitleCase(path)}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {index !== paths.length-1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))
                }
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className='flex pr-4'>
            <ThemeToggle />
          </div>
        </header>

        <Separator orientation="horizontal" />

        <div className={cn(
          // 'bg-sidebar/20',
          theme,
        )}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AuthApp({ children }) {
  const { theme} = useTheme();
  const dispatch = useDispatch();

  const { error, loading, user } = useSelector((state) => state.retrieveUser);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.replace(process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL);
      return;
    }

    if (error) {
      toast.error("Authentication failed! Please log in again.");
    } else if (user) {
      setOrganization(user.organizations[0].id);
      dispatch(retrieveOrganization(user.organizations[0].id));
      // redirect('/dashboard');
    } else if (!loading) {
      dispatch(retrieveUser());
    }
  }, [user, error]);

  return (
    <>
      {
        user ? (
          <Layout theme={theme || 'light'}>
            {children}
          </Layout>
        ) : (
          <div className={cn(
            'flex flex-col h-screen w-screen',
            theme || 'light'
          )}>
            <Loader />
          </div>
        )
      }
    </>
  )
}

function Guard({ children }) {
  const hasMounted = useHasMounted();

  if (!hasMounted) return null;

  return (
    <>
      {children}
    </>
  );
}

export default function App({ children }) {
  const { theme } = useTheme();
  return (
    <>
      <Guard>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <AuthApp>
              {children}
            </AuthApp>
          </ThemeProvider>
        </StoreProvider>
      </Guard>

      <Toaster theme={theme} richColors/>
    </>
  );
}
