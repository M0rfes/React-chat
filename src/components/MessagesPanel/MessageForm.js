// @ts-check
import React, { Component } from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModel from './FileModel';
export default class MessageForm extends Component {
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    model: false
  };
  openModel = () => this.setState({ model: true });
  closeModel = () => this.setState({ model: false });
  handelChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  createMessage = () => {
    const message = {
      timestamp: JSON.stringify(Date()),
      message: this.state.message,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      },
      content: this.state.message
    };
    return message;
  };
  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;
    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors: [] });
        })
        .catch(error => {
          console.error(error);
          this.setState({
            errors: [...this.state.errors, error],
            loading: false
          });
        });
    } else {
      this.setState({
        errors: [...this.state.errors, { message: 'ADD A message' }]
      });
    }
  };
  render() {
    const { errors, message, loading, model } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          onChange={this.handelChange}
          style={{ marginBottom: '0.7em' }}
          label={<Button icon={'add'} />}
          value={message}
          labelPosition="left"
          className={
            errors.some(error => error.message.includes('message'))
              ? 'error'
              : null
          }
          placeholder="Type hear"
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            onClick={this.sendMessage}
            disabled={loading}
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            content="Upload Media"
            onClick={this.openModel}
            labelPosition="right"
            icon="cloud upload"
          />
          <FileModel model={model} closeModel={this.closeModel} />
        </Button.Group>
      </Segment>
    );
  }
}
