"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import {cn} from "@/lib/utils";
import {Building2, Users, BriefcaseBusiness} from "lucide-react";
import BackgroundGrid from "@/components/background-grid"; // Adjust path if needed

const useCases = [
  {
    icon: <Building2 />,
    title: "Organizations",
    description:
      "Efficient, scalable, and fair hiring. Automate your technical screening process with high-quality, AI-driven interviews. Save valuable engineering hours, reduce hiring bias, and identify top talent with consistency and confidence.",
    gridSpan: "md:col-span-1",
  },
  {
    icon: <Users />,
    title: "Candidates",
    description:
      "Ace interviews with real-world practice. Simulate industry-level technical interviews, receive instant feedback, and improve with each session. Whether you’re preparing for your first job or your next big move—practice makes perfect, and we make it real.",
    gridSpan: "md:col-span-1",
  },
  {
    icon: <BriefcaseBusiness />,
    title: "Recruitment Agencies",
    description:
      "Handle hiring without compromising quality. Customize interview modules, manage candidate pipelines, and deliver detailed reports. With an API-first design, integrate our platform into yours seamlessly—Cognato AI helps you become the recruitment partner every company needs.",
    gridSpan: "md:col-span-2",
  },
  // --- Example of making one card wider ---
  // Uncomment below and comment out the 3 above to see a 2-1 layout
  // {
  //   emoji: "👩‍💻",
  //   title: "For Candidates",
  //   description: "Ace interviews with real-world practice...",
  //   gridSpan: "lg:col-span-1", // Takes 1 column on large screens
  // },
  // {
  //   emoji: "🏢",
  //   title: "For Organizations",
  //   description: "Efficient, scalable, and fair hiring...",
  //   gridSpan: "lg:col-span-2", // Takes 2 columns on large screens
  // },
  // {
  //   emoji: "🤝",
  //   title: "For Recruitment Agencies",
  //   description: "Streamline assessments for multiple clients...",
  //   gridSpan: "lg:col-span-3", // Takes full width below the first two on large
  // }
  // You'd need to adjust the grid definition below for the above example (e.g., `lg:grid-cols-3`)
];

export default function UseCases() {
  return (
    <section className="relative mx-auto py-16 md:py-24 w-full">
      <BackgroundGrid className='-z-20 opacity-40' maskClassName='-z-20' />

      <div className='mx-auto w-[70%]'>
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 md:text-4xl text-2xl tracking-tight md:text-4xl m-auto">
            <span className=''>Multiple</span>{' '}
            <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>Use Cases</span>
          </h2>
          <p className="mx-auto max-w-2xl md:text-lg text-sm text-muted-foreground">
            Built to serve every side of the hiring experience. Whether you're
            preparing, hiring, or scaling—Cognato AI has you covered.
          </p>
        </div>

        {/* Bento Grid Layout */}
        {/* Adjust grid-cols-* for different layouts. lg:grid-cols-3 is a standard 3-col layout */}
        {/* md:grid-cols-2 makes it 2 columns on medium screens */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {useCases.map((useCase, index) => (
            <Card
              key={index}
              // Use gridSpan defined in the data. Add 'h-full' if you want cards in the same row to have equal height.
              className={cn(`flex flex-col h-full shadow-none bg-muted/50 border-none`, useCase.gridSpan)}
            >
              <CardHeader>
                <CardTitle>
                  <span className="md:text-3xl text-xl">{useCase.icon}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-12"> {/* flex-grow makes content take available space */}
                <p className='md:text-lg text-md pb-2'>{useCase.title}</p>
                <p className="md:text-md text-sm text-muted-foreground">
                  {useCase.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}