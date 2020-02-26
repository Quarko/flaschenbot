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

    @ManyToOne(() => User, {nullable: false})
    user: User;

    @OneToMany(
        () => Offer,
        offer => offer.postCode,
    )
    @JoinColumn()
    offers: Offer[];

    @Column({ default: true, nullable: false})
    isActive: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
