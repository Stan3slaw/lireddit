import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, IconButton } from '@chakra-ui/react';
import router from 'next/router';
import React from 'react';
import { useDeletePostMutation } from '../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id }) => {
  const [, deletePost] = useDeletePostMutation();

  return (
    <Box>
      <IconButton
        mr={4}
        onClick={() => router.push(`/post/edit/${id}`)}
        aria-label='edit post'
        size='sm'
        icon={<EditIcon />}
      />
      <IconButton
        onClick={() => deletePost({ id })}
        aria-label='delete post'
        size='sm'
        icon={<DeleteIcon />}
      />
    </Box>
  );
};
