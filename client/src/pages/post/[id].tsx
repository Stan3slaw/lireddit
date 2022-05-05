import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { useMeQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post: React.FC = () => {
  const [{ data, fetching, error }] = useGetPostFromUrl();
  const [{ data: meData }] = useMeQuery();
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
      <Heading mb={5}>{data.post.title}</Heading>
      <Box mb={10}>{data.post.text}</Box>
      {meData?.me?.id === data.post.creator.id ? <EditDeletePostButtons id={data.post.id} /> : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
