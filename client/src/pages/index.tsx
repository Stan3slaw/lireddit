import { Box, Button, Flex, Heading, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Home: NextPage = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: null as null | string });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!data && !fetching) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='100vh'>
        You got query failed for some reason
      </Box>
    );
  }

  return (
    <Layout>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Heading>LiReddit</Heading>
        <NextLink href='create-post'>
          <Link>Create post</Link>
        </NextLink>
      </Box>
      <br />
      <Stack spacing={8} mb={8}>
        {data?.posts.posts.map((p) =>
          !data && fetching ? (
            <Box justifyContent='center'>
              <Spinner size='xl' />
            </Box>
          ) : (
            <Box key={p.id} p={5} shadow='md' borderWidth='1px'>
              <Heading fontSize='xl'>{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ),
        )}
      </Stack>
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            m='auto'
            mb={8}
            isLoading={fetching}
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }>
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Home);
