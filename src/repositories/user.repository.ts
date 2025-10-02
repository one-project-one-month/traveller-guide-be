import type { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';

export const userRepository = {
    createUser: async (user: Prisma.UserCreateInput) => {
        const newUser = await prisma.user.create({
            data: user,
        });

        return newUser;
    },
    findAllUsers: async (args: Prisma.UserFindManyArgs) => {
        const users = await prisma.user.findMany({
            ...args,
        });

        return users;
    },
    findOneUser: async (args: Prisma.UserFindFirstArgs) => {
        const user = await prisma.user.findFirst({
            ...args,
        });

        return user;
    },
    findUserById: async (id: number) =>
        await userRepository.findOneUser({ where: { id } }),
    findUserByEmail: async (email: string) =>
        await userRepository.findOneUser({ where: { email } }),
    updateUser: async (args: Prisma.UserUpdateArgs) => {
        const updatedUser = await prisma.user.update({
            ...args,
        });

        return updatedUser;
    },
    deleteUser: async (args: Prisma.UserDeleteArgs) => {
        const deletedUser = await prisma.user.delete({
            ...args,
        });

        return deletedUser;
    },
} as const;
