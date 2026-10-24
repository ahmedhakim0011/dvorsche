"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_KEY, GA_ID } from "@/lib/analytics";

type Choice = "granted" | "denied" | null;

/**
 * Google Analytics 4 behind explicit consent. Nothing loads, and no banner shows, unless NEXT_PUBLIC_GA_ID is set.
 * The script is only injected after the visitor accepts, so no analytics request is made before consent
 * (the safe default for the UK, EU and Canada). The choice is stored locally and can be changed from the footer.
 */
export default function Analytics() {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const v = localStorage.getItem(CONSENT_KEY);
      if (v === "granted" || v === "denied") setChoice(v);
    } catch {}
    setReady(true);
    const reopen = () => setChoice(null);
    window.addEventListener("dv:open-consent", reopen);
    return () => window.removeEventListener("dv:open-consent", reopen);
  }, []);

  if (!GA_ID || !ready) return null;

  const decide = (v: "granted" | "denied") => {
    try {
      localStorage.setItem(CONSENT_KEY, v);
    } catch {}
    setChoice(v);
  };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {choice === null && (
        <div className="consent" role="dialog" aria-label="Analytics preferences">
          <p>We use analytics cookies to understand how the site is used. They are off unless you accept.</p>
          <div className="consent-actions">
            <button className="btn btn-ghost" onClick={() => decide("denied")}>Decline</button>
            <button className="btn btn-dark" onClick={() => decide("granted")}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
