import {IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator'
import {Role} from "../../../../Domain/enums/role.enum";

export class RegisterDTO {

    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @MinLength(6)
    password: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    lastname: string

    @IsEnum(Role)
    role: Role

    @IsOptional()
    @IsString()
    company?: string
}