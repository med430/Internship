"use client";

import { useParams } from "next/navigation";
import { InterviewDetailScreen } from "@/features/virtual-interviewer-database/components/interview-detail-screen";

export default function InterviewDetailPage() {
  const params = useParams();
  const interviewId = params.id as string;

  return <InterviewDetailScreen interviewId={interviewId} />;
}
