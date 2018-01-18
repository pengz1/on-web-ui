// Copyright 2015, EMC, Inc.

import { EventEmitter } from 'events';

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import radium from 'radium';
import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import AutoComplete from 'material-ui/AutoComplete';
import Raid from 'src-raid-config/Raid';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

@radium
export default class RaidDelete extends Component {
  componentDidMount() {
  }

  componentWillUnmount() {}

  componentWillReceiveProps(nextProps) {}

  render() {
    return (
        <p>delete raid</p>
    );
  }
}
