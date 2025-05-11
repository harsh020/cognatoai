import "./globals.css";
import React from "react";
import App from "@/app/app";
import TrackingScripts from "@/components/tracking-scripts";


export const metadata = {
  title: "Cognato AI - Realistic AI Interviewer",
  description:
    "Cognato AI offers realistic, AI-powered interview simulations for software engineers. Prepare for interviews or streamline hiring processes with our platform.",

  // Primary Meta Tags
  author: "Cognato AI",
  keywords:
    "AI interviewer, interview practice, software engineering interview, Cognato AI, coding interview, technical interview, interview simulator, AI for hiring",
  robots: "index, follow",
  canonical: "https://cognatoai.com",

  // Open Graph Tags
  openGraph: {
    title: "AI Interviewer - Cognato AI",
    description:
      "Simulate real-world end-to-end interviews with AI Interviewers. Prepare for interviews effectively with Cognato AI.",
    images: [
      {
        url: "https://storage.googleapis.com/cognato-ai-europe-west3/assets/cognatoai-card.png",
        width: 1200,
        height: 630,
        alt: "Cognato AI - Realistic AI Interviewer",
      },
    ],
    url: "https://cognatoai.com",
    type: "website",
    siteName: "Cognato AI",
    locale: "en_US",
  },

  // Twitter Card Tags
  twitter: {
    card: "summary_large_image",
    site: "@__harsh020__", // Replace with your Twitter handle
    title: "AI Interviewer - Cognato AI",
    description:
      "Simulate real-world end-to-end interviews with AI Interviewers. Prepare for interviews effectively with Cognato AI.",
    image: "https://storage.googleapis.com/cognato-ai-europe-west3/assets/cognatoai-card.png",
    url: "https://cognatoai.com",
  },

  // Favicon and Icons
  icons: {
    icon: "/app/favicon.ico",
    apple: "/app/apple-touch-icon.png",
    icon32: "/app/favicon-32x32.png",
    icon16: "/app/favicon-16x16.png",
  },

  manifest: "/app/manifest.json", // Manifest file link

  // Fonts
  fonts: {
    preconnect: [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ],
    link: [
      {
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
        rel: "stylesheet",
      },
    ],
  },

  // Preload heavy image
  // links: [
  //   {
  //     rel: "preload",
  //     href: "/illustrations/",
  //     as: "image",
  //   },
  // ],
};


export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <TrackingScripts />

        <App>
          {children}
        </App>
      </body>
    </html>
  );
}
