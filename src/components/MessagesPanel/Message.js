import React from 'react';
import { Comment } from 'semantic-ui-react';
const isOwnMessage = (message, user) =>
  message.user.id === user.id ? 'message_self' : null;
const Message = ({ message, user }) => {
  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content className={isOwnMessage(message, user)}>
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        <Comment.Text>{message.message}</Comment.Text>
      </Comment.Content>
    </Comment>
  );
};
export default Message;
