"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type DemoAccount = {
  name: string;
  email: string;
  password: string;
  role: string;
  organisationSlug: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    name: "Nadia Shah",
    email: "nadia@northstar.demo",
    password: "northstar-demo",
    role: "Operations Lead",
    organisationSlug: "northstar-logistics"
  },
  {
    name: "Arjun Mehta",
    email: "arjun@atlas.demo",
    password: "atlas-demo",
    role: "Procurement Manager",
    organisationSlug: "atlas-procurement"
  }
];

type SessionContextValue = {
  account: DemoAccount | null;
  isReady: boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
};

const SESSION_KEY = "contract-console-demo-account";
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const email = window.localStorage.getItem(SESSION_KEY);
    setAccount(demoAccounts.find((candidate) => candidate.email === email) ?? null);
    setIsReady(true);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      account,
      isReady,
      signIn(email, password) {
        const nextAccount = demoAccounts.find(
          (candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password
        );

        if (!nextAccount) {
          return false;
        }

        window.localStorage.setItem(SESSION_KEY, nextAccount.email);
        window.localStorage.removeItem("selectedOrganisationId");
        setAccount(nextAccount);
        return true;
      },
      signOut() {
        window.localStorage.removeItem(SESSION_KEY);
        window.localStorage.removeItem("selectedOrganisationId");
        setAccount(null);
      }
    }),
    [account, isReady]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return value;
}
