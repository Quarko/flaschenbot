import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Offer } from './Offer';

@Entity()
export class PostCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    postCode: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn()
    user: User;

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
