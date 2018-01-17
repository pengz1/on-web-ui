// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import WorkflowTemplateStore from 'src-common/stores/WorkflowTemplateStore';
import Workflow from 'src-workflow-editor/lib/Workflow';

import {
    AutoComplete,
    Toolbar,
    ToolbarGroup,
    ToolbarTitle,
    IconButton,
    FontIcon
  } from 'material-ui';


export default class ConfigRaidToolbar extends Component {

  workflowTemplateStore = new WorkflowTemplateStore(Workflow);

  load(){
    this.workflowTemplateStore.list()
    .then(()=>{
        let workflows = this.workflowTemplateStore.all();
        let raidConfig = [];
        let reString = ['volume', 'hotpare', 'raid'];
        workflows.forEach(workflow => {
            let name = workflow.injectableName.toLowerCase();
            reString.forEach(string => {
                if (name.indexOf(string) !== -1) {
                    raidConfig.push(workflow.friendlyName);
                    return false;
                }
            });
        });
        this.setState({workflows: raidConfig});
    });
  }

  state = {
    workflows: []
  };

  renderWorkflowSelect(state = this.state) {
    return (
      <AutoComplete key="configRaid"
          style={{width: 236, top: 8, float: 'left'}}
          filter={() => true}
          openOnFocus={true}
          menuStyle={{maxHeight: 250, width: 236, overflow: 'auto'}}
          animated={true}
          hintText="Select Operation"
          dataSource={state.workflows}
          onClick={()=>{this.load()}}
      />
    );
  }

  render() {
    return (
      <div className="ConfigRaidToolbar" style={{float:"left"}}>
        <Toolbar>
            <ToolbarGroup firstChild={true} >
              {this.renderWorkflowSelect()}
              <IconButton key="nextIcon"
                tooltip="Next step for RAID operation"
                style={{float: "left", 'marginLeft': 16}}
                href={"/we"}>
                <FontIcon className={'fa fa-play'} />
              </IconButton>
            </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

}
