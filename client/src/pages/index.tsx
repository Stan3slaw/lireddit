import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import { UpdootSection } from '../components/UpdootSection';
import { useMeQuery, usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Home: NextPage = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string });
  const [{ data, fetching, error }] = usePostsQuery({
    variables,
  });
  const [{ data: meData }] = useMeQuery();

  if (!data && !fetching) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='100vh'
        flexDirection='column'>
        <Box>You got query failed for some reason</Box>
        <Box>{error?.message}</Box>
      </Box>
    );
  }

  return (
    <Layout>
      <Box display='flex' justifyContent='space-between' alignItems='center'></Box>
      <br />
      <Stack spacing={8} mb={8}>
        {data?.posts.posts.map((p) =>
          !p ? null : (
            <Flex key={p.id} p={5} shadow='md' borderWidth='1px'>
              <UpdootSection post={p} />
              <Box flex={1}>
                <NextLink href='post/[id]' as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize='xl'>{p.title}</Heading>
                  </Link>
                </NextLink>

                <Text>posted by {p.creator.username}</Text>
                <Flex>
                  <Text flex={1} mt={4}>
                    {p.textSnippet}
                  </Text>
                  {meData?.me?.id === p.creator.id ? <EditDeletePostButtons id={p.id} /> : null}
                </Flex>
              </Box>
            </Flex>
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
