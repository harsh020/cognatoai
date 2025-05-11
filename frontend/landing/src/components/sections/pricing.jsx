"use client"

import React from 'react';
import {PricingCards} from "@/components/pricing-cards";


const plans = [
  {
    name: "TRIAL",
    currency: '$',
    price: 0,
    description: "Great for individuals and small teams to try the product",
    className: 'border bg-background',
    features: [
      { name: "Up to 5 AI interviews", included: true },
      { name: "Realistic interviewer simulation", included: true },
      { name: "Interview recording, & transcripts", included: true },
      { name: "Tab switch tracking + screen recording", included: true, highlight: true },
      { name: "Interview approval required (can take up to 24 hours)", included: true },
      { name: "Email support", included: true },
    ],
    cta: {
      text: "Get started",
      href: "/signup",
    }
  },
  {
    name: "ENTERPRISE",
    currency: null,
    price: "Custom",
    interval: " ",
    description: "For large organizations and enterprises",
    className: 'border bg-gradient-to-br from-indigo-400/20 via-sky-500/20 to-rose-400/20 ',
    highlight: true,
    features: [
      { name: "Unlimited interviews", included: true },
      { name: "Realistic interviewer simulation", included: true },
      { name: "Interview recording, & transcripts", included: true },
      { name: "Tab switch tracking + screen recording", included: true, highlight: true },
      { name: "Interview auto-approved", included: true },
      { name: "Priority support & onboarding", included: true },
      { name: "API first design (coming soon)", included: false },
    ],
    cta: {
      className: 'bg-background text-foreground hover:bg-background/80',
      text: "Contact Us",
      onClick: () => window.open(process.env.NEXT_PUBLIC_CAL_LINK, '_blank'),
    }
  },
];

function Pricing({  }) {
  return (
    <section className="relative mx-auto py-16 md:py-24 w-full bg-muted/50 dark:bg-muted/20">
      <div className="mb-12 text-center">
        <h2 className="mb-4 md:text-4xl text-2xl tracking-tight md:text-4xl m-auto">
          <span className=''>Simple</span>{' '}
          <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>pricing</span>
          <br />
          <span className=''>that scales with</span>{' '}
          <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>you</span>
        </h2>
        <p className="mx-auto max-w-2xl md:text-lg text-sm text-muted-foreground">
          Start for free. Upgrade when you're ready. Custom plans for teams that need more control.
        </p>
      </div>

      <div className='flex flex-row h-full w-full'>
        <PricingCards tiers={plans} sectionClassName='mx-auto bg-transparent py-6 sm:py-4 md:py-2' />
      </div>
    </section>
  );
}

export default Pricing;