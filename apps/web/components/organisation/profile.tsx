"use client";

import { useOrganisationContext } from "@/components/layout/provider";
import { Badge } from "@/components/ui/badge";
import { getOrganisation, listOrganisationMembers } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/queries";
import type { OrganisationMember } from "@contract-console/shared";
import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, Globe2, Mail, Users } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function roleLabel(role: OrganisationMember["role"]) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function OrganisationProfile() {
  const { selectedOrganisationId, isLoadingOrganisations } = useOrganisationContext();
  const profileQuery = useQuery({
    queryKey: selectedOrganisationId
      ? queryKeys.organisation(selectedOrganisationId)
      : ["organisation", "empty"],
    queryFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return (await getOrganisation(selectedOrganisationId)).data;
    },
    enabled: Boolean(selectedOrganisationId)
  });
  const membersQuery = useQuery({
    queryKey: selectedOrganisationId
      ? queryKeys.organisationMembers(selectedOrganisationId)
      : ["organisation-members", "empty"],
    queryFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return (await listOrganisationMembers(selectedOrganisationId)).data;
    },
    enabled: Boolean(selectedOrganisationId)
  });

  const profile = profileQuery.data;
  const members = membersQuery.data ?? [];
  const isLoading = isLoadingOrganisations || profileQuery.isLoading || membersQuery.isLoading;
  const error =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : membersQuery.error instanceof Error
        ? membersQuery.error.message
        : null;

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Loading workspace...</p>;
  }

  if (error || !profile) {
    return <p className="py-16 text-center text-sm text-destructive">{error ?? "Workspace unavailable"}</p>;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Organisation workspace</p>
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">
            {profile.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage contract operations with the team assigned to this workspace.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {profile.memberCount} members
        </Badge>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Organisation profile</p>
              <p className="mt-1 text-sm text-muted-foreground">{profile.slug}</p>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
            {profile.description ?? "No organisation description has been added."}
          </p>
        </div>

        <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 text-sm">
            <Globe2 className="size-4 text-primary" />
            <dt className="text-muted-foreground">Timezone</dt>
            <dd className="ml-auto font-medium text-foreground">{profile.timezone}</dd>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 text-sm">
            <CalendarDays className="size-4 text-primary" />
            <dt className="text-muted-foreground">Workspace created</dt>
            <dd className="ml-auto font-medium text-foreground">
              {formatDate(profile.createdAt)}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Team members</h2>
          </div>
          <span className="text-sm text-muted-foreground">{members.length} people</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <article key={member.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                  {initials(member.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{member.name}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{member.title}</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-5">
                {roleLabel(member.role)}
              </Badge>
              <p className="mt-4 flex min-w-0 items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
