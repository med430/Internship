"use client";

import { useParams } from "next/navigation";
import { CvDetailScreen } from "@/features/cv-rewriter-database-detail/components/cv-detail-screen";

export default function CVDetailPage() {
  const params = useParams();
  const cvId = params.id as string;

  return <CvDetailScreen cvId={cvId} />;
}
