"use client"


import {useEffect, useRef, useState} from "react";
import {AUDIO_STATUS} from "@/lib/constants";
import { useRouter, usePathname } from 'next/navigation';

export function useAudioPlayer(
  src,
  playbackRate = 1.0,
  onStart = null,
  onEnd = null,
  onLoaded = null,
  onPause = null,
) {
  const audioRef = useRef(null);
  const [audioStatus, setAudioStatus] = useState(AUDIO_STATUS.INACTIVE);

  const audioStart = (event) => {
    setAudioStatus(AUDIO_STATUS.PLAYING);
    if (onStart) onStart();
  };

  const audioLoaded = (event) => {
    // setAudioStatus(AUDIO_STATUS.READY);
    if (onLoaded) onLoaded();
  };

  const audioPause = (event) => {
    setAudioStatus(AUDIO_STATUS.PAUSED);
    if (onPause) onPause();
  }

  const audioEnd = (event) => {
    setAudioStatus(AUDIO_STATUS.INACTIVE);
    if (onEnd) onEnd();
  };

  useEffect(() => {
    if(src) {
      let audio = new Audio(src);
      audioRef.current = audio;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.onplay = audioStart;
      audioRef.current.onended = audioEnd;
      audioRef.current.onpause = audioPause;
      audioRef.current.onloadeddata = audioLoaded;
    }
  }, [src])

  const play = () => {
    if(audioRef.current) {
      audioRef.current.play();
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      delete audioRef.current;
    }
  };

  return {
    audioStatus,
    play,
    pause,
    stop,
  };
}


export function useQueryParams(navigate=true ) {
  const router = useRouter();
  const pathname = usePathname();

  const updateQueryParams = (newParams) => {
    const currentParams = new URLSearchParams(router.query);

    // Merge new parameters
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] === undefined) {
        currentParams.delete(key); // Remove param if value is undefined
      } else {
        currentParams.set(key, newParams[key]);
      }
    });

    // Construct the new URL
    const newUrl = `${pathname}?${currentParams.toString()}`;

    // Update without refreshing the page
    if(navigate) router.push(newUrl, undefined, { shallow: true });
    return newUrl;
  };

  return updateQueryParams;
}
