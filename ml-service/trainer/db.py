"""NeonDB read access for the embedding-sync worker (asyncpg, raw SQL).

Reads the same database the NestJS backend writes (Prisma owns the schema). Pulls
offers/students changed since a watermark, with skill names joined in. All SQL lives
here so a schema change has one place to update; smoke_check() runs each query at
startup so a renamed column fails loudly instead of silently mid-sync.
Used by trainer/refresh_embeddings.py.
"""

from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import asyncpg

from app.config import get_settings


def _sanitize_dsn(dsn: str) -> str:
    # asyncpg doesn't recognize libpq's channel_binding param and errors on it; keep sslmode.
    parts = urlsplit(dsn)
    query = urlencode([(k, v) for k, v in parse_qsl(parts.query) if k != "channel_binding"])
    return urlunsplit((parts.scheme, parts.netloc, parts.path, query, parts.fragment))

# Prisma tables are PascalCase, columns camelCase → both must be quoted in Postgres.
# Sub-lists are sorted (COLLATE "C" = code-point order, matching JS .sort()) and pre-formatted
# so this output stays byte-identical to the backend ScoringService.buildStudentText.
_STUDENTS_SQL = """
SELECT sp."userId"                                              AS point_id,
       sp.bio,
       sp."preferredDomains"                                    AS preferred_domains,
       sp."preferredCities"                                     AS preferred_cities,
       sp."currentYear"                                         AS current_year,
       sp."currentProgram"                                      AS current_program,
       sp."updatedAt"                                           AS updated_at,
       (u."deletedAt" IS NOT NULL)                              AS deleted,
       COALESCE((SELECT array_agg(sk.name ORDER BY sk.name COLLATE "C")
                 FROM "SkillAssignment" sa JOIN "Skill" sk ON sk.id = sa."skillId"
                 WHERE sa."studentProfileId" = sp.id), '{}')    AS skill_names,
       COALESCE((SELECT array_agg(item ORDER BY item COLLATE "C") FROM (
                   SELECT p.title || ' (' || array_to_string(p.technologies, ', ')
                          || '): ' || COALESCE(p.description, '') AS item
                   FROM "Project" p WHERE p."studentProfileId" = sp.id) q), '{}') AS projects,
       COALESCE((SELECT array_agg(item ORDER BY item COLLATE "C") FROM (
                   SELECT e.role || ' @ ' || e.company || ': ' || COALESCE(e.description, '') AS item
                   FROM "Experience" e WHERE e."studentProfileId" = sp.id
                     AND e."deletedAt" IS NULL) q), '{}') AS experiences,
       COALESCE((SELECT array_agg(item ORDER BY item COLLATE "C") FROM (
                   SELECT ed.degree || ' ' || ed.field || ' @ ' || ed.school
                          || ': ' || COALESCE(ed.description, '') AS item
                   FROM "Education" ed WHERE ed."studentProfileId" = sp.id
                     AND ed."deletedAt" IS NULL) q), '{}') AS educations,
       COALESCE((SELECT array_agg((c.name || ' @ ' || c.organization) ORDER BY c.name COLLATE "C")
                 FROM "Certification" c WHERE c."studentProfileId" = sp.id
                   AND c."deletedAt" IS NULL), '{}') AS cert_names
FROM "StudentProfile" sp
JOIN "User" u ON u.id = sp."userId"
WHERE sp."updatedAt" > $1
ORDER BY sp."updatedAt" ASC
"""

_OFFERS_SQL = """
SELECT o.id                                                     AS point_id,
       o.title,
       o.description,
       o.domain,
       o.company,
       o.location,
       o."workMode"                                             AS work_mode,
       o."isPaid"                                               AS is_paid,
       o.type,
       o."positionsCount"                                       AS positions_count,
       o."startDate"                                            AS start_date,
       o."languagesRequired"                                    AS languages_required,
       o."applicationDeadline"                                  AS deadline,
       o."updatedAt"                                            AS updated_at,
       (o."deletedAt" IS NOT NULL
        OR (o."applicationDeadline" IS NOT NULL
            AND o."applicationDeadline" < now()))               AS deleted,
       COALESCE(array_agg(sk.name ORDER BY sk.name) FILTER (WHERE sk.name IS NOT NULL), '{}') AS skill_names
FROM "Offer" o
LEFT JOIN "SkillRequirement" sr ON sr."offerId" = o.id
LEFT JOIN "Skill" sk            ON sk.id = sr."skillId"
WHERE o."updatedAt" > $1
GROUP BY o.id
ORDER BY o."updatedAt" ASC
"""


async def create_pool() -> asyncpg.Pool:
    s = get_settings()
    return await asyncpg.create_pool(
        dsn=_sanitize_dsn(s.database_url),
        min_size=1,
        max_size=4,
        statement_cache_size=s.db_statement_cache_size,
    )


async def fetch_students_since(pool: asyncpg.Pool, since) -> list[asyncpg.Record]:
    async with pool.acquire() as con:
        return await con.fetch(_STUDENTS_SQL, since)


async def fetch_offers_since(pool: asyncpg.Pool, since) -> list[asyncpg.Record]:
    async with pool.acquire() as con:
        return await con.fetch(_OFFERS_SQL, since)


async def smoke_check(pool: asyncpg.Pool) -> None:
    from .sync_state import EPOCH

    async with pool.acquire() as con:
        await con.fetch(_STUDENTS_SQL + " LIMIT 0", EPOCH)
        await con.fetch(_OFFERS_SQL + " LIMIT 0", EPOCH)
