"use client";

import { LoginScreen } from "@/components/session/login";
import { useSession } from "@/components/session/provider";
import { Button } from "@/components/ui/button";
import { Building2, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ConnectionIndicator } from "./indicator";
import { OrganisationProvider } from "./provider";
import { WorkspaceName } from "./workspace";

export function AppShell({ children }: { children: ReactNode }) {
  const { account, isReady, signOut } = useSession();
  const pathname = usePathname();

  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!account) {
    return <LoginScreen />;
  }

  return (
    <OrganisationProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                  Contract Console
                </p>
              </div>

              <nav className="ml-5 hidden border-l border-border pl-5 md:block">
                <div className="flex items-center gap-1">
                  <Link
                    href="/"
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === "/"
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    Contracts
                  </Link>
                  <Link
                    href="/organisation"
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === "/organisation"
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    Organisation
                  </Link>
                </div>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ConnectionIndicator />
              <WorkspaceName />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
                onClick={signOut}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <div className="mb-5 flex gap-2 md:hidden">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                pathname === "/" ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              <FileText className="size-4" />
              Contracts
            </Link>
            <Link
              href="/organisation"
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                pathname === "/organisation"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Building2 className="size-4" />
              Organisation
            </Link>
          </div>
          {children}
        </main>
      </div>
    </OrganisationProvider>
  );
}
