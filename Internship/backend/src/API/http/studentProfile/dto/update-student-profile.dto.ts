import { IsOptional, IsString } from 'class-validator'

export class UpdateStudentProfileDTO {

    @IsOptional()
    @IsString()
    bio?: string
}