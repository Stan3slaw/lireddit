import React from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  let body = null;
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Button colorScheme='telegram' variant='outline' mr={4}>
            Log in
          </Button>
        </NextLink>
        <NextLink href='/register'>
          <Button colorScheme='telegram' variant='solid'>
            Sign up
          </Button>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex alignItems='center'>
        <Box mr={4}>{data.me.username}</Box>
        <Button
          colorScheme='telegram'
          variant='outline'
          isLoading={logoutFetching}
          onClick={() => {
            logout();
          }}>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bgColor='white' p={4} borderBottom='1px solid #e2e2e2'>
      <Box ml='auto'>{body}</Box>
    </Flex>
  );
};
