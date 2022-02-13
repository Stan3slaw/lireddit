import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface ForgotPasswordProps {}

const ForgotPassword: NextPage<ForgotPasswordProps> = ({}) => {
  const [complete, setComplete] = React.useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}>
        {({ isSubmitting }) =>
          complete ? (
            <Box>If an account with that email exists, we sent email to you</Box>
          ) : (
            <Form>
              <InputField name='email' label='Email' placeholder='Email' type='email' />
              <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='telegram'>
                Send email
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
