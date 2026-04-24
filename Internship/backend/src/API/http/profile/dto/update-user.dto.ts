import { IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateUserDTO {
    @IsOptional() @IsString() name?: string
    @IsOptional() @IsString() lastname?: string
    @IsOptional() @IsString() username?: string
    @IsOptional() @IsString() @MinLength(6) password?: string

    // profile
    @IsOptional() @IsString() company?: string // recruiter
    @IsOptional() @IsString() bio?: string     // student
}