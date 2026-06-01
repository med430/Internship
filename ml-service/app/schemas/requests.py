"""Request models for the sidecar. Field names are camelCase to match the payloads
the NestJS MlClientService sends verbatim (no key transformation on either side)."""

from datetime import datetime

from pydantic import BaseModel


class ContentCandidate(BaseModel):
    offerId: str
    contentScore: float


class RecommendJobsRequest(BaseModel):
    studentId: str  # student's stored vector is looked up by this id in the `students` collection
    contentCandidates: list[ContentCandidate]  # top-K offers to score (retrieval source), not the whole catalog
    limit: int = 200


class RecommendUsersRequest(BaseModel):
    offerId: str
    offerText: str
    limit: int = 20


class EmbedRequest(BaseModel):
    texts: list[str]


class SimilarJobsRequest(BaseModel):
    offerId: str
    limit: int = 10


class FeedbackRequest(BaseModel):
    studentId: str
    offerId: str
    eventType: str
    timestamp: datetime
