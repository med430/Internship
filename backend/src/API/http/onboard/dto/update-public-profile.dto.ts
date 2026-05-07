import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsIn,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator'

export class UpdatePublicProfileDto {
    @IsOptional()
    @IsString()
    name?: string | null

    @IsOptional()
    @IsString()
    email?: string | null

    @IsOptional()
    @IsString()
    location?: string | null

    @IsOptional()
    @IsDateString()
    birthday?: string | null

    @IsOptional()
    @IsString()
    targeted_role?: string | null

    @IsOptional()
    @IsString()
    organization?: string | null

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[] | null

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    education?: string[] | null

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    experiences?: string[] | null

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    achievements?: string[] | null

    @IsOptional()
    @IsUrl()
    github_url?: string | null

    @IsOptional()
    @IsUrl()
    linkedin_url?: string | null

    @IsOptional()
    @IsUrl()
    twitter_url?: string | null

    @IsOptional()
    @IsUrl()
    avatar_url?: string | null

    @IsOptional()
    @IsBoolean()
    profile_completed?: boolean | null

    @IsOptional()
    @IsBoolean()
    is_deactivated?: boolean | null

    @IsOptional()
    @IsDateString()
    deactivated_at?: string | null

    @IsOptional()
    @IsIn(['Starter', 'Achiever', 'Expert'])
    subscription?: 'Starter' | 'Achiever' | 'Expert' | null

    @IsOptional()
    @IsDateString()
    subscription_end_date?: string | null
}
