import { ContractEventType, ContractStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const contracts = [
  {
    orgSlug: "northstar-logistics",
    contractNumber: "CON-0001",
    status: ContractStatus.DRAFT,
    payload: {
      client_name: "Apex Manufacturing",
      po_ref_no: "PO-2026-1001",
      po_date: "2026-01-15",
      payment_terms: "Net 30",
      delivery_terms: "FOB Mumbai",
      items: [
        {
          description: "Industrial packing materials",
          quantity: 1200,
          quantity_unit: "units",
          unit_price: 4.5,
          pricing_unit: "unit",
          total: 5400
        }
      ]
    }
  },
  {
    orgSlug: "northstar-logistics",
    contractNumber: "CON-0002",
    status: ContractStatus.FINALIZED,
    payload: {
      client_name: "Vertex Retail Group",
      po_ref_no: "PO-2026-1018",
      po_date: "2026-02-02",
      payment_terms: "Net 45",
      items: [
        {
          description: "Regional freight handling",
          quantity: 18,
          quantity_unit: "shipments",
          unit_price: 750,
          pricing_unit: "shipment",
          total: 13500
        }
      ]
    }
  },
  {
    orgSlug: "northstar-logistics",
    contractNumber: "CON-0003",
    status: ContractStatus.ARCHIVED,
    payload: {
      client_name: "Blue Harbor Imports",
      po_ref_no: "PO-2025-0884",
      po_date: "2025-11-21",
      delivery_terms: "DAP Chennai",
      items: [
        {
          description: "Warehouse storage allocation",
          quantity: 90,
          quantity_unit: "days",
          unit_price: 125,
          pricing_unit: "day",
          total: 11250
        }
      ]
    }
  },
  {
    orgSlug: "atlas-procurement",
    contractNumber: "CON-1001",
    status: ContractStatus.DRAFT,
    payload: {
      client_name: "Meridian Hospitals",
      po_ref_no: "PO-2026-2104",
      po_date: "2026-03-11",
      payment_terms: "Advance 20%, balance Net 30",
      items: [
        {
          description: "Medical-grade storage cabinets",
          quantity: 48,
          quantity_unit: "units",
          unit_price: 310,
          pricing_unit: "unit",
          total: 14880
        }
      ]
    }
  },
  {
    orgSlug: "atlas-procurement",
    contractNumber: "CON-1002",
    status: ContractStatus.FINALIZED,
    payload: {
      client_name: "Summit Office Parks",
      po_ref_no: "PO-2026-2209",
      po_date: "2026-04-05",
      delivery_terms: "CIF Bengaluru",
      items: [
        {
          description: "Facility maintenance supplies",
          quantity: 260,
          quantity_unit: "kits",
          unit_price: 62,
          pricing_unit: "kit",
          total: 16120
        }
      ]
    }
  }
];

async function main() {
  await prisma.contractEvent.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.organisation.deleteMany();

  const organisations = await Promise.all([
    prisma.organisation.create({
      data: {
        name: "Northstar Logistics",
        slug: "northstar-logistics"
      }
    }),
    prisma.organisation.create({
      data: {
        name: "Atlas Procurement",
        slug: "atlas-procurement"
      }
    })
  ]);

  const organisationsBySlug = new Map(
    organisations.map((organisation) => [organisation.slug, organisation])
  );

  for (const seedContract of contracts) {
    const organisation = organisationsBySlug.get(seedContract.orgSlug);

    if (!organisation) {
      throw new Error(`Missing organisation for ${seedContract.orgSlug}`);
    }

    const contract = await prisma.contract.create({
      data: {
        organisationId: organisation.id,
        contractNumber: seedContract.contractNumber,
        status: seedContract.status,
        clientName: seedContract.payload.client_name,
        poRefNo: seedContract.payload.po_ref_no,
        poDate: new Date(`${seedContract.payload.po_date}T00:00:00.000Z`),
        fieldData: seedContract.payload
      }
    });

    await prisma.contractEvent.create({
      data: {
        organisationId: organisation.id,
        contractId: contract.id,
        eventType: ContractEventType.CREATED,
        nextStatus: ContractStatus.DRAFT,
        summary: "Contract created from seed data",
        metadata: { seeded: true }
      }
    });

    if (seedContract.status === ContractStatus.FINALIZED || seedContract.status === ContractStatus.ARCHIVED) {
      await prisma.contractEvent.create({
        data: {
          organisationId: organisation.id,
          contractId: contract.id,
          eventType: ContractEventType.FINALIZED,
          previousStatus: ContractStatus.DRAFT,
          nextStatus: ContractStatus.FINALIZED,
          summary: "Contract finalized from seed data",
          metadata: { seeded: true }
        }
      });
    }

    if (seedContract.status === ContractStatus.ARCHIVED) {
      await prisma.contractEvent.create({
        data: {
          organisationId: organisation.id,
          contractId: contract.id,
          eventType: ContractEventType.ARCHIVED,
          previousStatus: ContractStatus.FINALIZED,
          nextStatus: ContractStatus.ARCHIVED,
          summary: "Contract archived from seed data",
          metadata: { seeded: true }
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
