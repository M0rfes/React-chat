import React, { Component } from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';
export default class MessagesHeader extends Component {
  render() {
    return (
      <Segment clearing>
        {/**channel title */}
        <Header fluid="true" floated="left" style={{ marginBottom: 0 }}>
          <span>
            channel
            <Icon name={'star outline'} color="black" />
          </span>
          <Header.Subheader>{'2 users'}</Header.Subheader>
        </Header>
        {/**channel search input */}
        <Header floated="right">
          <Input
            size="mini"
            icon="search"
            name="searchTerms"
            placeholder="Search messages"
          />
        </Header>
      </Segment>
    );
  }
}
