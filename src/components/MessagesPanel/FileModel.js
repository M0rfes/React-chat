import React, { Component } from 'react';
import { Modal, Input, Button, Icon } from 'semantic-ui-react';
import mime from 'mime-types';
export default class FileModel extends Component {
  state = {
    file: null,
    authorised: ['image/jpeg', 'image/png']
  };
  addFile = event => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ file });
    }
  };
  isAuthorised = name => this.state.authorised.includes(mime.lookup(name));
  sendFile = () => {
    const { file } = this.state;
    const { upload, closeModel } = this.props;
    if (file !== null && this.isAuthorised(file.name)) {
      const metaData = { contentType: mime.lookup(file.name) };
      upload(file, metaData);
      closeModel();
      this.clearFile();
    }
  };
  clearFile = () => this.setState({ file: null });
  render() {
    const { model, closeModel } = this.props;
    return (
      <Modal basic open={model} onClose={closeModel}>
        <Modal.Header>Pick an Image</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.addFile}
            fluid
            label="file type jpg,png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.sendFile} color="green" inverted>
            <Icon name="checkmark" /> send
          </Button>
          <Button color="red" inverted onClick={closeModel}>
            <Icon name="remove" /> cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
