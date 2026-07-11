import "dotenv/config";
import {
  ContractEventType,
  ContractStatus,
  OrganisationMemberRole,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

const organisations = [
  {
    name: "Northstar Logistics",
    slug: "northstar-logistics",
    description: "Regional freight and warehouse operations across India.",
    timezone: "Asia/Kolkata"
  },
  {
    name: "Atlas Procurement",
    slug: "atlas-procurement",
    description: "Central procurement operations for enterprise facilities.",
    timezone: "Asia/Kolkata"
  }
];

const members = [
  {
    orgSlug: "northstar-logistics",
    name: "Nadia Shah",
    email: "nadia@northstar.demo",
    role: OrganisationMemberRole.OPERATIONS_LEAD,
    title: "Operations Lead"
  },
  {
    orgSlug: "northstar-logistics",
    name: "Dev Malhotra",
    email: "dev@northstar.demo",
    role: OrganisationMemberRole.CONTRACT_SPECIALIST,
    title: "Contract Specialist"
  },
  {
    orgSlug: "northstar-logistics",
    name: "Mira Rao",
    email: "mira@northstar.demo",
    role: OrganisationMemberRole.FINANCE_REVIEWER,
    title: "Finance Reviewer"
  },
  {
    orgSlug: "atlas-procurement",
    name: "Arjun Mehta",
    email: "arjun@atlas.demo",
    role: OrganisationMemberRole.PROCUREMENT_MANAGER,
    title: "Procurement Manager"
  },
  {
    orgSlug: "atlas-procurement",
    name: "Kiran Patel",
    email: "kiran@atlas.demo",
    role: OrganisationMemberRole.FINANCE_REVIEWER,
    title: "Finance Reviewer"
  },
  {
    orgSlug: "atlas-procurement",
    name: "Sana Khan",
    email: "sana@atlas.demo",
    role: OrganisationMemberRole.ADMIN,
    title: "Workspace Administrator"
  }
];

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

async function createSeedEvents(input: {
  organisationId: string;
  contractId: string;
  status: ContractStatus;
}) {
  await prisma.contractEvent.create({
    data: {
      organisationId: input.organisationId,
      contractId: input.contractId,
      eventType: ContractEventType.CREATED,
      nextStatus: ContractStatus.DRAFT,
      summary: "Contract created from seed data",
      metadata: { seeded: true }
    }
  });

  if (input.status === ContractStatus.FINALIZED || input.status === ContractStatus.ARCHIVED) {
    await prisma.contractEvent.create({
      data: {
        organisationId: input.organisationId,
        contractId: input.contractId,
        eventType: ContractEventType.FINALIZED,
        previousStatus: ContractStatus.DRAFT,
        nextStatus: ContractStatus.FINALIZED,
        summary: "Contract finalized from seed data",
        metadata: { seeded: true }
      }
    });
  }

  if (input.status === ContractStatus.ARCHIVED) {
    await prisma.contractEvent.create({
      data: {
        organisationId: input.organisationId,
        contractId: input.contractId,
        eventType: ContractEventType.ARCHIVED,
        previousStatus: ContractStatus.FINALIZED,
        nextStatus: ContractStatus.ARCHIVED,
        summary: "Contract archived from seed data",
        metadata: { seeded: true }
      }
    });
  }
}

async function main() {
  const seededOrganisations = await Promise.all(
    organisations.map((organisation) =>
      prisma.organisation.upsert({
        where: {
          slug: organisation.slug
        },
        create: organisation,
        update: {
          name: organisation.name,
          description: organisation.description,
          timezone: organisation.timezone
        }
      })
    )
  );

  const organisationsBySlug = new Map(
    seededOrganisations.map((organisation) => [organisation.slug, organisation])
  );

  for (const member of members) {
    const organisation = organisationsBySlug.get(member.orgSlug);

    if (!organisation) {
      throw new Error(`Missing organisation for ${member.orgSlug}`);
    }

    await prisma.organisationMember.upsert({
      where: {
        organisationId_email: {
          organisationId: organisation.id,
          email: member.email
        }
      },
      create: {
        organisationId: organisation.id,
        name: member.name,
        email: member.email,
        role: member.role,
        title: member.title
      },
      update: {
        name: member.name,
        role: member.role,
        title: member.title
      }
    });
  }

  for (const seedContract of contracts) {
    const organisation = organisationsBySlug.get(seedContract.orgSlug);

    if (!organisation) {
      throw new Error(`Missing organisation for ${seedContract.orgSlug}`);
    }

    const existingContract = await prisma.contract.findUnique({
      where: {
        organisationId_contractNumber: {
          organisationId: organisation.id,
          contractNumber: seedContract.contractNumber
        }
      },
      select: {
        id: true,
        deletedAt: true
      }
    });

    if (existingContract) {
      if (existingContract.deletedAt) {
        await prisma.contract.update({
          where: {
            id: existingContract.id
          },
          data: {
            deletedAt: null
          }
        });
      }

      const eventCount = await prisma.contractEvent.count({
        where: {
          contractId: existingContract.id
        }
      });

      if (eventCount === 0) {
        await createSeedEvents({
          organisationId: organisation.id,
          contractId: existingContract.id,
          status: seedContract.status
        });
      }

      continue;
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

    await createSeedEvents({
      organisationId: organisation.id,
      contractId: contract.id,
      status: seedContract.status
    });
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
