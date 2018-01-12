// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import radium from 'radium';

import {
    AutoComplete,
    FontIcon,
    IconButton,
    Popover,
    RaisedButton,
    Toolbar,
    ToolbarGroup,
    ToolbarTitle
  } from 'material-ui';

import ConfirmDialog from 'src-common/views/ConfirmDialog';

import WorkflowEditorIconButton from './WorkflowEditorIconButton';
import RunWorkflow4Poc from './RunWorkflow4Poc';

@radium
export default class WorkflowEditor4Poc extends Component {

  static contextTypes = {
    app: PropTypes.any,
    muiTheme: PropTypes.any,
    router: PropTypes.any,
    workflowEditor: PropTypes.any,
    workflowOperator: PropTypes.any
  };

  static childContextTypes = {
    workflowEditorToolbar: PropTypes.any
  };

  get workflowOperator() {
    return this.context.workflowOperator;
  }

  getTaskDefinition(name) {
    return this.workflowOperator.getTaskDefinition(name);
  }

  getWorkflowTemplate(name) {
    return this.workflowOperator.getWorkflowTemplate(name);
  }

  getTaskDefinitionFromTask(task) {
    return this.getWorkflowTemplate.getTaskDefinitionFromTask(task);
  }

  state = {
    confirmCreateWorkflow: false,
    newWorkflowFriendlyName: '',
    newWorkflowInjectableName: '',
    task: null,
    tasks: this.workflowOperator.taskDefinitionStore.all(),
    taskTerm: '',
    workflow: this.activeWorkflow,
    workflows: this.workflowOperator.workflowTemplateStore.all(),
    workflowTerm: this.activeWorkflow && this.activeWorkflow.friendlyName
  };

  get activeWorkflow() {
    return this.workflowOperator.activeWorkflow;
  }

  getChildContext() {
    return { workflowEditorToolbar: this };
  }

  componentDidMount() {
    this.updateWorkflow = () => {
      this.setState({workflow: this.activeWorkflow});
    };
    this.workflowOperator.onChangeWorkflow(this.updateWorkflow);
    this.unwatchTaskDefinitions =
      this.workflowOperator.taskDefinitionStore.watchAll('tasks', this);
    this.unwatchWorkflowTemplates =
      this.workflowOperator.workflowTemplateStore.watchAll('workflows', this);
  }

  componentWillUnmount() {
    this.workflowOperator.offChangeWorkflow(this.updateWorkflow);
    this.unwatchTaskDefinitions();
    this.unwatchWorkflowTemplates();
  }

  render() {
    let divStyle = {
      height: this.props.height,
      width: '100%',
      float: 'left',
      clear: 'both',
      overflow: 'visible',
      position: 'relative',
      zIndex: 9
    };
    return (
      <div className="WorkflowEditor4Poc" style={divStyle}>
        {this.renderToolbar()}
        {this.renderPopovers()}

        <ConfirmDialog
            open={this.state.confirmCreateWorkflow}
            callback={confirmed => {
              let workflowName = this.state.newWorkflowFriendlyName,
                  workflowId = this.state.newWorkflowInjectableName;
              this.setState({
                confirmCreateWorkflow: false,
                newWorkflowFriendlyName: '',
                newWorkflowInjectableName: ''
              }, () => {
                if (!confirmed) return;
                this.workflowOperator.workflowTemplateStore.create(workflowId, {
                  friendlyName: workflowName,
                  injectableName: workflowId,
                  tasks: [
                    {
                      label: 'no-op',
                      taskName: 'Task.noop'
                    }
                  ]
                }).then((workflow) => {
                  this.context.router.push('/we/' + workflowId);
                  // HACK: force UI to update and render new workflow.
                  setTimeout(() => window.location.reload(), 250);
                });
              });
            }}>
          Create new Workflow? "{this.state.newWorkflowInjectableName}"?'
        </ConfirmDialog>
      </div>
    );
  }

  renderToolbar() {
    return (
      <Toolbar>
        <ToolbarGroup firstChild={true} lastChild={true}>
          <ToolbarTitle text="&nbsp;" />
          <ToolbarTitle text="Advanced OS Workflow:" />
          <WorkflowEditorIconButton key="run"
              muiTheme={this.context.muiTheme}
              tooltip="Run Workflow"
              icon="play"
              lastChild={true}
              onClick={(e) => this.setState({
                runPopoverAnchor: this.state.runPopoverAnchor === e.currentTarget ? null : e.currentTarget
              })} />
        </ToolbarGroup>
      </Toolbar>
    );
  }



  renderPopovers() {
    let closeTaskPopover = () => this.setState({taskPopoverAnchor: null}),
        closeRunPopover = () => this.setState({runPopoverAnchor: null}),
        closeRunningPopover = () => this.setState({runningPopoverAnchor: null}),
        emcTheme = this.context.muiTheme,
        task = this.workflowOperator.state.task,
        workflow = this.workflowOperator.state.workflow,
        containerStyle = {
          padding: 20,
          maxHeight: window.innerHeight - 200,
          overflow: 'auto',
          border: '1px solid ' + emcTheme.rawTheme.palette.textColor
        };

    return [
      <Popover key="runWorkflow"
          style={{width: 600}}
          animated={true}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          open={this.state.runPopoverAnchor ? true : false}
          anchorEl={this.state.runPopoverAnchor}
          onRequestClose={closeRunPopover} >
        <div style={containerStyle}>
          <RunWorkflow4Poc
              name={workflow && workflow.injectableName}
              options={workflow && workflow.options && workflow.options.defaults}
              onDone={(err) => {
                console.error(err);
                closeRunPopover();
              }} />
        </div>
      </Popover>
    ];
  }

}
