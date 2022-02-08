import React from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { useMeQuery } from '../generated/graphql';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  let body = null;
  const [{ data, fetching }] = useMeQuery();

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Button color='white' variant='outline' mr={4}>
            Log in
          </Button>
        </NextLink>
        <NextLink href='/register'>
          <Button color='telegram.500' variant='solid'>
            Sign up
          </Button>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={3}>{data.me.username}</Box>
        <Button variant='link' color='white'>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bgColor='telegram.500' p={4}>
      <Box ml='auto'>{body}</Box>
    </Flex>
  );
};
