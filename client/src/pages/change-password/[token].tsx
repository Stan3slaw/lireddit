import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import NextLink from 'next/link';
import router from 'next/router';
import React from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/react';

import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { useChangePasswordMutation } from '../../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = React.useState('');
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({ token, newPassword: values.newPassword });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='newPassword'
              placeholder='New password'
              label='New password'
              type='password'
            />
            {tokenError ? (
              <Flex>
                <Box color='red' mt={2} mr={2}>
                  {tokenError}
                </Box>
                <NextLink href='/forgot-password'>
                  <Link color='telegram.500' mt={2}>
                    resend email
                  </Link>
                </NextLink>
              </Flex>
            ) : null}
            <Box d='flex' justifyContent='center'>
              <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='telegram'>
                Change password
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
