import { BaseEntity } from "./base.entity";
import { Project } from './project.entity';
import { Experience } from './experience.entity';
import { SkillAssignment } from './skill-assignment.entity';

export class CV extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,

    public fileUrl: string,

    public skills: SkillAssignment[],

    public projects: Project[],

    public experiences: Experience[],

    public parsedData?: Record<string, any>,

    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
  ) {
    super(createdAt, updatedAt, deletedAt);
  }
}