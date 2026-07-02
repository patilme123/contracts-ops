import type { ContractStatusChangedEvent } from "@contract-console/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function subscribeToContractEvents(
  organisationId: string,
  onStatusChanged: (event: ContractStatusChangedEvent) => void
) {
  const source = new EventSource(`${API_BASE_URL}/organisations/${organisationId}/realtime/contracts`);

  source.addEventListener("contract-status-changed", (message) => {
    onStatusChanged(JSON.parse(message.data) as ContractStatusChangedEvent);
  });

  return () => {
    source.close();
  };
}
