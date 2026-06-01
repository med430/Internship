"""Response models. camelCase is load-bearing: the backend casts our JSON straight
into TS interfaces, so snake_case would deserialize to undefined → silent zero scores."""

from pydantic import BaseModel


class MlOfferScore(BaseModel):
    offerId: str
    semanticScore: float
    cfScore: float
    finalMlScore: float  # 0 in Phase 1 → backend blends 0.6*content + 0.4*semantic


class RecommendJobsResponse(BaseModel):
    offers: list[MlOfferScore]


class MlStudentScore(BaseModel):
    studentId: str
    semanticScore: float
    cfScore: float


class RecommendUsersResponse(BaseModel):
    students: list[MlStudentScore]


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]


class SimilarOffer(BaseModel):
    offerId: str
    similarity: float


class SimilarJobsResponse(BaseModel):
    offers: list[SimilarOffer]


class HealthResponse(BaseModel):
    status: str
    modelVersion: str
    modelsLoaded: list[str]


class FeedbackResponse(BaseModel):
    ok: bool
