import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany, JoinTable,
} from 'typeorm';
import { User } from './User';
import { Offer } from './Offer';

@Entity()
export class PostCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    postCode: string;

    @ManyToMany(() => User, user => user.postCodes, {nullable: false})
    @JoinTable()
    users: User[];

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
