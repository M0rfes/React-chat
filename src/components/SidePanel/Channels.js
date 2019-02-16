import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
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
    activeChannel: ''
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
      >
        {' '}
        #{channel.name}{' '}
      </Menu.Item>
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
