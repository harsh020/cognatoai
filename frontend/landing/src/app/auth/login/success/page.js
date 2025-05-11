"use client"

import React, {useEffect} from 'react';
import Loader from "@/components/loader";
import {useRouter} from "next/navigation";
import {cn, getToken, removeToken} from "@/lib/utils";
import {useSelector} from "react-redux";
import BackgroundGrid from "@/components/background-grid";

function LoginSuccess({  }) {
  const router = useRouter();

  const { user, error } = useSelector(state => state.authenticate);
  const { user: verifiedUser } = useSelector(state => state.verifyEmail);

  useEffect(() => {
    getToken();
  }, []);

  // useEffect(() => {
  //   const interval = null;
  //   if(verifiedUser || user?.is_email_verified) {
  //     // setTimeout(
  //     //   () => window.location.href = process.env.NEXT_PUBLIC_APP_FRONTEND_URL,
  //     //   2000,
  //     // )
  //   }
  //   else if(!user) {
  //     // router.replace('/');
  //   }
  //
  //   return () => clearTimeout(interval);
  // }, [user, verifiedUser]);


  return (
    <div className={cn(
      'relative h-screen w-screen',
      "flex flex-col items-center justify-center",
    )}>
      <BackgroundGrid className='z-0 opacity-50' maskClassName='z-0' />
      <Loader />
    </div>
  );
}

export default LoginSuccess;