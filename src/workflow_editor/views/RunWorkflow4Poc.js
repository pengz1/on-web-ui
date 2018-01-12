// Copyright 2015, EMC, Inc.

import React, { Component } from 'react';

import EditWorkflow4Poc from 'src-management-console/views/workflows/EditWorkflow4Poc';

export default class RunWorkflow4Poc extends Component {

  render() {
    return <EditWorkflow4Poc
      title="Run Workflow"
      workflow={{name: this.props.name, node: '', options: this.props.options}}
      onDone={this.props.onDone} />;
  }

}
