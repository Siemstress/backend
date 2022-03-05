import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Report extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date

}
