// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import {
    IconButton,
    FontIcon,
    Popover
  } from 'material-ui';

import ResourceTable from 'src-common/views/ResourceTable';
import DataTable from 'src-common/views/DataTable';

export default class NodesPopover extends Component {

  static contextTypes = {
      muiTheme: PropTypes.any //Krein: How this is delivered?
  };

  static propTypes = {
    data: PropTypes.any,
    nodeId: PropTypes.any
  }

  state = {
      runPopoverAnchor: null
  };

  renderPopover(){ //Krein: When not used as a class, it will display last component.
    let id = this.props.nodeId;
    let popInfo = this.props.data;
    let closeRunPopover = () => this.setState({runPopoverAnchor: null}),
        emcTheme = this.context.muiTheme,
        containerStyle = {
          padding: 20,
          maxHeight: window.innerHeight - 200,
          maxWidth: window.innerWidth*0.5,
          overflow: 'auto',
          border: '1px solid ' + emcTheme.rawTheme.palette.textColor
        };
    if (!this.state.runPopoverAnchor) {
        return;
    }
    return (
      <Popover key={id + ".nodesDetails"}
        style={{width: 600}}
        animated={true}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        open={this.state.runPopoverAnchor ? true : false}
        anchorEl={this.state.runPopoverAnchor}
        onRequestClose={closeRunPopover} >
        <div style={containerStyle}>
          <DataTable
            ref="table"
            style={{width: '100%'}}
            initialData = {[popInfo]}
            emptyContent = "No Contents"
            uniqueName={'NodesExpandGrid.' + id}
            onDone={(err) => {
                console.error(err);
                closeRunPopover();
            }} />
        </div>
      </Popover>
    )
  }

  render() {
    return (
      <IconButton key="nextIcon"
        tooltip="More node information..."
        style={{float: "left", 'marginLeft': 16}}
        onClick={(e) => this.setState({
            runPopoverAnchor: this.state.runPopoverAnchor === e.currentTarget ? null : e.currentTarget
        })}>
        {this.renderPopover()}
        <FontIcon className={'fa fa-angle-double-down'} />
      </IconButton>
    );
  }
}
