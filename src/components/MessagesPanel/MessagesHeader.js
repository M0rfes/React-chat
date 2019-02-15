import React, { Component } from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';
export default class MessagesHeader extends Component {
  render() {
    const { channelname, numUqUser, handelSearchChange } = this.props;
    return (
      <Segment clearing>
        {/**channel title */}
        <Header fluid="true" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelname}
            <Icon name={'star outline'} color="black" />
          </span>
          <Header.Subheader>{numUqUser}</Header.Subheader>
        </Header>
        {/**channel search input */}
        <Header floated="right">
          <Input
            onChange={handelSearchChange}
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
