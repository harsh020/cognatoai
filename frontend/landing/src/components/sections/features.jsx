"use client"


import React from "react";
import {BarChart3, Bot, PlugZap, Eye, Lock, Search, Settings, Sparkles} from "lucide-react";
import { GlowingEffect } from "@/components/glowing-effect";
import BackgroundGrid from "@/components/background-grid";


const features = [
  {
    icon: <Bot />,
    title: "Realistic AI-Powered Interviews",
    description:
      "Simulate real-world technical interviews with smart follow-ups, coding tasks, and DSA questions—just like you'd expect in actual hiring.",
    gridArea: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
  },
  {
    icon: <Settings />,
    title: "Modular & Customizable",
    description:
      "Choose from prebuilt skill modules or add your own questions. Whether it's Python or Spring Boot, customize every interview to your needs.",
    gridArea: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
  },
  {
    icon: <PlugZap />,
    title: "API-First Design",
    description:
      "Integrate the platform into your existing system effortlessly—whether you’re a recruitment firm or a fast-moving startup.",
    gridArea: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
  },
  {
    icon: <BarChart3 />,
    title: "Actionable Reports",
    description:
      "Get concise summaries, performance breakdowns, and code quality insights—so you spend less time reviewing and more time deciding.",
    gridArea: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
  },
  {
    icon: <Eye />,
    title: "Candidate Monitoring",
    description:
      "Interviews include screen recording and tab switch tracking to help you spot any suspicious behavior—simple, honest insights without invading privacy.",
    gridArea: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
  }
  // {
  //   icon: <ShieldCheck />,
  //   title: "Anti-Cheating Capabilities",
  //   description:
  //     "Detect unusual patterns, behavior, or tools used during interviews to help ensure fairness and protect the integrity of your hiring.",
  // },
];


export default function Features() {
  return (
    <section className="relative mx-auto p-16 md:py-24 ">
      <div className="mb-12 text-center">
        <h2 className="mb-4 md:text-4xl text-2xl tracking-tight md:text-4xl m-auto">
          <span className=''>Build with the</span>{' '}
          <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>essentials</span>
          <br />
          <span className=''>Designed for</span>{' '}
          <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>real-world interviews</span>
        </h2>
        <p className="mx-auto max-w-2xl md:text-lg text-sm text-muted-foreground">
          Keep things simple yet powerful — everything you need to run, review, and rely on high-quality AI interviews.
        </p>
      </div>

      <ul
        className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">

        {
          features.map((feature, index) => (
            <GridItem
              key={index}
              area={feature.gridArea}
              icon={feature.icon}
              title={feature.title}
              description={feature.description} />
          ))
        }
      </ul>
    </section>
  );
}

const GridItem = ({
  area,
  icon,
  title,
  description
}) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-5">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01} />
        <div
          className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 ">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-2 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3
                className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h3>
              <h2
                className="font-sans text-sm/[1.125rem] md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
