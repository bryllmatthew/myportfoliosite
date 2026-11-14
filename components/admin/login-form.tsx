"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { signIn, type LoginState } from "@/lib/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { error: null });
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      {state.error ? (
        <p id="login-error" role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
          {state.error}
        </p>
      ) : null}
      <Field id="email" label="Email">
        {(aria) => (
          <Input
            {...aria}
            aria-describedby={state.error ? "login-error" : undefined}
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
        )}
      </Field>
      <Field id="password" label="Password">
        {(aria) => <Input {...aria} name="password" type="password" autoComplete="current-password" required />}
      </Field>
      <Button type="submit" size="lg" loading={pending} className="mt-2 w-full">
        {pending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
