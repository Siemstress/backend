import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Stat extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

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
