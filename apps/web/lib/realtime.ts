import type { ContractRealtimeEvent } from "@contract-console/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function subscribeToContractEvents(
  organisationId: string,
  handlers: {
    onOpen?: () => void;
    onError?: () => void;
    onContractChanged: (event: ContractRealtimeEvent) => void;
  }
) {
  const source = new EventSource(`${API_BASE_URL}/organisations/${organisationId}/realtime/contracts`);

  source.onopen = () => {
    handlers.onOpen?.();
  };

  source.onerror = () => {
    handlers.onError?.();
  };

  source.addEventListener("contract-changed", (message) => {
    handlers.onContractChanged(JSON.parse(message.data) as ContractRealtimeEvent);
  });

  return () => {
    source.close();
  };
}
