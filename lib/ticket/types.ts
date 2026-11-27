import { PriceTier } from "lib/event"
import { Ticket, User } from "lib/prisma"
import { PromoCode } from "lib/promocode"

type NormalizedTicket = Omit<Ticket, "purchasePrice"> & {
  purchasePrice: number | null
}

type CreateTicketParams = Pick<
  Ticket,
  | "eventId"
  | "priceTierId"
  | "priceOptionId"
  | "selectedMerchOptions"
  | "source"
  | "payerWalletAddress"
> & {
  shirtSize?: string
  txId?: string
  kadoPaymentId?: string
  promocode?: string
  purchasePrice?: number
  purchaseId?: string
  nonce?: string
} & Pick<User, "name" | "email">

type GetTicketsByEventParams = {
  eventId: string
  search?: string
  limit?: number
}

type TicketExtended = NormalizedTicket & {
  user: Pick<User, "email" | "name">
  priceTier: PriceTier
  promoCode: Omit<PromoCode, "_count"> | null
}

type UpdateTicketParams = Partial<
  Omit<NormalizedTicket, "selectedMerchOptions">
> & {
  selectedMerchOptions?: NonNullable<NormalizedTicket["selectedMerchOptions"]>
}

export type {
  NormalizedTicket as Ticket,
  TicketExtended,
  CreateTicketParams,
  GetTicketsByEventParams,
  UpdateTicketParams,
}
