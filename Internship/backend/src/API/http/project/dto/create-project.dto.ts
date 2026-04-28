// create-project.dto.ts
import { IsString, IsOptional, IsArray, IsUrl, ArrayNotEmpty } from 'class-validator'

export class CreateProjectDTO {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    technologies: string[]

    @IsOptional()
    @IsUrl()
    githubUrl?: string

    @IsOptional()
    @IsUrl()
    demoUrl?: string
}