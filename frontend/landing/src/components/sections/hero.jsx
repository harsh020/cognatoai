"use client"


import React, { Suspense, useRef, useState, useMemo, useId } from 'react';
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {SplashCursor} from "@/components/splash-cursor";
import BackgroundDots from "@/components/background-dots";
import Image from 'next/image';


function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroV1({
 badge = "Try beta now",
 title1 = "Revolutionize Your",
 title2 = "Hiring With AI",
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/*<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-xl" />*/}

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/40"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/40"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/40"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/40"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/40"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8 md:mb-12"
          >
            <Circle className="h-2 w-2 fill-rose-500/80" />
            <span className="text-sm text-foreground/60 tracking-wide">
                            {badge}
                        </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
                  {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300 "
                )}
              >
                  {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-md md:text-lg text-foreground/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
              Conduct automated interviews, gain deep insights, and provide consistent feedback. Find the best candidates faster.
            </p>
          </motion.div>
        </div>
      </div>

      {/*<div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />*/}

      <SplashCursor />
    </div>
  );
}


export default function Hero({ }) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.08,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className='relative h-full w-full pb-10 pt-42 overflow-hidden'>
      <SplashCursor className='absolute h-full' />
      {/*<BackgroundGrid className='-z-20' maskClassName='-z-20' />*/}
      <BackgroundDots className='-z-30 opacity-25' maskClassName='-z-10' />
      {/* Main hero text section */}
      <div className='m-auto'>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8 md:mb-12 bg-foreground/5"
          >
            <Circle className="h-2 w-2 fill-rose-500/80" />
            {/*✨*/}
            <span className="text-sm text-foreground/60 tracking-wide">
              Try Beta Now
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-6xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
                  Say buh‑bye to lame screening
              </span>
              <br/>
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400 "
                )}
              >
                  AI Interviewers
              </span>
              {' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
                  that slay
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400 "
                )}
              >

              </span>
              {' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
                  zero bs
              </span>

            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-md md:text-lg text-foreground/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
              Conduct automated interviews, gain deep insights, and provide consistent feedback. Find the best candidates faster.
            </p>
          </motion.div>
        </div>
      </div>

      <div className='mx-auto items-center justify-center w-full'>
        <motion.div
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="items-center gap-2 flex flex-row w-[90%] md:w-[80%] lg:w-[70%] justify-center mx-auto"
        >
          <div className='mx-auto'>
            <Image
              className='mx-auto'
              src='/illustrations/product-mockup-xdr.webp'
              loading="lazy" alt='product mockup' height={1216} width={2049} />
          </div>

        </motion.div>
      </div>

    </div>
  )
}