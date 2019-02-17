import React, { Component } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import firebase from '../../firebase';
class Starred extends Component {
  state = {
    staredChannel: [],
    activeChannel: '',
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users')
  };
  componentDidMount() {
    if (this.state.user) this.addListeners(this.state.user.uid);
  }
  addListeners = uid => {
    this.state.usersRef
      .child(uid)
      .child('starred')
      .on('child_added', snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          staredChannel: [...this.state.staredChannel, starredChannel]
        });
      });
    this.state.usersRef
      .child(uid)
      .child('starred')
      .on('child_removed', snap => {
        const starredRemoved = { id: snap.key, ...snap.val() };
        const filteredChannel = this.state.staredChannel.filter(
          channel => channel.id !== starredRemoved.id
        );
        this.setState({
          staredChannel: filteredChannel
        });
      });
  };
  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{
          opacity: 1
        }}
        active={channel.id === this.state.activeChannel}
      />
    ));
  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };
  render() {
    const { staredChannel } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" />
            Stared{' '}
          </span>{' '}
          ({staredChannel.length}){' '}
        </Menu.Item>{' '}
        {this.displayChannels(staredChannel)}{' '}
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
)(Starred);
