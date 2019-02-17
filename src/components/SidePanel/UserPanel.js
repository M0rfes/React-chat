import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';
import firebase from './../../firebase';

class UserPanel extends Component {
  state = {
    user: this.props.currentUser
  };

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
      text: <span>Changed Avatar</span>
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
  render() {
    const { user } = this.state;
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
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
