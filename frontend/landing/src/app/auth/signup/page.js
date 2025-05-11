"use client";

import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/router';

import {cn, range} from "@/lib/utils";
import { SignupForm } from "@/components/forms/signup-form";
import { OtpForm } from "@/components/forms/otp-form";
import Logo from "@/components/logo";
import {useSelector} from "react-redux";
import {Confetti} from "@/components/confetti";
import {CheckCircle} from "lucide-react";
import Loader from "@/components/loader";
import Image from "next/image";

function SignupSuccess({ user, className }) {
  const confettiRef = useRef(null);

  useEffect(() => {
    const interval = null;
    if(user) {
      // setTimeout(
      //   () => window.location.href = process.env.NEXT_PUBLIC_APP_FRONTEND_URL,
      //   5000,
      // )
    }

    return () => clearTimeout(interval);
  }, [user]);


  useEffect(() => {
    range(5).map(() => {
      confettiRef.current?.fire();
    });
  }, [confettiRef.current]);


  return (
    <div
      className={cn(
        "h-full w-full",
        "flex flex-col items-center justify-center",
        "gap-4",
        className
      )}
    >
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-10 size-full"
      />

      {/* Green Check Icon */}
      {/*<CheckCircle*/}
      {/*  className="h-20 w-20  p-4 rounded-full text-green-600 dark:text-green-500"*/}
      {/*/>*/}
      {/*<span className='h-20 w-20 text-5xl m-auto'>*/}
      {/*  🥳*/}
      {/*</span>*/}

      <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
        <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>Welcome</span>{' '}
        <span className=''>to the team!</span>
      </h2>

      <Loader />
    </div>
  );
}

export default function SignupPage() { // Rename component for clarity if desired
  const router = useRouter();

  const [step, setStep] = useState('signup'); // Control flow
  const { user } = useSelector(state => state.register);
  const { user: verifiedUser } = useSelector(state => state.verifyEmail);

  // --- Handler: Called by SignupForm on success ---
  const handleSignupSuccess = () => {
    console.log("Signup successful, proceeding to OTP for:");
    // setUserEmail(emailFromSignup); // Store the email
    setStep('otp');                // Switch view to OTP form
    // Optionally: scroll to top or focus OTP input
  };

  useEffect(() => {
    if(verifiedUser) {
      router.replace("/auth/signup/success")
    }
  }, [verifiedUser]);



  // --- Render the Page ---
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column (Form Area) */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <Link href='/' className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-1 font-medium">
            <Logo className='size-9' />
            Cognato AI
          </div>
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {/* --- Conditional Rendering --- */}

            {
              // verifiedUser ? (
              //   <SignupSuccess user={verifiedUser} />
              // ) :
                step === 'otp' ? (
                <OtpForm
                  email={user?.email}
                  onGoBack={() => setStep('signup')}
                />
              ) : (
                <SignupForm onSignupSuccess={handleSignupSuccess} />
              )
            }
          </div>
        </div>
      </div>

      {/* Right Column (Image Area) */}
      <div className="relative hidden bg-muted lg:block">
        {/*<img*/}
        {/*  src="/background/bg-abstract-1.webp"*/}
        {/*  alt="Authentication Background" // More descriptive alt text*/}
        {/*  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"*/}
        {/*/>*/}

        <Image
          src="/background/bg-abstract-1.webp"
          alt="Authentication Background" // More descriptive alt text
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill={true}
        />

        {/* Optional: Add overlay or content on the image */}
      </div>
    </div>
  );
}