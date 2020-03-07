import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { User } from './User';
import { Offer } from './Offer';

@Entity()
export class PostCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    postCode: string;

    @ManyToMany(
        () => User,
        user => user.postCodes,
        { nullable: false },
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
