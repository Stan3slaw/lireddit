import { NextPage } from 'next';
import { Form, Formik } from 'formik';
import { InputField } from '../components/InputField';
import { Box, Button, Link } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface LoginProps {}

const Login: NextPage<LoginProps> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push('/');
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='usernameOrEmail'
              placeholder='Username or email'
              label='Username or email'
            />
            <Box mt={4}>
              <InputField name='password' placeholder='Password' label='Password' type='password' />
            </Box>
            <Box display='flex' flexDirection='column' alignItems='center'>
              <Box>
                <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='telegram'>
                  Login
                </Button>
              </Box>
              <NextLink href='/register'>
                <Link color='telegram.500' mt={3}>
                  Have no account yet? Sign up
                </Link>
              </NextLink>

              <NextLink href='/forgot-password'>
                <Link color='telegram.500' mt={3}>
                  Forgot password?
                </Link>
              </NextLink>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
