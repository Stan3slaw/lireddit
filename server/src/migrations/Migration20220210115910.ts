import { Migration } from '@mikro-orm/migrations';

export class Migration20220210115910 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "users" add column "email" text not null;');
    this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");');
  }
}
