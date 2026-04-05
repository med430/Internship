import {Role} from "../../../../Domain/enums/role.enum";

export class RegisterDTO {
    email: string
    username: string
    password: string
    name: string
    lastname: string
    role: Role
}

