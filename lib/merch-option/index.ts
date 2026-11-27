import prisma, { MerchOption } from "lib/prisma"

type CreateMerchOptionParams = Partial<MerchOption> &
  Pick<MerchOption, "eventId" | "label"> & {
    options: NonNullable<MerchOption["options"]>
  }

type UpdateMerchOptionParams = Partial<MerchOption> & {
  options: NonNullable<MerchOption["options"]>
}

export type { MerchOption, CreateMerchOptionParams, UpdateMerchOptionParams }

export const getEventMerchOptions: (
  eventId: string
) => Promise<MerchOption[]> = async (eventId) => {
  const res = await prisma.merchOption.findMany({
    where: {
      eventId,
    },
  })

  return res ?? []
}

export const getMerchOption: (
  id: string
) => Promise<MerchOption | null> = async (id) => {
  const res = await prisma.merchOption.findUnique({
    where: {
      id,
    },
  })

  return res
}

export const createMerchOption: (
  params: CreateMerchOptionParams
) => Promise<MerchOption> = async (params) => {
  const res = await prisma.merchOption.create({
    data: params,
  })

  return res ?? []
}

export const updateMerchOption: (
  id: string,
  params: UpdateMerchOptionParams
) => Promise<MerchOption> = async (id, params) => {
  const res = await prisma.merchOption.update({
    where: {
      id,
    },
    data: params,
  })

  return res
}

export const deleteMerchOption: (id: string) => Promise<MerchOption> = async (
  id
) => {
  const res = await prisma.merchOption.delete({
    where: {
      id,
    },
  })

  return res
}
