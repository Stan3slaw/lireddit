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
import { getConnection } from 'typeorm';
import { UpdootEntity } from '../entities/Updoot';
import { UserEntity } from '../entities/User';

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

  @FieldResolver(() => UserEntity)
  creator(@Root() post: PostEntity, @Ctx() { userLoader }: ContextType) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() post: PostEntity, @Ctx() { updootLoader, req }: ContextType) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = (await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    })) as any;

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: ContextType,
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;
    const updoot = await UpdootEntity.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update updoots
          set value = $1
          where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId],
        );

        await tm.query(
          `
          update posts
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId],
        );
      });
    } else if (!updoot) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          insert into updoots ("userId", "postId", value)
          values ($1, $2, $3)
        `,
          [userId, postId, realValue],
        );

        await tm.query(
          `
          update posts
          set points = points + $1
          where id = $2
      `,
          [realValue, postId],
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
    select p.*
    from posts p
    ${cursor ? `where p."createdAt" < $2` : ''}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements,
    );
    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => PostEntity, { nullable: true })
  async post(@Arg('id', () => Int) id: number): Promise<PostEntity | null> {
    return PostEntity.findOne({
      where: { id },
    });
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: ContextType,
  ): Promise<PostEntity | null> {
    const updatedPost = await PostEntity.createQueryBuilder()
      .update(PostEntity)
      .set({
        title,
        text,
      })
      .where('id = :id', { id })
      .andWhere('"creatorId" = :creatorId', { creatorId: req.session.userId })
      .returning('*')
      .execute();
    return updatedPost.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: ContextType,
  ): Promise<boolean> {
    await PostEntity.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
