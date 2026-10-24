"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setState(r?.ok ? "done" : "error");
  }

  return (
    <section className="newsletter" aria-labelledby="nl-title">
      <div className="newsletter-in deco">
        <p className="eyebrow">The D’Vorsche Letter</p>
        <h2 className="serif" id="nl-title">Quiet news, occasionally.</h2>
        <p className="muted">New pieces, and first access to limited editions. Never more than twice a month.</p>
        {state === "done" ? (
          <p className="ok" role="status">Thank you — you are on the list.</p>
        ) : (
          <form onSubmit={submit} className="nl-form">
            <input type="email" required placeholder="Your email address" aria-label="Email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-dark" disabled={state === "busy"}>
              {state === "busy" ? "Joining…" : "Subscribe"}
            </button>
          </form>
        )}
        {state === "error" && <p className="err" role="alert">Please enter a valid email address.</p>}
      </div>
    </section>
  );
}
