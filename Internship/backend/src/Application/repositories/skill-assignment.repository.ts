import {SkillLevel} from "@prisma/client";

export class SkillAssignmentRepository {
  constructor(
      public readonly id: string,
      public readonly skillId: number,
      public readonly studentProfileId?: string,
      public readonly offerId?: string,
      public level?: SkillLevel
  ) {}
}