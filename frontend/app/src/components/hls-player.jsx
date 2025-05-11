"use client"

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import {cn} from "@/lib/utils";

const HLSPlayer = (props) => {
  const { src, autoPlay = false, controls = true, width = "100%", height = "auto", className = "" } = props
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS.js error:", data);
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (autoPlay) video.play();
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls={controls}
      width={width}
      height={height}
      className={cn('bg-black', className)}
    />
  );
};

export default HLSPlayer;
