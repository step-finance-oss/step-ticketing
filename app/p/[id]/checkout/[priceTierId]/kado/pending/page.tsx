import { Metadata } from "next"
import { getEvent } from "lib/event"
import SpinnerCover from "components/UI/SpinnerCover"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: eventId } = await params

  const event = await getEvent(eventId)

  return {
    title: `${event?.title} - Payment`,
    description: event?.description,
  }
}

const KadoCheckoutPendingPage = async ({}) => {
  return <SpinnerCover message={<>Please wait a moment.</>} />
}

export default KadoCheckoutPendingPage
