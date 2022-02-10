import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import cors from 'cors';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import session from 'express-session';

import { COOKIE_NAME, __prod__ } from './constants';
import { ContextType } from './types';

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  redis.connect().catch(console.error);

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
    context: ({ req, res }): ContextType => ({ em: orm.em, req, res, redis }),
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
