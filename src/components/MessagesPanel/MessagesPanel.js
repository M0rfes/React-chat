import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessageHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Typing from './Typing';
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
    privateMessagesRef: firebase.database().ref('privateMessages'),
    isChannelStarred: false,
    usersRef: firebase.database().ref('users'),
    typingRef: firebase.database().ref('typing'),
    typingUsers: [],
    connectedRef: firebase.database().ref('.info/connected'),
    listeners: []
  };
  componentDidMount() {
    const { user, channel, listeners } = this.state;
    if (channel && user) {
      this.removeListeners(listeners);
      this.addListener(channel.id);
      this.addUsersStarListener(channel.id, user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }
  removeListeners = listeners => {
    listeners.forEach(listener =>
      listener.ref.child(listener.id).off(listener.event)
    );
  };
  addToListener = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event && event
      );
    });
    if (index === -1) {
      this.setState({
        listeners: [...this.state.listeners, { id, ref, event }]
      });
    }
  };

  addUsersStarListener = (cid, uid) => {
    this.state.usersRef
      .child(uid)
      .child('starred')
      .once('value')
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const preStarred = channelIds.includes(cid);
          this.setState({ isChannelStarred: preStarred });
        }
      });
  };
  addListener = id => {
    this.addMessageListener(id);
    this.addTypingListener(id);
  };
  addTypingListener = id => {
    let typingUsers = [];
    this.state.typingRef.child(id).on('child_added', snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = [
          ...typingUsers,
          {
            id: snap.key,
            name: snap.val()
          }
        ];
        this.setState({ typingUsers });
      }
    });
    this.addToListener(id, this.state.typingRef, 'child_added');
    this.state.typingRef.child(id).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });
    this.addToListener(id, this.state.typingRef, 'child_removed');
    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(id)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove();
      }
    });
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
    this.addToListener(id, ref, 'child_added');
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
  handelStar = () => {
    this.setState(
      preState => ({
        isChannelStarred: !preState.isChannelStarred
      }),
      () => this.starChannel()
    );
  };
  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          ...this.state.channel
        }
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err => err && console.err(err));
    }
  };
  componentDidUpdate() {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
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
      privateChannel,
      isChannelStarred,
      typingUsers
    } = this.state;
    return (
      <React.Fragment>
        <MessageHeader
          channelname={this.displayChannelName(channel)}
          numUqUser={numUqUser}
          handelSearchChange={this.handelSearchChange}
          isPrivateChannel={privateChannel}
          handelStar={this.handelStar}
          isChannelStarred={isChannelStarred}
        />
        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {typingUsers.length > 0 &&
              typingUsers.map(user => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.2em'
                  }}
                  key={user.uid}
                >
                  <span className="user_typing">{user.name} is Typing...</span>
                  <Typing />
                </div>
              ))}
            <div ref={node => (this.messagesEnd = node)} />
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
