"use client"

import GuestDetailCard, {
  GuestDetailCardProps,
} from "components/Guest/GuestDetailCard"
import GuestList, { GuestListProps } from "components/Guest/GuestList"
import BottomDrawer from "components/UI/BottomDrawer"
import CamButton from "components/UI/CamButton"
import ErrorMessage from "components/UI/ErrorMessage"
import QRScannerModal from "components/UI/QRScannerModal"
import SearchInput from "components/UI/SearchInput"
import { TicketExtended, UpdateTicketParams } from "lib/ticket"
import { checkInTicket, checkOutTicket, updateTicket } from "lib/ticket/client"
import { useRouteQueryAdd } from "lib/client-utils"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import GuestMerchForm, {
  GuestMerchFormProps,
} from "components/Guest/GuestMerchForm"
import { PaymentMerchOptions } from "components/Payment/PaymentMerchField"
import AdminWrapper from "components/Page/AdminWrapper"
import SpinnerCover from "components/UI/SpinnerCover"

interface GuestsContentProps {
  query?: string
  ticket?: TicketExtended
  ticketNotFound?: boolean
  ticketsList: GuestListProps["list"]
  ticketIsPending?: boolean
  merchOptions?: PaymentMerchOptions
}

const GuestsContent = (props: GuestsContentProps) => {
  const {
    query,
    ticket,
    ticketsList,
    ticketNotFound,
    merchOptions,
    ticketIsPending,
  } = props

  const addToQuery = useRouteQueryAdd()

  const router = useRouter()

  const onSearch = useCallback(
    (value) => addToQuery({ query: value }, { scroll: false }),
    [addToQuery]
  )

  const onCardClick: GuestListProps["onCardClick"] = useCallback(
    (event, id) => {
      event.preventDefault()
      addToQuery({ ticketId: id }, { scroll: false })
    },
    [addToQuery]
  )

  const onCloseDrawer: () => void = useCallback(() => {
    qrScannerIsPausedRef.current = false
    addToQuery({ ticketId: undefined, qrCode: undefined }, { scroll: false })
    setEditMerch(false)
  }, [addToQuery])

  // The QR code must contain a link https://example.com/p/1/guests?qrCode=1234
  const onGetCode: (data: string) => void = useCallback(
    (data) => {
      if (qrScannerIsPausedRef.current) return

      qrScannerIsPausedRef.current = true

      try {
        const qrCode = new URL(data).searchParams.get("qrCode")

        if (qrCode) {
          addToQuery({ qrCode: qrCode }, { scroll: false })
        } else {
          alert(`Invalid QR code: ${data}`)
          qrScannerIsPausedRef.current = false
        }
      } catch (_error) {
        alert(`Invalid QR code: ${data}`)
        qrScannerIsPausedRef.current = false
      }
    },
    [addToQuery]
  )

  const qrScannerIsPausedRef = useRef<boolean>(false)

  const [qrScannerIsOpen, setQrScannerIsOpen] = useState(false)

  const onCheckIn: () => void = useCallback(async () => {
    if (!ticket) return
    await checkInTicket(ticket?.id)
    qrScannerIsPausedRef.current = false
    addToQuery({ ticketId: undefined, qrCode: undefined }, { scroll: false })
    router.refresh()
    alert("Checked in successfully")
  }, [addToQuery, router, ticket])

  const onCheckOut: () => void = useCallback(async () => {
    if (!ticket) return
    await checkOutTicket(ticket?.id)
    qrScannerIsPausedRef.current = false
    addToQuery({ ticketId: undefined, qrCode: undefined }, { scroll: false })
    router.refresh()
    alert("Checked out successfully")
  }, [addToQuery, router, ticket])

  const merch =
    ticket &&
    ticket.selectedMerchOptions &&
    !Array.isArray(ticket.selectedMerchOptions) &&
    ticket.selectedMerchOptions !== null &&
    typeof ticket.selectedMerchOptions === "object"
      ? (ticket.selectedMerchOptions as GuestDetailCardProps["merch"])
      : undefined

  const [editMerch, setEditMerch] = useState(false)

  const onSaveMerch = useCallback<NonNullable<GuestMerchFormProps["onSave"]>>(
    async (value) => {
      if (!ticket) return
      await updateTicket(ticket?.id, {
        selectedMerchOptions:
          value.merch as UpdateTicketParams["selectedMerchOptions"],
      })
      router.refresh()
      setEditMerch(false)
    },
    [router, ticket]
  )

  const onCancelMerch: () => void = useCallback(async () => {
    setEditMerch(false)
  }, [])

  const onEditMerch: () => void = useCallback(async () => {
    setEditMerch(true)
  }, [])

  useEffect(() => {
    qrScannerIsPausedRef.current = false
  }, [qrScannerIsOpen])

  return (
    <AdminWrapper>
      <SearchInput defaultValue={query} onChange={onSearch} />
      <GuestList list={ticketsList} onCardClick={onCardClick} />
      <BottomDrawer
        open={Boolean(ticket) || ticketNotFound}
        onClose={onCloseDrawer}
      >
        {ticketNotFound && (
          <div className="p-4 pb-8">
            <ErrorMessage message="Ticket not found" />
          </div>
        )}
        {ticket && (
          <div className="p-4 pb-8">
            {editMerch ? (
              <GuestMerchForm
                merch={merch}
                merchOptions={merchOptions}
                onCancel={onCancelMerch}
                onSave={onSaveMerch}
              />
            ) : (
              <GuestDetailCard
                name={ticket.name ?? undefined}
                email={ticket.user.email}
                merch={merch}
                promoCode={ticket.promoCode?.code ?? undefined}
                ticketName={ticket.priceTier.title}
                ticketPrice={
                  ticket.purchasePrice ?? ticket.priceTier.price ?? undefined
                }
                ticketCurrency="USD"
                checkedInAt={ticket.checkInDateTime ?? undefined}
                onCheckIn={onCheckIn}
                onCheckOut={onCheckOut}
                size={ticket.shirtSize ?? undefined}
                onEditMerch={onEditMerch}
                notes={ticket.notes ?? undefined}
              />
            )}
          </div>
        )}
      </BottomDrawer>
      <CamButton
        className="fixed bottom-4 left-0 right-0 m-auto w-16"
        onClick={() => setQrScannerIsOpen(true)}
      />
      <QRScannerModal
        open={qrScannerIsOpen}
        onClose={() => setQrScannerIsOpen(false)}
        onGetCode={onGetCode}
      />
      {ticketIsPending && <SpinnerCover className="!z-50" />}
    </AdminWrapper>
  )
}

export default GuestsContent
