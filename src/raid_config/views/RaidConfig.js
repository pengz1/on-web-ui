// Copyright 2015, EMC, Inc.

import { EventEmitter } from 'events';

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import radium from 'radium';

import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import ResourceTable from 'src-common/views/ResourceTable';
import ConfirmDialog from 'src-common/views/ConfirmDialog';
import SkusGrid from 'src-management-console/views/skus/SkusGrid';

import {Tabs, Tab} from 'material-ui/Tabs';
import RaidCreate from 'src-raid-config/views/RaidCreate'
import RaidDelete from 'src-raid-config/views/RaidDelete'
import RaidProperties from 'src-raid-config/views/RaidProperties'
import RaidHotspare from 'src-raid-config/views/RaidHotspare'

@radium
export default class RaidConfig extends Component {

  static defaultProps = {
    css: {},
    params: null,
    style: {}
  };

  static contextTypes = {
    parentSplit: PropTypes.any
  };

  static childContextTypes = {
    skuPacks: PropTypes.any
  };

  getChildContext() {
    return {
      skuPacks: this
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps(nextProps) {}

  state = {
    cleanupSkus: [],
    newSku: {}
  };

  styles = {
    headline: {
      fontSize: 24,
      paddingTop: 16,
      fontWeight: 400,
      margin: 12
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      value: 'a',
    };
  }

  handleChange = (value) => {
    this.setState({
      value: value,
    });
  };

  render() {
    return (
        <Tabs value={this.state.value} onChange={this.handleChange}>
            <Tab label="Properties" value="a">
                <div>
                    <h2 style={this.styles.headline}>RAID Properties</h2>
                    <RaidProperties/>
                </div>
            </Tab>
            <Tab label="Create" value="b">
                <div>
                    <h2 style={this.styles.headline}>RAID Create</h2>
                    <RaidCreate />
                </div>
            </Tab>
            <Tab label="Delete" value="c">
                <div>
                    <h2 style={this.styles.headline}>RAID Delete</h2>
                    <RaidDelete/>
                </div>
            </Tab>
            <Tab label="Hotspare" value="d">
                <div>
                    <h2 style={this.styles.headline}>Add Hotspare</h2>
                    <RaidHotspare/>
                </div>
            </Tab>
        </Tabs>
    );
  }

}
