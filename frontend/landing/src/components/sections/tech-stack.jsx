"use client"

import React from 'react';
// import {IconCloud} from "@/components/interactive-icon-cloud";
import {IconCloudClient} from "@/components/icon-cloud.client";

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
]

function TechStack({  }) {
  return (
    <div className='flex flex-row gap-4 md:px-20 px-5 py-10 justify-between bg-muted/50 dark:bg-muted/20'>
      <div className='flex flex-col'>
        <h1 className='text-2xl md:text-6xl w-[40vw] m-auto'>
          <span className=''>Seamlessly conduct interviews across various</span>{' '}
          <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>tech stacks</span>
        </h1>
      </div>

      <div className='flex flex-col'>
        <IconCloudClient iconSlugs={slugs} />
      </div>
    </div>
  );
}

export default TechStack;