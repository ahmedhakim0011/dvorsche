"use client";

import { useActionState, type ReactNode } from "react";
import type { State } from "@/app/admin/actions";

/** Wraps a server action that returns { error | ok } and shows the result inline. */
export default function ActionForm({
  action,
  children,
  submit,
  className = "",
  btnClass = "a-btn",
}: {
  action: (prev: State, f: FormData) => Promise<State>;
  children: ReactNode;
  submit: string;
  className?: string;
  btnClass?: string;
}) {
  const [state, run, pending] = useActionState(action, undefined);
  return (
    <form action={run} className={className}>
      {children}
      <button className={btnClass} disabled={pending}>
        {pending ? "Saving…" : submit}
      </button>
      {state?.error && <p className="a-err" role="alert">{state.error}</p>}
      {state?.ok && <p className="a-ok" role="status">{state.ok}</p>}
    </form>
  );
}
