import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Agent extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    authCode: string;

    @Column()
    hostname: string;

    @Column()
    externalIp: string;

    @Column()
    operatingSystem: string;

    @Column()
    kernel: string;

    @Column()
    dateAdded: Date;

    @Column()
    lastUpdated: Date;
}
