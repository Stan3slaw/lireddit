import { Request, Response } from 'express';
import { Redis } from 'ioredis';

declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

export type ContextType = {
  req: Request;
  res: Response;
  redis: Redis;
};
