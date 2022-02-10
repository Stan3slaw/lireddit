import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

export type ContextType = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
  redis: Redis;
};
