import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PostCode } from './PostCode';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    telegramId: number;

    @Column()
    firstName: string;

    @Column()
    language: string;

    @OneToMany(
        () => PostCode,
        postCode => postCode.user,
    )
    postCodes: PostCode[];

    @Column({ default: true, nullable: false })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
