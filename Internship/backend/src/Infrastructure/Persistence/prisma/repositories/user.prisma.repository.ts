import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma.service";
import {IUserRepository} from "../../../../Application/Interfaces/user.repository.interface";
import {User} from "../../../../Domain/entities/user.entity";

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaService) {}

    findByUsername(username: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    findByEmail(email: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    save(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }

    async findById(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) return null;

        return user;
    }
}