"use client";

import { useOrganisationContext } from "@/components/layout/provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganisation, listOrganisationMembers } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/queries";
import type { OrganisationMember } from "@contract-console/shared";
import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, Globe2, Users } from "lucide-react";

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
          <p className="mb-1 text-sm font-medium text-primary">Workspace settings</p>
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">Organisation</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Organisation information and the people who support its contract operations.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {profile.memberCount} team members
        </Badge>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </span>
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{profile.slug}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {profile.description ?? "No organisation description has been added."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>Workspace details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 text-sm">
            <div className="flex items-center gap-3">
              <Globe2 className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Timezone</span>
              <span className="ml-auto font-medium text-foreground">{profile.timezone}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Workspace created</span>
              <span className="ml-auto font-medium text-foreground">
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Team</h2>
          </div>
          <span className="text-sm text-muted-foreground">{members.length} people</span>
        </div>
        <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {initials(member.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{member.name}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{member.title}</p>
                <p className="mt-2 truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <Badge variant="secondary" className="ml-auto hidden shrink-0 lg:inline-flex">
                {roleLabel(member.role)}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
