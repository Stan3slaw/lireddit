import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { PostEntity } from './Post';
import { UserEntity } from './User';

@ObjectType()
@Entity({ name: 'updoots' })
export class UpdootEntity extends BaseEntity {
  @Field()
  @Column({ type: 'int' })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.updoots)
  user: UserEntity;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => PostEntity)
  @ManyToOne(() => PostEntity, (post) => post.updoots, { onDelete: 'CASCADE' })
  post: PostEntity;
}
