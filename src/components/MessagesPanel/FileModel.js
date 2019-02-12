import React, { Component } from 'react';
import { Modal, Input, Button, Icon } from 'semantic-ui-react';
export default class FileModel extends Component {
  state = {
    file: null
  };
  render() {
    const { model, closeModel } = this.props;
    return (
      <Modal basic open={model} onClose={closeModel}>
        <Modal.Header>Pick an Image</Modal.Header>
        <Modal.Content>
          <Input fluid label="file type jpg,png" name="file" type="file" />
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted>
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
