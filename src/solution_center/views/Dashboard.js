// Copyright 2015, EMC, Inc.

import React, { Component } from 'react';

import NodesGrid from './nodes/NodesGrid';
import WorkflowsGrid from './workflows/WorkflowsGrid';

import WorkflowStore from 'src-common/stores/WorkflowStore';

export default class Dashboard extends Component {

  render() {
    return (
      <div className="Dashboard">
        <NodesGrid />
      </div>
    );
  }

}
