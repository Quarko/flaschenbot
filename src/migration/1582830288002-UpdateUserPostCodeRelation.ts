import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUserPostCodeRelation1582830288002 implements MigrationInterface {
    name = 'UpdateUserPostCodeRelation1582830288002'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_post_code"("id", "postCode", "isActive", "createdAt", "updatedAt", "userId") SELECT "id", "postCode", "isActive", "createdAt", "updatedAt", "userId" FROM "post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_post_code" RENAME TO "post_code"`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code_users_user" ("postCodeId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("postCodeId", "userId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_42278fe062da3882b196f7d771" ON "post_code_users_user" ("postCodeId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_bd18d0c91e7de6e489cac366e5" ON "post_code_users_user" ("userId") `, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_post_code"("id", "postCode", "isActive", "createdAt", "updatedAt") SELECT "id", "postCode", "isActive", "createdAt", "updatedAt" FROM "post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_post_code" RENAME TO "post_code"`, undefined);
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
        await queryRunner.query(`ALTER TABLE "post_code" RENAME TO "temporary_post_code"`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "post_code"("id", "postCode", "isActive", "createdAt", "updatedAt") SELECT "id", "postCode", "isActive", "createdAt", "updatedAt" FROM "temporary_post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_post_code"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_bd18d0c91e7de6e489cac366e5"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_42278fe062da3882b196f7d771"`, undefined);
        await queryRunner.query(`DROP TABLE "post_code_users_user"`, undefined);
        await queryRunner.query(`ALTER TABLE "post_code" RENAME TO "temporary_post_code"`, undefined);
        await queryRunner.query(`CREATE TABLE "post_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "postCode" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, CONSTRAINT "FK_c99eeeec00cf51f8b72427839e9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "post_code"("id", "postCode", "isActive", "createdAt", "updatedAt", "userId") SELECT "id", "postCode", "isActive", "createdAt", "updatedAt", "userId" FROM "temporary_post_code"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_post_code"`, undefined);
    }

}
