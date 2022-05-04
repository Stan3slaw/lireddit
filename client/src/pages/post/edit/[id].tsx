import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost: React.FC = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return <Layout>loading...</Layout>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Flex justifyContent='center'>
          <Text color='red'>Could not find post</Text>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          const { error } = await updatePost({ id: intId, ...values });
          if (!error) {
            router.back();
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name='title' placeholder='Title' label='Title' />
            <Box mt={4}>
              <InputField textarea name='text' placeholder='Text...' label='Body' />
            </Box>
            <Box display='flex' flexDirection='column' alignItems='center'>
              <Box>
                <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='telegram'>
                  Update post
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
