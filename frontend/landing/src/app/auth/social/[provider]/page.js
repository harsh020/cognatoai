"use client"

import React, {useEffect, useMemo} from 'react';
import Loader from "@/components/loader";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {cn, toTitleCase} from "@/lib/utils";
import {useDispatch, useSelector} from "react-redux";
import {callback} from "@/store/social/actions";
import {toast} from "sonner";
import BackgroundGrid from "@/components/background-grid";

export default function SocialAuth({  }) {
  const { provider } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const { error, loading, user } = useSelector(state => state.callback);

  // Convert searchParams to an object
  const queryParams = useMemo(() => {
    const obj = {};
    for (const [key, value] of searchParams.entries()) {
      obj[key] = value;
    }
    return obj;
  }, [searchParams]);

  useEffect(() => {
    if(queryParams) {
      const containsRequiredKeys = Object.keys(queryParams).includes('code') && Object.keys(queryParams).includes('state')
      if(!containsRequiredKeys) {
        toast.error(`Something went wrong when authenticating with ${toTitleCase(provider)}`)
        router.replace('/');
        return;
      }

      dispatch(callback({
        ...queryParams,
        provider: provider,
        redirect_uri: process.env.NEXT_PUBLIC_SOCIAL_AUTH_REDIRECT_URI_TEMPLATE.replace('{provider}', provider),
      }));
    }

  }, [queryParams]);


  useEffect(() => {
    if(error) {
      toast.error(error.message);
      router.replace('/');
    } else if(user) {
      window.location.replace(process.env.NEXT_PUBLIC_APP_FRONTEND_URL);
      console.log("Login Successful", user);
    }
  }, [user, error]);


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