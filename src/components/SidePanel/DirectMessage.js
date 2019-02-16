import React, { Component } from 'react';
import firebase from '../../firebase';
import { Menu, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
class DirectMessages extends Component {
  state = {
    users: [],
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence'),
    activeChannel: ''
  };
  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }
  addListener = uid => {
    const loadedUsers = [];
    this.state.usersRef.on('child_added', snap => {
      if (uid !== snap.key) {
        let user = snap.val();
        user['uid'] = snap.key;
        user['status'] = 'offline';
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });
    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(uid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          err && console.error(err);
        });
      }
    });
    this.state.presenceRef.on('child_added', snap => {
      if (uid !== snap.key) {
        this.addStatus(snap.key);
      }
    });
    this.state.presenceRef.on('child_removed', snap => {
      if (uid !== snap.key) {
        this.addStatus(snap.key, false);
      }
    });
  };
  addStatus = (uid, status = true) => {
    const connectedUser = this.state.users.reduce((acc, user) => {
      if (uid === user.uid) {
        user['status'] = `${status ? 'online' : 'offline'}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: connectedUser });
  };
  isUserOnline = user => {
    return user.status === 'online';
  };
  changeChannel = user => {
    const channelId = this.getId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };
  setActiveChannel = uid => {
    this.setState({ activeChannel: uid });
  };
  getId = uid => {
    const cuid = this.state.user.uid;
    return uid < cuid ? `${uid}/${cuid}` : `${cuid}/${uid}`;
  };
  render() {
    const { users, activeChannel } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: 'italic' }}
            active={user.uid === activeChannel}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? 'green' : 'red'}
            />
            @{user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}
export default connect(
  null,
  {
    setCurrentChannel,
    setPrivateChannel
  }
)(DirectMessages);
