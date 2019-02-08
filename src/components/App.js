import React from 'react';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanael/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import MessagesPanel from './MessagesPanel/MessagesPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import { connect } from 'react-redux';
import './App.css';

const App = ({ user }) => (
  <Grid columns="equal" className="app" style={{ backgroundColor: '#eeeeee' }}>
    <ColorPanel />
    <SidePanel currentUser={user} />
    <Grid.Column style={{ marginLeft: 320 }}>
      <MessagesPanel />
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel />
    </Grid.Column>
  </Grid>
);
const mapStateToProps = state => ({
  user: state.user.currentUser
});
export default connect(mapStateToProps)(App);
