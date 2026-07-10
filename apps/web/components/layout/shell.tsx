"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ConnectionIndicator } from "./indicator";
import { OrganisationProvider } from "./provider";
import { OrganisationSwitcher } from "./switcher";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <OrganisationProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <FileText className="size-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                  Contract Console
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Operations workspace
                </p>
              </div>

              <nav className="ml-5 hidden border-l border-border pl-5 md:block">
                <Link
                  href="/"
                  className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-foreground"
                >
                  Contracts
                </Link>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ConnectionIndicator />
              <OrganisationSwitcher />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          {children}
        </main>
      </div>
    </OrganisationProvider>
  );
}
