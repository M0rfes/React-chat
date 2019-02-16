import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessageHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
export default class MessagesPanel extends Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    numUqUser: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages')
  };
  componentDidMount() {
    const { user, channel } = this.state;
    if (channel && user) {
      this.addListener(channel.id);
    }
  }
  addListener = id => {
    this.addMessageListener(id);
  };
  addMessageListener = id => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(id).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
    });
    this.countUniqueUsers(loadedMessages);
  };
  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const pural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUqUser = `${uniqueUsers.length} user${pural ? 's' : ''}`;
    this.setState({ numUqUser });
  };
  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));
  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? '@' : '#'}${channel.name}`
      : '';
  };
  handelSearchChange = event => {
    this.setState({ searchTerm: event.target.value, searchLoading: true }, () =>
      this.handelSearchMessages()
    );
  };
  handelSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelMessages.reduce((acc, message) => {
      if (message.message && message.message.match(regex)) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
  };
  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };
  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      numUqUser,
      searchTerm,
      searchResults,
      privateChannel
    } = this.state;
    return (
      <React.Fragment>
        <MessageHeader
          channelname={this.displayChannelName(channel)}
          numUqUser={numUqUser}
          handelSearchChange={this.handelSearchChange}
          isPrivateChannel={privateChannel}
        />
        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}
