'use client'

// Note: react-icon-cloud generates random container and canvas IDs on each render, causing server/client hydration mismatches.
// We disable SSR for the Cloud component to ensure consistent rendering on client-only.


import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import {
  fetchSimpleIcons,
  renderSimpleIcon,
  SimpleIcon,
} from 'react-icon-cloud';

// Import the Cloud component only on the client to avoid SSR hydration mismatch
const CloudNoSSR = dynamic(
  () => import('react-icon-cloud').then(mod => mod.Cloud),
  { ssr: false }
);

export const cloudProps = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingTop: 40,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: 'default',
    tooltip: 'native',
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: '#0000',
    maxSpeed: 0.04,
    minSpeed: 0.02,
  },
};

/**
 * IconCloudClient
 * Props:
 *   iconSlugs: string[] - an array of icon slug identifiers
 */
export function IconCloudClient({ iconSlugs }) {
  const [icons, setIcons] = useState([]);
  const { theme } = useTheme();

  // Fetch the simple icons once when iconSlugs change
  useEffect(() => {
    let mounted = true;
    fetchSimpleIcons({ slugs: iconSlugs }).then(result => {
      if (mounted && result.simpleIcons) {
        setIcons(Object.values(result.simpleIcons));
      }
    });
    return () => { mounted = false; };
  }, [iconSlugs]);

  // Render icons only when data and theme are ready
  const renderedIcons = useMemo(() => {
    return icons.map(icon =>
      renderSimpleIcon({
        icon,
        bgHex: theme === 'light' ? '#f3f2ef' : '#080510',
        fallbackHex: theme === 'light' ? '#6e6e73' : '#ffffff',
        minContrastRatio: theme === 'dark' ? 2 : 1.2,
        size: 42,
        aProps: { onClick: e => e.preventDefault() },
      })
    );
  }, [icons, theme]);

  return (
    <CloudNoSSR {...cloudProps}>
      {renderedIcons}
    </CloudNoSSR>
  );
}
