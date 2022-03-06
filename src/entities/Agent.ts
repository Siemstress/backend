import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {AgentStatus} from "../enums/AgentStatus";

@Entity()
export class Agent extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    agentStatus: AgentStatus

    @Column({nullable: true})
    agentAction: string

    @Column({nullable: true})
    hostname: string;

    @Column({nullable: true})
    externalIp: string;

    @Column({nullable: true})
    operatingSystem: string;

    @Column({nullable: true})
    kernel: string;

    @Column()
    dateAdded: Date;

    @Column({nullable: true})
    lastUpdated: Date;

    @Column({nullable: true})
    lastRegistered: Date;
}
