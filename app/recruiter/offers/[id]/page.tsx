import { RecruiterOfferFormScreen } from "@/features/recruiter/offers/components/offer-form-screen";

export default function RecruiterOfferEditPage({
  params,
}: {
  params: { id: string };
}) {
  return <RecruiterOfferFormScreen offerId={params.id} />;
}
