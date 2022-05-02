require('dotenv').config();
import 'reflect-metadata';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import cors from 'cors';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import { createConnection } from 'typeorm';
import path from 'path';

import { COOKIE_NAME, __prod__ } from './constants';
import { ContextType } from './types';
import { PostEntity } from './entities/Post';
import { UserEntity } from './entities/User';

const main = async () => {
  await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'lireddit',
    username: 'postgres',
    password: '9642',
    logging: true,
    synchronize: true,
    entities: [PostEntity, UserEntity],
    migrations: [path.join(__dirname, './migrations/*')],
  });

  // conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis({ lazyConnect: true });

  await redis.connect().catch(console.error);

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );

  app.use(
    session({
      name: COOKIE_NAME,
      secret: process.env.SESSION_SECRET as string,
      saveUninitialized: false,
      resave: false,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: 'lax', //csrf
        secure: __prod__, //cookie only works in https
      },
    }),
  );

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    schema: await buildSchema({
      resolvers: [__dirname + '/resolvers/*{.ts,.js}'],
      validate: false,
    }),
    context: ({ req, res }): ContextType => ({ req, res, redis }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () => {
    console.log(`Server is runnig on the ${process.env.PORT} port`);
  });
};

main().catch((e) => {
  console.log(e);
});
