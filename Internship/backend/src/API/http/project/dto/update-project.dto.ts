// update-project.dto.ts
import { IsString, IsOptional, IsArray, IsUrl, ArrayNotEmpty } from 'class-validator'

export class UpdateProjectDTO {
    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    technologies?: string[]

    @IsOptional()
    @IsUrl()
    githubUrl?: string

    @IsOptional()
    @IsUrl()
    demoUrl?: string
}