"""Canonical embedding-text builders. Used by trainer/refresh_embeddings.py to embed
offers and students into Qdrant.

The student spec must stay byte-identical to the backend's ScoringService.buildStudentText,
or live query vectors and the offline students index land in different spaces.
"""


def _csv(values: list[str] | None) -> str:
    return ",".join(v for v in (values or []) if v)


def build_student_text(
    *,
    skill_names: list[str],
    preferred_domains: list[str],
    preferred_cities: list[str],
    current_year: int | None,
    current_program: str | None,
    bio: str | None,
    projects: list[str],
    experiences: list[str],
    educations: list[str],
    certifications: list[str],
) -> str:
    # The list fields arrive pre-sorted and pre-formatted from db.py to match the backend builder.
    return (
        f"skills:{','.join(skill_names or [])} | "
        f"domains:{','.join(preferred_domains or [])} | "
        f"cities:{','.join(preferred_cities or [])} | "
        f"year:{current_year if current_year is not None else ''} | "
        f"program:{current_program or ''} | "
        f"projects:{'; '.join(projects or [])} | "
        f"experience:{'; '.join(experiences or [])} | "
        f"education:{'; '.join(educations or [])} | "
        f"certifications:{','.join(certifications or [])} | "
        f"bio:{bio or ''}"
    )


def build_offer_text(
    *,
    title: str,
    description: str,
    domain: str | None,
    skill_names: list[str],
    languages_required: list[str],
) -> str:
    return (
        f"{title}. {description} "
        f"Domain:{domain or ''}. "
        f"Skills:{_csv(skill_names)}. "
        f"Languages:{_csv(languages_required)}."
    )
