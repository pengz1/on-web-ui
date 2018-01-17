// Copyright 2015, EMC, Inc.

import { EventEmitter } from 'events';

import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';
import radium from 'radium';

import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import { FileReceiver, FileStatus } from 'src-common/views/file_uploader';
import ConfirmDialog from 'src-common/views/ConfirmDialog';

import NodesGrid from './nodes/NodeGrid';
import InstallOS from './installOS/InstallOS';
import ConfigRaid from './configRaid/ConfigRaid';
import Discovery from './discovery/Discovery';
import Poc from './bmcConfig/views/Poc';


@radium
export default class SolutionCenter extends Component {

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

  //componentDidMount() {}
  //componentWillUnmount() {}
  //componentWillReceiveProps(nextProps) {}

  state = {
    cleanupSkus: [],
    newSku: {}
  };

  css = {
    root: {
      position: 'relative',
      overflow: 'auto', //hidden
      transition: 'width 1s'
    }
  };

  render() {
    let { props, state } = this;

    let contentSplit = this.context.parentSplit,
        contentWidth = contentSplit.width,
        contentHeight = contentSplit.height * contentSplit.splitB;

    let css = {
      root: [
        this.css.root,
        props.css.root,
        { width: contentWidth, height: contentHeight },
        this.props.style
      ]
    };

    return (
      <div className='SolutionCenter'>
        <Poc />
        <InstallOS />
        <ConfigRaid />
        <NodesGrid />
      </div>
    );
  }

}

SolutionCenter.routes = (
    <Route name="Solution Center" path="/so" component={SolutionCenter}>
    </Route>
)
