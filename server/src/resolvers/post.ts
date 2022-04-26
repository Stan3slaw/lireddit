import { PostEntity } from '../entities/Post';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [PostEntity])
  posts(): Promise<PostEntity[]> {
    return PostEntity.find();
  }

  @Query(() => PostEntity, { nullable: true })
  async post(@Arg('id') id: number): Promise<any> {
    return PostEntity.findOneBy({ id });
  }

  @Mutation(() => PostEntity)
  async createPost(@Arg('title') title: string): Promise<PostEntity> {
    return PostEntity.create({ title }).save();
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
