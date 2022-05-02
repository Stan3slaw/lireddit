import { PostEntity } from '../entities/Post';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from 'type-graphql';
import { ContextType } from 'src/types';
import { isAuth } from '../middlewares/isAuth';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [PostEntity])
  posts: PostEntity[];

  @Field()
  hasMore: boolean;
}

@Resolver(PostEntity)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: PostEntity) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedPosts> {
    console.log(limit, cursor);
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const qb = PostEntity.createQueryBuilder('p')
      .orderBy('"createdAt"', 'DESC')
      .take(realLimitPlusOne);
    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(+cursor) });
    }

    const posts = await qb.getMany();

    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => PostEntity, { nullable: true })
  async post(@Arg('id') id: number): Promise<any> {
    return PostEntity.findOneBy({ id });
  }

  @Mutation(() => PostEntity)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: ContextType,
  ): Promise<PostEntity> {
    return PostEntity.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => PostEntity, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
  ): Promise<PostEntity | null> {
    const post = await PostEntity.findOneBy({ id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await PostEntity.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await PostEntity.delete({ id });
    return true;
  }
}
