import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator'
import { Role } from '../../../../Domain/enums/role.enum'

export class RegisterDTO {

    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @MinLength(8)
    password: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    lastname: string

    @IsEnum(Role)
    role: Role
}