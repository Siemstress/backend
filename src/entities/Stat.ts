import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Agent} from "./Agent";

@Entity()
export class Stat extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Agent, {onDelete: "CASCADE"})
    agent: Agent

    @Column()
    date: Date;

    @Column()
    cpu: number;

    @Column()
    memory: number;

    @Column()
    netIn: number;

    @Column()
    netOut: number;

    @Column()
    disk: number;

}
