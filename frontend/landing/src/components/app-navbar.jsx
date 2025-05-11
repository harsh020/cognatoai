"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ThemeToggle} from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose, // Optional: if you want an explicit close button inside
} from "@/components/ui/sheet";
import { Menu, LogIn, UserPlus } from 'lucide-react';
import {Separator} from "@/components/ui/separator";

/**
 * NavigationBar Component
 *
 * A floating, pill-shaped navigation bar with a blurred background.
 * Features:
 * - Sticky positioning slightly below the top edge.
 * - Centered layout with 60vw width on larger screens.
 * - Responsive width adjustment for smaller screens.
 * - Semi-transparent background with backdrop blur.
 * - Subtle shadow and border for definition.
 * - Logo on the left, Sign In link and Sign Up button on the right.
 * - Uses Shadcn UI Button for Sign Up.
 * - Adds a slightly more prominent shadow on scroll.
 */

function NavbarActions() {
  const router = useRouter();

  // Reusable Link Style for Sheet Items
  const sheetLinkClass = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground text-sm transition-all hover:text-primary bg-muted text-center justify-center";
  const sheetButtonLinkClass = "flex items-center justify-center gap-2 rounded-lg text-sm px-3 py-2 text-primary-foreground bg-primary transition-all hover:bg-primary/90";

  return (
      <>
        <div className="md:flex flex-row items-center space-x-2 md:space-x-4 hidden">
          <div className='flex flex-col'>
            <ThemeToggle />
          </div>

          <Link
              href="/auth/login" // Replace with your actual sign-in path
              className="text-sm px-4 py-1 rounded-full hover:bg-foreground/2 transition-colors"
          >
            Login
          </Link>

          {/* Shadcn UI Button for Sign Up */}
          <Button
              variant="default" // Or try "secondary", "outline", etc.
              size="sm" // "sm", "default", "lg"
              onClick={() => router.push('/auth/signup')} // Replace with Next.js Link or router push for SPA behavior
              className="text-sm rounded-full hover:bg-primary/80 transition-shadow"
          >
            Sign Up
          </Button>
        </div>

        {/* === Mobile Menu Trigger (Sheet) === */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Menu className="h-5 w-5 m-auto" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0"> {/* Control width, remove padding for full control */}
              <SheetHeader className="border-b p-4"> {/* Add border to header */}
                <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
              </SheetHeader>

              {/* Actions Section */}
              <div className="flex flex-col gap-3 p-4">
                {/* Theme Toggle Section */}
                <div className='flex justify-between items-center rounded-lg p-3 border'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <span className='text-sm font-medium'>Interface Theme</span>
                  </div>
                  <ThemeToggle />
                </div>

                <SheetClose asChild>
                  <Link href="/auth/login" className={sheetLinkClass}>
                    Login
                  </Link>
                </SheetClose>

                {/* Sign Up Button (Primary Action) */}
                <SheetClose asChild>
                  <Link href="/auth/signup" className={sheetButtonLinkClass}>
                    Sign Up
                  </Link>
                </SheetClose>
              </div>

              {/* Optional Footer Area */}
              {/* <div className="absolute bottom-0 left-0 w-full border-t p-4">
              <p className="text-xs text-muted-foreground text-center">Your App Name © 2025</p>
            </div> */}
            </SheetContent>
          </Sheet>
        </div>
      </>
  );
}


export default function AppNavbar({  }) {
  const router = useRouter();
  // State to track if the page has been scrolled
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Set state to true if scrolled more than 10px, false otherwise
      setIsScrolled(window.scrollY > 10);
    };

    // Add event listener when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center md:pt-4">
      <div className='relative h-full md:w-[60vw] w-full md:rounded-full'>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400 opacity-20 md:rounded-full" ></div>

        <nav
          className={` 
          
          /* --- Layout & Positioning --- */
          flex items-center justify-between /* Aligns items horizontally */
          w-full  /* Sets max width to 60% of viewport */
          mx-auto /* Centers the nav bar */

          /* --- Appearance --- */
          rounded-full
          backdrop-blur-md

          /* --- Spacing --- */
          md:px-4 px-2 pr-4
          py-3 /* Vertical padding */

          /* --- Effects --- */
          transition-all duration-300 ease-in-out /* Smooth transitions for changes */

          /* --- Responsiveness --- */
          
        `}
          aria-label="Main Navigation"
        >
          {/* Left Side: Logo and Brand Name */}
          <Link href="/" className="flex items-center space-x-1 group">
            {/* Replace with your actual SVG logo or component */}
            <Logo className='size-9' />
            <span className="font-normal md:text-md text-sm transition-colors">
            Cognato AI
          </span>
          </Link>

          {/* Right Side: Navigation Links & Actions */}
          <NavbarActions />
        </nav>
      </div>
    </header>
  );
};
