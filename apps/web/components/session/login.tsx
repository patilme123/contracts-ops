"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { demoAccounts, useSession } from "./provider";

export function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState(demoAccounts[0].email);
  const [password, setPassword] = useState(demoAccounts[0].password);
  const [error, setError] = useState<string | null>(null);

  function selectAccount(nextEmail: string) {
    const account = demoAccounts.find((candidate) => candidate.email === nextEmail);

    if (!account) {
      return;
    }

    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(signIn(email, password) ? null : "Choose a listed demo account or use its matching password.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border-b border-border bg-muted/45 p-6 sm:p-9 lg:border-b-0 lg:border-r">
          {/* <div className="flex size-10 items-center justify-center rounded-md bg-foreground text-background">
            <LockKeyhole className="size-5" />
          </div> */}
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Contract Console</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Select a seeded workspace account to review organisation-scoped contracts,
            and workflow status.
          </p>

          <div className="mt-2 space-y-3">
            {demoAccounts.map((account) => {
              const selected = account.email === email;

              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => selectAccount(account.email)}
                  className={`w-full rounded-md border p-4 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {account.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">{account.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{account.role}</span>
                      <span className="mt-3 block text-xs text-muted-foreground">{account.email}</span>
                      <span className="mt-1 block text-sm font-medium text-foreground font-mono">
                        {(account.organisationSlug).split("-").map((part) => part[0].toUpperCase() + part.slice(1))
                        .join(" ")}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="p-6 sm:p-9">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <UserRound className="size-4 text-primary" />
            Sign in to workspace
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This local access screen is included for assignment demonstration only.
          </p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full">
              Enter workspace
            </Button>
          </form>

          {/* <div className="mt-8 flex gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Demo credentials are local to this browser. Production access would use an
            identity provider and server-verified sessions.
          </div> */}
        </section>
      </div>
    </main>
  );
}
