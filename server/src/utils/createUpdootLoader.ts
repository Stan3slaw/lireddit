import DataLoader from 'dataloader';
import { UpdootEntity } from '../entities/Updoot';

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, UpdootEntity | null>(async (keys) => {
    const updoots = await UpdootEntity.findByIds(keys as any);
    const updootIdsToUpdoot: Record<string, UpdootEntity> = {};
    updoots.forEach((updoot) => {
      updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
    });

    return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
  });
