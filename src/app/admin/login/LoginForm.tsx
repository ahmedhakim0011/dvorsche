"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export default function LoginForm() {
  const [state, run, pending] = useActionState(signIn, undefined);
  return (
    <form action={run} className="a-form">
      <label>Email<input name="email" type="email" autoComplete="username" required autoFocus /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="a-btn a-btn-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      {state?.error && <p className="a-err" role="alert">{state.error}</p>}
    </form>
  );
}
