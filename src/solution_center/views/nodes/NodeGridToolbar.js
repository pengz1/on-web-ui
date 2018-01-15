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
    updateFilters: PropTypes.any
  }

  state = {
    //filteredNodes: [],
    filters: {}, //Krein should put into state or just global parameters?,
    value: null
  };

  setField = (field, values) => {
    this.props.updateFilters({[field]: values});
  };

  componentDidUpdate () {}

  filterNodes = (typeText, name) => {
    let currentNodes = this.props.nodes;
    let filters = this.state.filters;
    filters[name] = typeText;
    Object.keys(filters).forEach(key => {
        let filter = filters[key];
        let nameList = key.split('.');
        let newNodes = [];
        if (filter === "all"){
            newNodes = currentNodes;
        } else {
            currentNodes.forEach(node => {
                let curr = node;
                nameList.forEach(key => {
                    curr = curr && curr[key];
                });
                if ( curr === filter) {
                    newNodes.push(node);
                }
            });
        }
        currentNodes = newNodes;
    });
    this.props.filter(currentNodes);
  }

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
              <RaisedButton label="Refresh" primary={true} onClick={()=>{}} />
            </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

}
