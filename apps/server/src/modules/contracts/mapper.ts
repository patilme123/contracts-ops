import type { Prisma } from "@contract-console/database";

type ContractSummaryRecord = {
  id: string;
  organisationId: string;
  contractNumber: string;
  status: string;
  clientName: string;
  poRefNo: string;
  poDate: Date;
  updatedAt: Date;
};

type ContractDetailRecord = ContractSummaryRecord & {
  fieldData: Prisma.JsonValue;
  createdAt: Date;
};

export function mapContractSummary(contract: ContractSummaryRecord) {
  return {
    ...contract,
    poDate: contract.poDate.toISOString().slice(0, 10),
    updatedAt: contract.updatedAt.toISOString()
  };
}

export function mapContractDetail(contract: ContractDetailRecord) {
  return {
    ...contract,
    poDate: contract.poDate.toISOString().slice(0, 10),
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString()
  };
}
