'use client'

import { LoginForm } from "@/components/forms/login-form"
import Logo from "@/components/logo";
import Link from "next/link";
import BackgroundGrid from "@/components/background-grid";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {OtpForm} from "@/components/forms/otp-form";
import {Card, CardContent} from "@/components/ui/card";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import Loader from "@/components/loader";


function LoginSuccess({ user }) {
  const router = useRouter();

  useEffect(() => {
    const interval = null;
    if(user) {
      // setTimeout(
      //   () => window.location.href = process.env.NEXT_PUBLIC_APP_FRONTEND_URL,
      //   2000,
      // )
    }

    return () => clearTimeout(interval);
  }, [user]);


  return (
    <div className={cn(
      'h-full w-full',
      "flex flex-col items-center justify-center",
    )}>
      <Loader />
    </div>
  );
}


export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState('login'); // Control flow

  const { user, error } = useSelector(state => state.authenticate);
  const { user: verifiedUser } = useSelector(state => state.verifyEmail);

  useEffect(() => {
    if(user && !user?.is_email_verified) {
      setStep('otp');
    } else if(verifiedUser || user?.is_email_verified) {
      router.replace('/auth/login/success');
    }
  }, [user, verifiedUser]);


  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted dark:bg-transparent p-6 md:p-10">
      <BackgroundGrid className='dar:-z-20 z-0 opacity-40' maskClassName='dar:-z-20 z-10' />

      <div className="flex w-full max-w-sm flex-col gap-6 z-10">
        {
          !((step === 'login' && user?.is_email_verified) || (step === 'otp' && verifiedUser)) && (
            <Link href="/" className="flex items-center gap-1 self-center font-medium">
              <Logo className='size-9' />
              Cognato AI
            </Link>
          )
        }
        {
          // (step === 'login' && user?.is_email_verified) || (step === 'otp' && verifiedUser) ? (
          //   <LoginSuccess user={step === 'otp' ? verifiedUser : user} />
          // ) :
            user && step === 'otp' ? (
            <Card>
              <CardContent>
                <OtpForm email={user?.email} />
              </CardContent>
            </Card>
          ) : (
            <LoginForm />
          )
        }
      </div>
    </div>
  )
}
