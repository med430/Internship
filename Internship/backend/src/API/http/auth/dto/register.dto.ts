import {IsEmail, MinLength} from "class-validator";
import {Role} from "../../../../Domain/enums/role.enum";

export class RegisterDto {
    firstName: string;
    lastName: string;
    username: string;
    @IsEmail()
    email: string;
    @MinLength(6)
    password: string;
    role: Role;
}