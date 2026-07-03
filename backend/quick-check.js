const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'e7XUhcVlZ1YmECAdRaIuk9tOKi62';
  const e = await prisma.entry.count({ where: { userId } });
  const x = await prisma.exit.count({ where: { userId } });
  const r = await prisma.recurring.count({ where: { userId } });
  const p = await prisma.purchase.count({ where: { userId } });
  const c = await prisma.creditCard.count({ where: { userId } });
  const i = await prisma.installmentStatus.count({ where: { userId } });
  console.log(`Entries: ${e} | Exits: ${x} | Recurrings: ${r} | Purchases: ${p} | Cards: ${c} | InstallmentStatus: ${i}`);
}

main().finally(() => prisma.$disconnect());
