import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { PostCode } from './PostCode';

@Entity()
export class Offer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    bottleSize: number;

    @Column({ nullable: false })
    bottleAmount: number;

    @Column({ nullable: false })
    oldPrice: number;

    @Column({ nullable: false })
    price: number;

    @Column({ nullable: false })
    category: string;

    @Column({ default: true, nullable: false })
    isLatest: boolean;

    @ManyToOne(
        () => PostCode,
        postCode => postCode.offers, {
            nullable: false
        }
    )
    postCode: PostCode;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
