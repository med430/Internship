import { IsEnum } from 'class-validator'
import {SkillLevel} from "../../../../Domain/enums/skill-level.enum";


export class UpdateSkillDTO {
    @IsEnum(SkillLevel)
    level: SkillLevel
}