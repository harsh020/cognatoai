"use client"

import Image from "next/image";
import Hero from "@/components/sections/hero";
import TechStack from "@/components/sections/tech-stack";
import UseCases from "@/components/sections/use-cases";
import Features from "@/components/sections/features";
import Pricing from "@/components/sections/pricing";
import ConnectWithUs from "@/components/sections/connect-with-us";

export default function Home() {
  return (
    <div className="flex flex-col h-full w-full">
      <Hero />
      <TechStack />
      <UseCases />
      <Features />
      <Pricing />
      <ConnectWithUs />
    </div>
  );
}
