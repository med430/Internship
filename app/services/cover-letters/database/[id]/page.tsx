"use client";

import { useParams } from "next/navigation";
import { CoverLetterDetailScreen } from "@/features/cover-letter-database-detail/components/cover-letter-detail-screen";

export default function CoverLetterDetailPage() {
  const params = useParams();
  const letterId = params.id as string;

  return <CoverLetterDetailScreen letterId={letterId} />;
}
