import { OfferDetailScreen } from "@/features/offer-detail/components/offer-detail-screen";

export default async function OfferDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  return <OfferDetailScreen offerId={id} from={from} />;
}
