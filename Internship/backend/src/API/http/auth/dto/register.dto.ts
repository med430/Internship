import {IsEmail, MinLength} from "class-validator";

export class RegisterDto {
    username: string;
    @IsEmail()
    email: string;
    @MinLength(6)
    password: string;
}