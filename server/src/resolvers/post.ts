import { PostEntity } from '../entities/Post';
import { ContextType } from 'src/types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [PostEntity])
  posts(@Ctx() { em }: ContextType): Promise<PostEntity[]> {
    return em.find(PostEntity, {});
  }

  @Query(() => PostEntity, { nullable: true })
  post(@Arg('id') id: number, @Ctx() { em }: ContextType): Promise<PostEntity | null> {
    return em.findOne(PostEntity, { id });
  }

  @Mutation(() => PostEntity)
  async createPost(@Arg('title') title: string, @Ctx() { em }: ContextType): Promise<PostEntity> {
    const post = em.create(PostEntity, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => PostEntity, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: ContextType,
  ): Promise<PostEntity | null> {
    const post = await em.findOne(PostEntity, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number, @Ctx() { em }: ContextType): Promise<boolean> {
    await em.nativeDelete(PostEntity, { id });
    return true;
  }
}
