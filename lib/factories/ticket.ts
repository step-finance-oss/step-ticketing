import { Ticket } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"
import { User } from "../prisma"

export const ticketFactory: (
  priceWithPromocode: number,
  totalPrice: number,
  source: string,
  kadoPaymentId: string
) => (Ticket & { user: Pick<User, "email"> }) | null = (
  priceWithPromocode,
  totalPrice,
  source,
  kadoPaymentId
) => {
  return {
    id: "id",
    purchaseId: "purchaseId",
    nonce: "nonce",
    eventId: "eventId",
    priceTierId: "priceTierId",
    priceOptionId: "priceOptionId",
    name: "",
    email: "",
    selectedMerchOptions: { label: { size: "XXL" } },
    priceWithPromocode: priceWithPromocode,
    totalPrice: totalPrice,
    source: source,
    qrCode: "",
    kadoPaymentId: kadoPaymentId,
    isPaid: true,
    shirtSize: null,
    emailSent: true,
    emailSentDateTime: new Date(),
    userId: "userId",
    checkInDateTime: null,
    purchaseDateTime: null,
    purchasePrice: new Decimal(10),
    notes: "notes",
    txId: "txId",
    promoCodeId: "promoCodeId",
    user: {
      email: "test@test.com",
    },
    payerWalletAddress: null,
  }
}
