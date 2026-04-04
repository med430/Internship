import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('users')
export class UserOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    username: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({default: 'user'})
    role: string;
}