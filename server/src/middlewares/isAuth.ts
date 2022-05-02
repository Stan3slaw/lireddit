import { ContextType } from '../types';
import { MiddlewareFn } from 'type-graphql';

export const isAuth: MiddlewareFn<ContextType> = ({ context: { req } }, next) => {
  console.log(req.session);

  if (!req.session.userId) {
    throw new Error('Not authenticated');
  }
  return next();
};
