import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDTO {

    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    password: string
}