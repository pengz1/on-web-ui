// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import { LinearProgress } from 'material-ui';
import ToolbarRow from 'src-common/views/ToolbarRow';

export default class InstallOS extends Component {

  static contextTypes = {router: PropTypes.any};
  
  state = {
  };

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <ToolbarRow
          headerContent="Discovery"
          loadingContent={<LinearProgress mode={this.state.loading ? 'indeterminate' : 'determinate'} value={100} />}
      />
    );
  }

}
