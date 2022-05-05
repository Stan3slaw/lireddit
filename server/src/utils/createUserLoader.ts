import DataLoader from 'dataloader';
import { UserEntity } from '../entities/User';

export const createUserLoader = () =>
  new DataLoader<number, UserEntity>(async (userIds) => {
    const users = await UserEntity.findByIds(userIds as number[]);
    const userIdsToUser: Record<number, UserEntity> = {};
    users.forEach((u) => {
      userIdsToUser[u.id] = u;
    });

    return userIds.map((userId) => userIdsToUser[userId]);
  });
