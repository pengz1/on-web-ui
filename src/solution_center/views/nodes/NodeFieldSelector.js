// Copyright 2017, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import Workflow from 'src-workflow-editor/lib/Workflow';

import {
    MenuItem,
    SelectField
  } from 'material-ui';


export default class NodeGridToolbar extends Component {

  static propTypes = {
    nodes: PropTypes.any,
    field: PropTypes.any,
    setField: PropTypes.any //Krein: Update parent node
  }

  state = {
    fieldValues: [],
    selected:null
  };

  listValueSetByAttr = () => {
    //Krein: Only captured by click on the area of text
    let nameList = this.props.field.split('.');
    let list = [];
    let nodes = this.props.nodes || [];
    nodes.forEach(node => {
        let curr = node;
        nameList.forEach(key => {
            curr = curr && curr[key];
        });
        if ( curr && list.indexOf(curr) === -1) {
            list.push(curr);
        }
    });
    this.setState({fieldValues: list.sort()});
  }

  handleChange = (event, index, values) => {
    this.setState({selected: values});
  };

  menuItems = (items) => {
    //items = items.sort();
    return items.map((value, key) => {
      return (
        <MenuItem key={value}
          insetChildren={true}
          checked={this.state.selected && this.state.selected.indexOf(value) > -1}
          value={value}
          primaryText={value}
        />
      )
    });
  }

  updateSelField = () => {
    //Krein: To minimize item selection changes,
    //setField is triggered only after dropDownMenu is closed.
    //if (this.state.selected && this.state.selected.length !== 0) {
    if (this.state.selected) {
      this.props.setField(this.props.field, this.state.selected);
    }
  }

  render() {
    let name = this.props.field;
    let shortName = name.split('.').pop().toLowerCase();
    return (
        <SelectField key={name}
          multiple={true}
          hintText={"Select Node " + shortName}
          value={this.state.selected}
          onChange={this.handleChange}
          dropDownMenuProps={{onClose: this.updateSelField}}
          onClick={(e) => {
            this.listValueSetByAttr(); //Krein: render only after click;
          }}
          >
          {this.menuItems(this.state.fieldValues)}
        </SelectField>
    );
  }
}
