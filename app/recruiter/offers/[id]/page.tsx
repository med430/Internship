import { use } from "react";
import { RecruiterOfferFormScreen } from "@/features/recruiter/offers/components/offer-form-screen";

export default function RecruiterOfferEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RecruiterOfferFormScreen offerId={id} />;
}
