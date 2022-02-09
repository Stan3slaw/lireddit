import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface RegisterProps {}

const Register: NextPage<RegisterProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push('/');
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name='username' placeholder='Username' label='Username' />
            <Box mt={4}>
              <InputField name='password' placeholder='Password' label='Password' type='password' />
            </Box>

            <Box display='flex' flexDirection='column' alignItems='center'>
              <Box>
                <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='telegram'>
                  Sign up
                </Button>
              </Box>
              <NextLink href='/login'>
                <Link color='telegram.500' mt={3}>
                  Login
                </Link>
              </NextLink>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
