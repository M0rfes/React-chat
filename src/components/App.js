import React from 'react';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanael/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import MessagesPanel from './MessagesPanel/MessagesPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import { connect } from 'react-redux';
import './App.css';

const App = ({ currentUser, currentChannel, isPrivateChannel }) => (
  <Grid columns="equal" className="app" style={{ backgroundColor: '#eeeeee' }}>
    <ColorPanel />
    <SidePanel currentUser={currentUser} key={currentUser && currentUser.id} />
    <Grid.Column style={{ marginLeft: 320 }}>
      <MessagesPanel
        currentChannel={currentChannel}
        key={currentChannel && currentChannel.id}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel />
    </Grid.Column>
  </Grid>
);
const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel
});
export default connect(mapStateToProps)(App);
