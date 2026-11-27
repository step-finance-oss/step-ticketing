import prisma, { User as UserRecord, Prisma } from "lib/prisma"
import { hashPassword } from "./password"

const userFields = { id: true, name: true, email: true, role: true } as const
export type User = Pick<UserRecord, keyof typeof userFields>
export type CreateUserParams = Pick<
  UserRecord,
  "email" | "password" | "isInternal"
> &
  Partial<Pick<UserRecord, "id" | "role" | "name">>
export type UpdateUserParams = Partial<CreateUserParams>

export const getUsers = () => prisma.user.findMany({ select: userFields })

export const getUser = (where: Prisma.UserWhereUniqueInput) =>
  prisma.user.findUnique({ where, select: userFields })

export const createUser = async (params: CreateUserParams) =>
  prisma.user.create({
    data: {
      ...params,
      password: params.password
        ? await hashPassword(params.password)
        : undefined,
    },
    select: userFields,
  })

export const updateUser = async (id: string, params: UpdateUserParams) =>
  prisma.user.update({
    where: { id },
    data: {
      ...params,
      password: params.password
        ? await hashPassword(params.password)
        : undefined,
    },
    select: userFields,
  })

export const deleteUser = (id: string) =>
  prisma.user.delete({ where: { id }, select: userFields })
