import React, { Component } from 'react';
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label
} from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    model: false,
    channelName: '',
    channelDetails: '',
    channelRef: firebase.database().ref('channels'),
    firstLoad: true,
    activeChannel: '',
    channel: null,
    messagesRef: firebase.database().ref('messages'),
    notifications: [],
    typingRef: firebase.database().ref('typing')
  };
  closeModal = () =>
    this.setState({
      model: false
    });
  openModal = () =>
    this.setState({
      model: true
    });
  handelChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };
  handelSubmit = e => {
    e.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };
  addChannel = () => {
    const { channelRef, channelName, channelDetails, user } = this.state;
    const key = channelRef.push().key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    channelRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({
          channelDetails: '',
          channelName: ''
        });
        this.closeModal();
      })
      .catch(e => console.log(e));
  };
  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ firstLoad: false });
      this.setState({ channel: firstChannel });
    }
  };
  isFormValid = ({ channelName, channelDetails }) =>
    channelDetails && channelName;
  componentDidMount() {
    this.addListener();
  }
  componentWillUnmount() {
    this.removeListener();
  }
  removeListener = () => {
    this.state.channelRef.off();
    this.state.channels.forEach(channel =>
      this.state.messagesRef.child(channel.id).off()
    );
  };

  addListener = () => {
    const loadedChannels = [];
    this.state.channelRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      this.setState(
        {
          channels: loadedChannels
        },
        this.setFirstChannel
      );
      this.addNotificationListener(snap.key);
    });
  };
  addNotificationListener = channelId => {
    this.state.messagesRef.child(channelId).on('value', snap => {
      if (this.state.channel) {
        this.handelNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };
  handelNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let i = notifications.findIndex(nof => nof.id === channelId);
    if (i !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[i].total;
        if (snap.numChildren() - lastTotal > 0) {
          notifications[i].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[i].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }
    this.setState({ notifications });
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
      >
        {<Label color="red">{this.getNotificationCount(channel)}</Label>}#
        {channel.name}{' '}
      </Menu.Item>
    ));
  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
    this.clearNotification();
  };
  getNotificationCount = channel => {
    let count = 0;
    this.state.notifications.forEach(nof => {
      if (nof.id === channel.id) {
        count = nof.count;
      }
    });
    if (count > 0) return count;
    else return 0;
  };
  clearNotification = () => {
    let index = this.state.notifications.findIndex(
      n => n.id === this.state.channel.id
    );
    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };
  render() {
    const { channels, model } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" />
              Channels{' '}
            </span>{' '}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />{' '}
          </Menu.Item>{' '}
          {this.displayChannels(channels)}{' '}
        </Menu.Menu>{' '}
        <Modal basic open={model} onClose={this.onCloseModal}>
          <Modal.Header> Add a Channel </Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Chanel"
                  onChange={this.handelChange}
                  name="channelName"
                />
              </Form.Field>{' '}
              <Form.Field>
                <Input
                  fluid
                  label="About the Chanel"
                  onChange={this.handelChange}
                  name="channelDetails"
                />
              </Form.Field>{' '}
            </Form>{' '}
          </Modal.Content>{' '}
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handelSubmit}>
              <Icon name="checkmark" /> Add{' '}
            </Button>{' '}
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel{' '}
            </Button>{' '}
          </Modal.Actions>{' '}
        </Modal>{' '}
      </React.Fragment>
    );
  }
}
export default connect(
  null,
  {
    setCurrentChannel,
    setPrivateChannel
  }
)(Channels);
