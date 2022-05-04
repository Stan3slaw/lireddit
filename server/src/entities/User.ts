import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './Post';
import { UpdootEntity } from './Updoot';

@ObjectType()
@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @OneToMany(() => PostEntity, (post) => post.creator, { onDelete: 'CASCADE' })
  posts: PostEntity[];

  @OneToMany(() => UpdootEntity, (updoot) => updoot.userId)
  updoots: UpdootEntity[];

  @Column()
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
