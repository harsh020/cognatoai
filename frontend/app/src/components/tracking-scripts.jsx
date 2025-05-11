import React from 'react';
import Script from "next/script";

function TrackingScripts({  }) {
  return (
    <>
      {/* Microsoft Clarity */}
      {
        process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_KEY && (
          <Script
            id="ms-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_KEY}");
            `,
            }}
          />
        )
      }

      {/* Google Analytics 4 */}
      {
        process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_KEY && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-CEXHPKHSYM"
              strategy="afterInteractive"
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_KEY}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )
      }
      {/*gtag('config', 'G-CEXHPKHSYM');*/}
    </>
  );
}

export default TrackingScripts;