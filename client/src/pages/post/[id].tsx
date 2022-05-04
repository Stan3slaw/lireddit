import { Flex, Heading, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post: React.FC = () => {
  const [{ data, fetching, error }] = useGetPostFromUrl();
  if (fetching) {
    return <Layout>loading...</Layout>;
  }

  if (error) {
    return (
      <Flex justifyContent='center'>
        <Text color='red'>{error.message}</Text>
      </Flex>
    );
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
    <Layout>
      <Heading mb={10}>{data.post.title}</Heading>
      {data.post.text}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
