// Copyright 2017, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import Workflow from 'src-workflow-editor/lib/Workflow';

import {
    AutoComplete,
    Toolbar,
    ToolbarGroup,
    ToolbarTitle,
    IconButton,
    FontIcon,
    RaisedButton,
    SelectField
  } from 'material-ui';

import NodeFieldSelector from './NodeFieldSelector'

export default class NodeGridToolbar extends Component {

  static propTypes = {
    nodes: PropTypes.any,
    updateFilters: PropTypes.any,
    refresh: PropTypes.any
  }

  setField = (field, values) => {
    this.props.updateFilters({[field]: values});
  };

  renderFieldItems = (fields) => {
    return fields.map((field) => (
      <NodeFieldSelector key={field}
        nodes={this.props.nodes}
        field={field}
        setField={this.setField}
      />
    ));
  }

  render() {
    let fields=['type', 'dmi.data.System Information.Manufacturer']
    return (
      <div className="NodeGridToolbar" style={{float:"left"}}>
        <Toolbar>
            <ToolbarGroup firstChild={true} >
              {this.renderFieldItems(fields)}
              <RaisedButton
                label="Refresh"
                primary={true}
                disableTouchRipple={false}
                onClick={()=>{
                  this.props.refresh();
                }} />
            </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

}
