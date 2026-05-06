"use client";

import { useParams } from "next/navigation";
import { PortfolioGenerationDetailScreen } from "@/features/portfolio-builder-database-detail/components/portfolio-generation-detail-screen";

export default function PortfolioBuilderDatabaseDetailPage() {
  const params = useParams();
  const generationId = params.id as string;

  return <PortfolioGenerationDetailScreen generationId={generationId} />;
}
