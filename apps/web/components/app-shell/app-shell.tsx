"use client";

import type { ReactNode } from "react";
import { ConnectionIndicator } from "./connection-indicator";
import { OrganisationSwitcher } from "./organisation-switcher";
import { OrganisationProvider } from "./organisation-provider";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <OrganisationProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Contract Ops
              </p>
              <h1 className="text-lg font-semibold tracking-normal">Operations Console</h1>
            </div>

            <div className="flex items-center gap-3">
              <ConnectionIndicator />
              <OrganisationSwitcher />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </OrganisationProvider>
  );
}
