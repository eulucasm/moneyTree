import prisma from '../config/prisma';

export const getSyncData = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      entries: true,
      exits: true,
      recurrings: true,
      purchases: true,
      savingsItems: true,
      creditCards: true,
      installmentStatusMap: true,
    },
  });

  if (!user) {
    return {
      entries: [],
      exits: [],
      recurrings: [],
      purchases: [],
      savingsLogs: {},
      creditCards: [],
      savingsGoal: 0,
      language: 'pt',
      installmentStatusMap: {},
      userProfile: null,
    };
  }

  const savingsLogs: Record<string, any[]> = {};
  for (const item of user.savingsItems) {
    if (!savingsLogs[item.monthStr]) {
      savingsLogs[item.monthStr] = [];
    }
    savingsLogs[item.monthStr].push({
      id: item.id,
      type: item.type,
      bank: item.bank,
      amount: item.amount,
      description: item.description,
    });
  }

  const installmentStatusMap: Record<string, string> = {};
  for (const inst of user.installmentStatusMap) {
    const key = `${inst.purchaseId}_${inst.date}`;
    installmentStatusMap[key] = inst.status;
  }

  return {
    entries: user.entries,
    exits: user.exits,
    recurrings: user.recurrings,
    purchases: user.purchases.map((p: any) => ({
      id: p.id,
      description: p.description,
      totalValue: p.totalValue,
      monthlyValue: parseFloat((p.totalValue / p.installments).toFixed(2)),
      installments: p.installments,
      startDate: p.startDate,
      cardUsed: p.cardUsed,
    })),
    savingsLogs,
    creditCards: user.creditCards,
    savingsGoal: user.savingsGoal,
    language: user.language,
    installmentStatusMap,
    userProfile: {
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      state: user.state,
      loginType: user.loginType,
      activePlan: user.activePlan,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      birthDate: user.birthDate || '',
      createdAt: user.createdAt,
    },
    updatedAt: user.updatedAt.getTime(),
  };
};

export const postSyncData = async (userId: string, data: any) => {
  const {
    entries = [],
    exits = [],
    recurrings = [],
    purchases = [],
    savingsLogs = {},
    creditCards = [],
    savingsGoal = 0,
    language = 'pt',
    installmentStatusMap = {},
    userProfile = null,
  } = data;

  const incomingIsEmpty = entries.length === 0 && exits.length === 0 &&
    recurrings.length === 0 && purchases.length === 0 && creditCards.length === 0;

  if (incomingIsEmpty) {
    const existingCounts = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: { entries: true, exits: true, recurrings: true, purchases: true }
        }
      }
    });

    if (existingCounts) {
      const c = existingCounts._count;
      const dbHasData = c.entries > 0 || c.exits > 0 || c.recurrings > 0 || c.purchases > 0;
      if (dbHasData) {
        console.warn(`[Sync] BLOCKED empty overwrite for user ${userId} — DB has ${c.entries}E/${c.exits}X/${c.recurrings}R/${c.purchases}P`);
        throw new Error('EMPTY_OVERWRITE_BLOCKED');
      }
    }
  }

  const savingsItemsList: any[] = [];
  for (const [monthStr, items] of Object.entries(savingsLogs)) {
    if (Array.isArray(items)) {
      for (const item of items) {
        savingsItemsList.push({
          id: item.id,
          monthStr,
          type: item.type,
          bank: item.bank,
          amount: item.amount,
          description: item.description,
        });
      }
    }
  }

  const installmentStatusList: any[] = [];
  for (const [key, status] of Object.entries(installmentStatusMap)) {
    const parts = key.split('_');
    if (parts.length >= 2) {
      const purchaseId = parts[0];
      const date = parts.slice(1).join('_');
      installmentStatusList.push({
        purchaseId,
        date,
        status: status as string,
      });
    }
  }

  await prisma.$transaction(async (tx: any) => {
    const prof = userProfile || {};
    await tx.user.upsert({
      where: { id: userId },
      update: {
        firstName: prof.firstName !== undefined ? prof.firstName : undefined,
        lastName: prof.lastName !== undefined ? prof.lastName : undefined,
        city: prof.city !== undefined ? prof.city : undefined,
        state: prof.state !== undefined ? prof.state : undefined,
        loginType: prof.loginType !== undefined ? prof.loginType : undefined,
        activePlan: prof.activePlan !== undefined ? prof.activePlan : undefined,
        role: prof.role !== undefined ? prof.role : undefined,
        status: prof.status !== undefined ? prof.status : undefined,
        savingsGoal: parseFloat(savingsGoal),
        language,
        phone: prof.phone !== undefined ? prof.phone : undefined,
        birthDate: prof.birthDate !== undefined ? prof.birthDate : undefined,
      },
      create: {
        id: userId,
        firstName: prof.firstName || '',
        lastName: prof.lastName || '',
        city: prof.city || '',
        state: prof.state || '',
        loginType: prof.loginType || 'email',
        activePlan: prof.activePlan || 'free',
        role: prof.role || 'user',
        status: prof.status || 'active',
        savingsGoal: parseFloat(savingsGoal),
        language,
        phone: prof.phone || '',
        birthDate: prof.birthDate || '',
        createdAt: prof.createdAt || new Date().toISOString().substring(0, 7),
      },
    });

    await tx.entry.deleteMany({ where: { userId } });
    if (entries.length > 0) {
      await tx.entry.createMany({
        data: entries.map((e: any) => ({
          id: e.id,
          userId,
          description: e.description,
          value: parseFloat(e.value),
          date: e.date,
          status: e.status,
        })),
      });
    }

    await tx.exit.deleteMany({ where: { userId } });
    if (exits.length > 0) {
      await tx.exit.createMany({
        data: exits.map((e: any) => ({
          id: e.id,
          userId,
          description: e.description,
          value: parseFloat(e.value),
          date: e.date,
          status: e.status,
          category: e.category,
          dueDate: e.dueDate !== undefined ? parseInt(e.dueDate) : null,
        })),
      });
    }

    await tx.recurring.deleteMany({ where: { userId } });
    if (recurrings.length > 0) {
      await tx.recurring.createMany({
        data: recurrings.map((r: any) => ({
          id: r.id,
          userId,
          description: r.description,
          value: parseFloat(r.value),
        })),
      });
    }

    await tx.purchase.deleteMany({ where: { userId } });
    if (purchases.length > 0) {
      await tx.purchase.createMany({
        data: purchases.map((p: any) => ({
          id: p.id,
          userId,
          description: p.description,
          totalValue: parseFloat(p.totalValue),
          installments: parseInt(p.installments),
          startDate: p.startDate,
          cardUsed: p.cardUsed,
        })),
      });
    }

    await tx.savingsItem.deleteMany({ where: { userId } });
    if (savingsItemsList.length > 0) {
      await tx.savingsItem.createMany({
        data: savingsItemsList.map((s: any) => ({
          id: s.id,
          userId,
          monthStr: s.monthStr,
          type: s.type,
          bank: s.bank,
          amount: parseFloat(s.amount),
          description: s.description,
        })),
      });
    }

    await tx.creditCard.deleteMany({ where: { userId } });
    if (creditCards.length > 0) {
      await tx.creditCard.createMany({
        data: creditCards.map((c: any) => ({
          id: c.id,
          userId,
          name: c.name,
          limit: parseFloat(c.limit),
          color: c.color,
          dueDate: c.dueDate !== undefined ? parseInt(c.dueDate) : null,
          bestPurchaseDay: c.bestPurchaseDay !== undefined ? parseInt(c.bestPurchaseDay) : null,
        })),
      });
    }

    await tx.installmentStatus.deleteMany({ where: { userId } });
    if (installmentStatusList.length > 0) {
      await tx.installmentStatus.createMany({
        data: installmentStatusList.map((i: any) => ({
          userId,
          purchaseId: i.purchaseId,
          date: i.date,
          status: i.status,
        })),
      });
    }
  });

  return { success: true, timestamp: Date.now() };
};
