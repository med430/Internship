import { use } from "react";
import { OfferDetailScreen } from "@/features/offers/components/offer-detail-screen";

export default function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OfferDetailScreen offerId={id} />;
}
