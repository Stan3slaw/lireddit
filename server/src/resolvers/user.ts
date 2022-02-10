import { UserEntity } from '../entities/User';
import { ContextType } from '../types';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { v4 } from 'uuid';

import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { registerValidate } from '../utils/registerValidate';
import { sendEmail } from '../utils/sendEmail';

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { em, redis }: ContextType) {
    const user = await em.findOne(UserEntity, { email });
    if (!user) {
      return true;
    }

    const token = v4();
    console.log(token);
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);

    sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>Reset your password</a>`,
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { em, req, redis }: ContextType,
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Password length must be greater than 3',
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token expired',
          },
        ],
      };
    }

    const user = await em.findOne(UserEntity, { id: +userId });
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User no longer exists',
          },
        ],
      };
    }
    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    await redis.del(key);

    //login after changing the password
    req.session.userId = user.id;

    return { user };
  }

  @Query(() => UserEntity, { nullable: true })
  async me(@Ctx() { em, req }: ContextType) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(UserEntity, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: ContextType,
  ): Promise<UserResponse> {
    const errors = registerValidate(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(UserEntity)
        .getKnexQuery()
        .insert({
          email: options.email,
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      user = result[0];
      console.log(result);
    } catch (err) {
      //duplicate username error
      // || err.details.includes('already exists')
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already taken',
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: ContextType,
  ): Promise<UserResponse> {
    const user = await em.findOne(
      UserEntity,
      usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail },
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'Username or email does not exist',
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Incorrect password',
          },
        ],
      };
    }
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: ContextType) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        return resolve(true);
      }),
    );
  }
}
