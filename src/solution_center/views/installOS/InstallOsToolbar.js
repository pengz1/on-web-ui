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


export default class InstallOSToolbar extends Component {

  workflowTemplateStore = new WorkflowTemplateStore(Workflow);

  load(){
    this.workflowTemplateStore.list()
    .then(()=>{
        let workflows = this.workflowTemplateStore.all();
        let installOs = [];
        workflows.forEach(workflow => {
            if (workflow.injectableName.startsWith('Graph.Install')) {
                installOs.push(workflow.friendlyName);
            }
        });
        this.setState({workflows: installOs});
    })
  }

  state = {
    workflows: []
  };

  renderWorkflowSelect(state = this.state) {
    return (
      <AutoComplete key="installOs"
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
      <div className="InstallOSToolbar" style={{float:"left"}}>
        <Toolbar>
            <ToolbarGroup firstChild={true} >
              {this.renderWorkflowSelect()}
              <IconButton key="nextIcon"
                tooltip="Next step to install OS"
                style={{float: "left", 'marginLeft': 16}}
                href={"/#/so/installOs/ESXi"}>
                <FontIcon className={'fa fa-play'} />
              </IconButton>
            </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

}
