import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import { __prod__ } from './constants';

export default {
  type: 'postgresql',
  dbName: 'lireddit',
  port: 5432,
  user: 'postgres',
  password: '9642',
  entities: [__dirname + '/entities/*{.ts,.js}'],
  migrations: {
    path: path.join(__dirname + '/migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
