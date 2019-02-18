import React, { Component } from 'react';
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from 'semantic-ui-react';
import { TwitterPicker } from 'react-color';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setColors } from '../../actions';

class ColorPanel extends Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    usersRef: firebase.database().ref('users'),
    user: this.props.currentUser,
    userColors: []
  };
  openModal = () => this.setState({ model: true });
  closeModal = () => this.setState({ model: false });
  handleChangePrimary = color => this.setState({ primary: color.hex });
  handleChangeSecondary = color => this.setState({ secondary: color.hex });
  handelSaveColor = () => {
    if (this.state.primary && this.state.secondary)
      this.saveColors(this.state.primary, this.state.secondary);
  };
  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }
  componentWillUnmount() {
    this.removeListener();
  }
  removeListener = () =>
    this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
  addListener = uid => {
    let userColors = [];
    this.state.usersRef.child(`${uid}/colors`).on('child_added', snap => {
      console.log(snap);
      userColors = [snap.val(), ...userColors];
      console.log(userColors);
      this.setState({ userColors });
    });
  };
  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        console.log('added');
        this.closeModal();
      })
      .catch(err => console.error(err));
  };
  displayUserColors = colors =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div className="color_container">
          <div
            className="color_squr"
            style={{ backgroundColor: color.primary }}
            onClick={() => this.props.setColors(color.primary, color.secondary)}
          >
            <div
              className="color_overlay"
              style={{ backgroundColor: color.secondary }}
            >
              ..
            </div>
          </div>
        </div>
      </React.Fragment>
    ));
  render() {
    const { model, primary, secondary, userColors } = this.state;
    return (
      <Sidebar as={Menu} inverted vertical visible width="very thin">
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}
        <Modal basic open={model} onClose={this.closeModal}>
          <Modal.Header>Pick App colour</Modal.Header>
          <Modal.Content>
            <Segment style={{ backgroundColor: primary }}>
              <Label content="primary color" style={{ margin: '1em 0' }} />
              <TwitterPicker
                color={primary}
                onChange={this.handleChangePrimary}
              />
            </Segment>
            <Segment style={{ backgroundColor: secondary }}>
              <Label content="secondary color" style={{ margin: '1em 0' }} />
              <TwitterPicker
                color={secondary}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handelSaveColor}>
              {' '}
              <Icon name="checkmark" /> Save
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" />
              cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}
export default connect(
  null,
  {
    setColors
  }
)(ColorPanel);
