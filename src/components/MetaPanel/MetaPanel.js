import React, { Component } from 'react';
import { Segment, Accordion, Header, Icon, Image } from 'semantic-ui-react';
export default class MetaPanel extends Component {
  state = {
    activeIndex: 0,
    isPrivate: this.props.isPrivateChannel,
    channel: this.props.currentChannel
  };
  setActiveIndex = (e, titleProp) => {
    const { index } = titleProp;
    const { activeIndex } = this.state;
    const newIndex = index === activeIndex ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };
  render() {
    const { activeIndex, isPrivate, channel } = this.state;
    if (isPrivate) return null;
    else
      return (
        <Segment loading={!channel}>
          <Header as="h3" attached="top">
            About #{channel && channel.name}
          </Header>
          <Accordion styled attached="true">
            <Accordion.Title
              active={activeIndex === 0}
              index={0}
              onClick={this.setActiveIndex}
            >
              <Icon name="dropdown" />
              <Icon name="info" />
              Channel Details
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0}>
              {channel && channel.details}
            </Accordion.Content>

            <Accordion.Title
              active={activeIndex === 2}
              index={2}
              onClick={this.setActiveIndex}
            >
              <Icon name="dropdown" />
              <Icon name="pencil alternate" />
              Created by
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 2}>
              <Header as="h3">
                <Image circular src={channel && channel.createdBy.avatar} />
                {channel && channel.createdBy.name}
              </Header>
            </Accordion.Content>
          </Accordion>
        </Segment>
      );
  }
}
