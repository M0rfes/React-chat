import React, { Component } from 'react';
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  ModalActions,
  Button
} from 'semantic-ui-react';
import firebase from './../../firebase';
import AvatarEditor from 'react-avatar-editor';
class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: '',
    croppedImage: '',
    blob: '',
    storage: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    metadata: {
      contentType: 'image/jpeg'
    },
    uploadCroppedImage: '',
    usersRef: firebase.database().ref('users')
  };
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
  dropDownOptions = () => [
    {
      key: 'User',
      text: (
        <span>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: 'Avatar',
      text: <span onClick={this.openModal}>Changed Avatar</span>
    },
    {
      key: 'signOut',
      text: <span onClick={this.handelSignOut}>signOut</span>
    }
  ];
  handelSignOut = () => {
    console.log('hi');
    firebase
      .auth()
      .signOut()
      .then(() => console.log('sign out'));
  };
  handelChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };
  handelCropImage = e => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({ croppedImage: imageUrl, blob });
      });
    }
  };
  uploadImage = () => {
    const { userRef, storage, blob, metadata } = this.state;
    storage
      .child(`avatars/user/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(durl => {
          this.setState({ uploadCroppedImage: durl }, () =>
            this.changeAvatar()
          );
        });
      });
  };
  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadCroppedImage
      })
      .then(() => this.closeModal())
      .catch(err => console.error(err));
    this.state.usersRef
      .child(this.state.user.uid)
      .update({ avatar: this.state.uploadCroppedImage })
      .then(a => console.log(a))
      .catch(e => console.error(e));
  };
  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primary } = this.props;
    return (
      <Grid style={{ background: primary }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
            {/* Main Application Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>Chat</Header.Content>
            </Header>
            {/* Drop Down */}
            <Header style={{ padding: '.25em' }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropDownOptions()}
              />
            </Header>
          </Grid.Row>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handelChange}
                fluid
                type="file"
                label="new avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row>
                  <Grid.Column className="ui centered aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={20}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        src={croppedImage}
                        style={{ margin: '3.5em auto' }}
                        width={100}
                        height={100}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <ModalActions>
              {croppedImage && (
                <Button color="green" onClick={this.uploadImage}>
                  {' '}
                  <Icon name="save" /> Save
                </Button>
              )}
              <Button color="blue" onClick={this.handelCropImage}>
                {' '}
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" onClick={this.closeModal}>
                {' '}
                <Icon name="remove" /> Cancel
              </Button>
            </ModalActions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
