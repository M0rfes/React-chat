// @ts-check
import React, { Component } from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModel from './FileModel';
import uuidv4 from 'uuid/v4';
import firebase from '../../firebase';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
export default class MessageForm extends Component {
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    model: false,
    uploadState: '',
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    perUploaded: 0,
    privateChannel: this.props.isPrivateChannel,
    typingRef: firebase.database().ref('typing'),
    emojiPicker: false
  };
  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }
  openModel = () => this.setState({ model: true });
  closeModel = () => this.setState({ model: false });
  handelChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  createMessage = (file = null) => {
    const message = {
      timestamp: JSON.stringify(Date()),
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    if (file !== null) {
      message['image'] = file;
    } else {
      message['message'] = this.state.message;
    }
    return message;
  };
  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, typingRef, user } = this.state;
    if (message) {
      this.setState({ loading: true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({
            loading: false,
            message: '',
            errors: [],
            emojiPicker: false
          });
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
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
  getPath = () => {
    if (this.state.privateChannel) {
      return `chat/private/${this.state.channel.id}`;
    } else {
      return `chat/public`;
    }
  };
  upload = (file, metaData) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const path = `${this.getPath()}/${uuidv4()}.jpg`;
    this.setState(
      {
        uploadState: 'uploading',
        uploadTask: this.state.storageRef.child(path).put(file, metaData)
      },
      () => {
        this.state.uploadTask.on(
          'state_changed',
          snap => {
            const perUploaded = Math.round(
              (snap.byteTransferred / snap.totalByte) * 100
            );
            this.setState({ perUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: [...this.state.errors, err],
              uploadState: 'error',
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(dUrl => {
                this.sendFileMessage(dUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: [...this.state.errors, err],
                  uploadState: 'error',
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };
  sendFileMessage = (Url, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(Url))
      .then(() => {
        this.setState({ uploadState: 'done' });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: [...this.state.errors, err]
        });
      });
  };
  handelKeyDown = e => {
    if (e.ctrlKey && e.keyCode === 13) {
      this.sendMessage();
    }
    const { message, typingRef, channel, user } = this.state;
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };
  handelTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };
  handelAddEmoji = e => {
    let message = this.state.message + e.native;
    this.setState({ message });
  };
  render() {
    const {
      errors,
      message,
      loading,
      model,
      uploadState,
      emojiPicker
    } = this.state;
    return (
      <React.Fragment>
        {emojiPicker && (
          <Picker
            set="emojione"
            style={{ position: 'absolute', bottom: 140 }}
            title="emoji"
            emoji="point_up"
            onSelect={this.handelAddEmoji}
          />
        )}
        <Segment className="message__form">
          <Input
            fluid
            name="message"
            onKeyDown={this.handelKeyDown}
            onChange={this.handelChange}
            style={{ marginBottom: '0.7em' }}
            label={
              <Button
                content={emojiPicker ? '❌' : '😊'}
                onClick={this.handelTogglePicker}
              />
            }
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
              disabled={uploadState === 'uploading'}
              onClick={this.openModel}
              labelPosition="right"
              icon="cloud upload"
            />
            <FileModel
              model={model}
              closeModel={this.closeModel}
              upload={this.upload}
            />
          </Button.Group>
        </Segment>
      </React.Fragment>
    );
  }
}
