// dto/register-student.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterStudentDto {
    @IsEmail()
    email: string

    @IsString()
    name: string

    @IsString()
    lastname: string

    @IsString()
    @MinLength(3)
    username: string

    @IsString()
    @MinLength(6)
    password: string
}