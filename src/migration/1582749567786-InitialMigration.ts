import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1582749567786 implements MigrationInterface {
    name = 'InitialMigration1582749567786'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "telegramId" integer NOT NULL, "firstName" varchar NOT NULL, "language" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "offer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "bottleSize" integer NOT NULL, "bottleAmount" integer NOT NULL, "oldPrice" integer NOT NULL, "price" integer NOT NULL, "category" varchar NOT NULL, "isLatest" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "postCodeId" integer)`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, CONSTRAINT "FK_c99eeeec00cf51f8b72427839e9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_post_code"("id", "postCode", "isActive", "createdAt", "updatedAt", "userId") SELECT "id", "postCode", "isActive", "createdAt", "updatedAt", "userId" FROM "post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_post_code" RENAME TO "post_code"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_offer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "bottleSize" integer NOT NULL, "bottleAmount" integer NOT NULL, "oldPrice" integer NOT NULL, "price" integer NOT NULL, "category" varchar NOT NULL, "isLatest" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "postCodeId" integer, CONSTRAINT "FK_2d8d27a1fe59268e375073062c2" FOREIGN KEY ("postCodeId") REFERENCES "post_code" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_offer"("id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId") SELECT "id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId" FROM "offer"`, undefined);
        await queryRunner.query(`DROP TABLE "offer"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_offer" RENAME TO "offer"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "offer" RENAME TO "temporary_offer"`, undefined);
        await queryRunner.query(`CREATE TABLE "offer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "bottleSize" integer NOT NULL, "bottleAmount" integer NOT NULL, "oldPrice" integer NOT NULL, "price" integer NOT NULL, "category" varchar NOT NULL, "isLatest" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "postCodeId" integer)`, undefined);
        await queryRunner.query(`INSERT INTO "offer"("id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId") SELECT "id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId" FROM "temporary_offer"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_offer"`, undefined);
        await queryRunner.query(`ALTER TABLE "post_code" RENAME TO "temporary_post_code"`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "post_code"("id", "postCode", "isActive", "createdAt", "updatedAt", "userId") SELECT "id", "postCode", "isActive", "createdAt", "updatedAt", "userId" FROM "temporary_post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "offer"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
    }

}
