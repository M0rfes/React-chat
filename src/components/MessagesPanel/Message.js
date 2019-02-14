import React from 'react';
import { Comment, Image } from 'semantic-ui-react';
const isOwnMessage = (message, user) =>
  message.user.id === user.id
    ? { borderLeft: '2px solid orange', paddingLeft: '8px' }
    : {};
const isImage = message =>
  message.hasOwnProperty('image') && !message.hasOwnProperty('message');
const Message = ({ message, user }) => {
  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content style={isOwnMessage(message, user)}>
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        {isImage(message) ? (
          <Image
            src={message.image}
            style={{ display: 'block', padding: '1em', height: '15vh' }}
          />
        ) : (
          <Comment.Text>{message.message}</Comment.Text>
        )}
      </Comment.Content>
    </Comment>
  );
};
export default Message;
