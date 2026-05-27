import { OfferDetailScreen } from "@/features/offer-detail/components/offer-detail-screen";

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OfferDetailScreen offerId={id} />;
}
