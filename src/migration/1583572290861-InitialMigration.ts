import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1583572290861 implements MigrationInterface {
    name = 'InitialMigration1583572290861'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "telegramId" integer NOT NULL, "firstName" varchar NOT NULL, "language" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_f13e982a870792c2cad1ec1078a" UNIQUE ("postCode"))`, undefined);
        await queryRunner.query(`CREATE TABLE "offer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "bottleSize" integer NOT NULL, "bottleAmount" integer NOT NULL, "oldPrice" integer NOT NULL, "price" integer NOT NULL, "category" varchar NOT NULL, "isLatest" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "postCodeId" integer NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code_users_user" ("postCodeId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("postCodeId", "userId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_42278fe062da3882b196f7d771" ON "post_code_users_user" ("postCodeId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_bd18d0c91e7de6e489cac366e5" ON "post_code_users_user" ("userId") `, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_offer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "bottleSize" integer NOT NULL, "bottleAmount" integer NOT NULL, "oldPrice" integer NOT NULL, "price" integer NOT NULL, "category" varchar NOT NULL, "isLatest" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "postCodeId" integer NOT NULL, CONSTRAINT "FK_2d8d27a1fe59268e375073062c2" FOREIGN KEY ("postCodeId") REFERENCES "post_code" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_offer"("id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId") SELECT "id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId" FROM "offer"`, undefined);
        await queryRunner.query(`DROP TABLE "offer"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_offer" RENAME TO "offer"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_42278fe062da3882b196f7d771"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_bd18d0c91e7de6e489cac366e5"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_post_code_users_user" ("postCodeId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_42278fe062da3882b196f7d7714" FOREIGN KEY ("postCodeId") REFERENCES "post_code" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_bd18d0c91e7de6e489cac366e56" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("postCodeId", "userId"))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_post_code_users_user"("postCodeId", "userId") SELECT "postCodeId", "userId" FROM "post_code_users_user"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code_users_user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_post_code_users_user" RENAME TO "post_code_users_user"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_42278fe062da3882b196f7d771" ON "post_code_users_user" ("postCodeId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_bd18d0c91e7de6e489cac366e5" ON "post_code_users_user" ("userId") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_bd18d0c91e7de6e489cac366e5"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_42278fe062da3882b196f7d771"`, undefined);
        await queryRunner.query(`ALTER TABLE "post_code_users_user" RENAME TO "temporary_post_code_users_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code_users_user" ("postCodeId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("postCodeId", "userId"))`, undefined);
        await queryRunner.query(`INSERT INTO "post_code_users_user"("postCodeId", "userId") SELECT "postCodeId", "userId" FROM "temporary_post_code_users_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_post_code_users_user"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_bd18d0c91e7de6e489cac366e5" ON "post_code_users_user" ("userId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_42278fe062da3882b196f7d771" ON "post_code_users_user" ("postCodeId") `, undefined);
        await queryRunner.query(`ALTER TABLE "offer" RENAME TO "temporary_offer"`, undefined);
        await queryRunner.query(`CREATE TABLE "offer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "bottleSize" integer NOT NULL, "bottleAmount" integer NOT NULL, "oldPrice" integer NOT NULL, "price" integer NOT NULL, "category" varchar NOT NULL, "isLatest" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "postCodeId" integer NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "offer"("id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId") SELECT "id", "name", "bottleSize", "bottleAmount", "oldPrice", "price", "category", "isLatest", "createdAt", "updatedAt", "postCodeId" FROM "temporary_offer"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_offer"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_bd18d0c91e7de6e489cac366e5"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_42278fe062da3882b196f7d771"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code_users_user"`, undefined);
        await queryRunner.query(`DROP TABLE "offer"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
    }

}
