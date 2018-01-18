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

@radium
export default class RaidHotspare extends Component {

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

  render() {
    return (
        <h1>add hostspare</h1>
    );
  }

}
