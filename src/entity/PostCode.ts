import {
    Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { Offer } from './Offer';
import { User } from './User';

@Entity()
export class PostCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    postCode: string;

    @ManyToMany(
        () => User,
        user => user.postCodes,
        { nullable: false, onDelete: 'CASCADE', cascade: true },
    )
    @JoinTable()
    users: User[];

    @OneToMany(
        () => Offer,
        offer => offer.postCode,
    )
    @JoinColumn()
    offers: Offer[];

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
