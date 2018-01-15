// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { RaisedButton, LinearProgress } from 'material-ui';

import ToolbarRow from 'src-common/views/ToolbarRow';
import ConfigRaidToolbar from './ConfigRaidToolbar';

export default class InstallOS extends Component {

  static contextTypes = {router: PropTypes.any};

  state = {
  };

  render() {
    return (
      <ToolbarRow
          headerContent="ConfigureRaid"
          loadingContent={<LinearProgress mode={this.state.loading ? 'indeterminate' : 'determinate'} value={100} />}
          toolbarContent={<ConfigRaidToolbar />}
      />
    );
  }

}
