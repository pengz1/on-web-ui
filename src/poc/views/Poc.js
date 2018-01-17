// Copyright 2015, EMC, Inc.

import { EventEmitter } from 'events';

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import radium from 'radium';
import { Link } from 'react-router';

import SplitView from 'src-common/views/SplitView';
import { Toolbar } from 'material-ui/Toolbar';
import { ToolbarTitle } from 'material-ui/Toolbar';
import { ToolbarGroup } from 'material-ui/Toolbar/ToolbarGroup';
import { RaisedButton } from 'material-ui/RaisedButton';
import BmcIps from './BmcIps';

@radium
export default class Poc extends Component {

  static propTypes = {
    className: PropTypes.string,
    css: PropTypes.object,
    params: PropTypes.object,
    style: PropTypes.object
  };

  static defaultProps = {
    className: '',
    css: {},
    params: null,
    style: {}
  };

  static contextTypes = {
    // app: PropTypes.any,
    parentSplit: PropTypes.any
  };

  state = {
    split: 0.6
  };

  css = {
    root: {
      position: 'relative',
      overflow: 'hidden',
      transition: 'width 1s'
    }
  };

  render() {
    let { props, state } = this;

    let contentSplit = this.context.parentSplit,//.app.refs.contentSplit,
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

    let toolbarHeight = 56,
        overlay = [];

    return (
      <div className="Poc">
        <BmcIps />
      </div>
    );
  }

}
