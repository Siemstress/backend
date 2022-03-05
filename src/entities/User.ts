import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: "username", type: "varchar", unique: true, length: 32})
    username: string;

    @Column()
    isAdmin: boolean;

    @Column({name: "hash", type: "varchar", length: 64})
    hash: string;

    @Column({name: "salt", type: "varchar", length: 64})
    salt: string;

    @Column({name: "fullName", type: "varchar", length: 64})
    fullName: string;

    @Column({name: "jobTitle", type: "varchar", length: 64})
    jobTitle: string;
}
