"use client"

import { CheckCircle } from 'lucide-react';
import {cn, getToken, removeToken} from "@/lib/utils";
import Loader from "@/components/loader";
import {Confetti} from "@/components/confetti";
import React, {useEffect, useRef} from "react";
import { range } from "@/lib/utils";
import {useSelector} from "react-redux";
import {useRouter} from "next/navigation";
import BackgroundGrid from "@/components/background-grid";
import BackgroundDots from "@/components/background-dots";

export default function SignupSuccess({ className }) {
  const router = useRouter();
  const confettiRef = useRef(null);

  const { user: verifiedUser } = useSelector(state => state.verifyEmail);

  useEffect(() => {
    getToken();
  }, []);


  // useEffect(() => {
  //   const interval = null;
  //   if(verifiedUser) {
  //     // setTimeout(
  //     //   () => window.location.href = process.env.NEXT_PUBLIC_APP_FRONTEND_URL,
  //     //   5000,
  //     // )
  //   } else if(!verifiedUser) {
  //     // router.replace('/');
  //   }
  //
  //   return () => clearTimeout(interval);
  // }, [verifiedUser]);


  useEffect(() => {
    range(5).map(() => {
      confettiRef.current?.fire();
    });
  }, [confettiRef.current]);


  return (
    <div
      className={cn(
        "relative flex flex-col h-screen w-screen",
        "flex flex-col items-center justify-center",
        "gap-4",
        className
      )}
    >
      <BackgroundDots className='z-0 opacity-20' maskClassName='z-0' />
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-0 size-full m-auto"
      />

      <div className='flex flex-col justfiy-center m-auto gap-4'>
        <h2 className="text-3xl font-semibold text-foreground md:text-4xl m-auto justify-center">
          <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>Welcome</span>{' '}
          <span className=''>to the team!</span>
        </h2>

        <Loader />
      </div>

    </div>
  );
}