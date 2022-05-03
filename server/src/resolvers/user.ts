import { UserEntity } from '../entities/User';
import { ContextType } from '../types';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import argon2 from 'argon2';
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

@Resolver(UserEntity)
export class UserResolver {
  @FieldResolver()
  email(@Root() user: UserEntity, @Ctx() { req }: ContextType) {
    if (req.session.userId === user.id) {
      return user.email;
    }
    return '';
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { redis }: ContextType) {
    const user = await UserEntity.findOneBy({ email });
    if (!user) {
      return true;
    }

    const token = v4();
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
    @Ctx() { req, redis }: ContextType,
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

    const user = await UserEntity.findOneBy({ id: +userId });
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

    UserEntity.update({ id: +userId }, { password: await argon2.hash(newPassword) });

    await redis.del(key);

    //login after changing the password
    req.session.userId = user.id;

    return { user };
  }

  @Query(() => UserEntity, { nullable: true })
  me(@Ctx() { req }: ContextType) {
    if (!req.session.userId) {
      return null;
    }
    return UserEntity.findOneBy({ id: req.session.userId });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: ContextType,
  ): Promise<UserResponse> {
    const errors = registerValidate(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      // UserEntity.create({}).save()
      const result = await UserEntity.createQueryBuilder()
        .insert()
        .into('users')
        .values({
          email: options.email,
          username: options.username,
          password: hashedPassword,
        })
        .returning('*')
        .execute();
      user = result.raw[0];
    } catch (err) {
      //duplicate username error
      // || err.details.includes('already exists')
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'email',
              message: 'Email already taken',
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
    @Ctx() { req }: ContextType,
  ): Promise<UserResponse> {
    const user = await UserEntity.findOneBy(
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
