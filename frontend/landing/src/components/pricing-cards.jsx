"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import Link from 'next/link';
import {CheckIcon, ArrowRightIcon} from "lucide-react";


export function PricingCards({
 tiers,
 className,
 containerClassName,
 cardClassName,
 sectionClassName,
 ...props
}) {
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0",
        sectionClassName
      )}
    >
      <div className={cn("w-full max-w-5xl mx-auto px-4", containerClassName)} {...props}>
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8", className)}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative group",
                "rounded-2xl transition-all duration-500",
                tier.className
              )}
            >
              <div className="md:p-10 p-6 flex flex-col h-full">
                <div className="space-y-4">
                  <h3 className={cn(
                    "md:text-lg text-md uppercase tracking-wider font-medium",
                  )}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "md:text-5xl text-3xl font-light",
                    )}>
                      {tier.currency}{tier.price}
                    </span>
                    <span className={cn(
                      "md:text-sm text-xs",
                    )}>
                      {tier.interval || "one-time"}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm pb-6 border-b border-foreground/20",
                  )}>
                    {tier.description}
                  </p>
                </div>

                <div className="mt-8 md:space-y-4 space-y-2 flex-grow">
                  {tier.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                        feature.included
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-300 dark:text-neutral-700"
                      )}>
                        <CheckIcon className="w-3.5 h-3.5"/>
                      </div>
                      <span className={cn(
                        "text-sm",
                      )}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {tier.cta && (
                  <div className="mt-8">
                    <Button
                      className={cn(
                        "w-full md:h-12 h-10 group relative",
                        "transition-all duration-300",
                        tier.cta.className
                      )}
                      onClick={tier.cta.onClick}
                      asChild={Boolean(tier.cta.href)}
                    >
                      {tier.cta.href ? (
                        <Link href={tier.cta.href}>
                          <span
                            className="relative z-10 flex items-center justify-center gap-2 md:font-medium tracking-wide">
                              {tier.cta.text}
                            <ArrowRightIcon
                              className="w-4 h-4 transition-transform group-hover:translate-x-1"/>
                          </span>
                        </Link>
                      ) : (
                        <span
                          className="relative z-10 flex items-center justify-center gap-2 font-medium tracking-wide">
                            {tier.cta.text}
                          <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1"/>
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}