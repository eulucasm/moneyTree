import prisma from '../config/prisma';

export const getUserProfile = async (userId: string) => {
  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        firstName: '',
        lastName: '',
        city: '',
        state: '',
        loginType: 'email',
        activePlan: 'free',
        role: 'user',
        status: 'active',
        savingsGoal: 0,
        language: 'pt',
        phone: '',
        birthDate: '',
        createdAt: new Date().toISOString().substring(0, 7),
      },
    });
  }

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
    state: user.state,
    loginType: user.loginType,
    activePlan: user.activePlan,
    role: user.role,
    status: user.status,
    savingsGoal: user.savingsGoal,
    language: user.language,
    phone: user.phone || '',
    birthDate: user.birthDate || '',
    createdAt: user.createdAt,
  };
};

export const updateUserProfile = async (userId: string, data: any) => {
  const { firstName, lastName, city, state, loginType, activePlan, savingsGoal, language, phone, birthDate } = data;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      firstName,
      lastName,
      city,
      state,
      loginType,
      activePlan,
      savingsGoal: savingsGoal !== undefined ? parseFloat(savingsGoal) : undefined,
      language,
      phone,
      birthDate,
    },
    create: {
      id: userId,
      firstName: firstName || '',
      lastName: lastName || '',
      city: city || '',
      state: state || '',
      loginType: loginType || 'email',
      activePlan: activePlan || 'free',
      role: 'user',
      status: 'active',
      savingsGoal: savingsGoal !== undefined ? parseFloat(savingsGoal) : 0,
      language: language || 'pt',
      phone: phone || '',
      birthDate: birthDate || '',
      createdAt: new Date().toISOString().substring(0, 7),
    },
  });

  return user;
};

export const deleteUserProfile = async (userId: string) => {
  await prisma.user.delete({
    where: { id: userId }
  });
};
