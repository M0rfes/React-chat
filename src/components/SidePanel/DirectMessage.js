import React, { Component } from 'react';
import firebase from '../../firebase';
import { Menu, Icon } from 'semantic-ui-react';
export default class DirectMessages extends Component {
  state = {
    users: [],
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence')
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
    this.state.presenceRef.on('child_added', snap => {});
    this.state.presenceRef.on('child_removed', snap => {});
  };
  render() {
    const { users } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {/** */}
      </Menu.Menu>
    );
  }
}
