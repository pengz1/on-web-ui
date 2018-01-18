import React, { Component, PropTypes } from 'react';
import {
    AutoComplete,
    FontIcon,
    IconButton,
    Popover,
    Toolbar,
    ToolbarGroup,
    ToolbarTitle,
    ToolbarSeparator,
    LinearProgress,

    SelectField,
    MenuItem,
    RaisedButton,
    TextField,
    Toggle
  } from 'material-ui';


import store from '../Store.js';
import * as Actions from '../Actions.js';
import JsonEditor from 'src-common/views/JsonEditor';
import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';

class Payload extends Component {

  render() {
    console.log("[DEBUG] enter the Payload's render method, props here:", this.props);
    const {payload, onIncrement, updateStateFromJsonEditor, runWorkflow} = this.props;
    return (
      <div>
         <div style={{textAlign: 'left', marginTop: 20}}>
           <RaisedButton secondary={true} label="Save Payload" onClick={onIncrement}/>
         </div>

		<LinearProgress mode={'determinate'} value={100} />
		<LinearProgress mode={'determinate'} value={100} />

        <div style={{padding: '0 10px 10px'}}>
          <h5 style={{margin: '15px 0 5px', color: '#666'}}>Workflow JSON:</h5>
          <JsonEditor
              value={payload}
              updateParentState={updateStateFromJsonEditor}
              ref="jsonEditor" />
        </div>

        <div>
            <RaisedButton
                label="Run"
                primary={true}
                onClick={runWorkflow}
                 />
        </div>

      </div>
    );
  }
}

Payload.propTypes = {
  payload: PropTypes.any.isRequired,
  onIncrement: PropTypes.func.isRequired,
  updateStateFromJsonEditor: PropTypes.func.isRequired
};

/*
 * props:
 * payload: {"options": xxx}
 */
class PayloadContainer extends Component {
  constructor(props) {
    super(props);
    console.log("[DEBUG] enter PayloadContainer, props:", props); // props.payload = {"options":xxxx}

    this.onIncrement = this.onIncrement.bind(this);
    this.updateStateFromJsonEditor= this.updateStateFromJsonEditor.bind(this);
    this.runWorkflow= this.runWorkflow.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getOwnState = this.getOwnState.bind(this);

    this.state = this.getOwnState();
  }

  // return value suppose:    payload: {"options": xxxx}"
  getOwnState() {
    console.log("[DEBUG] enter payloadContainer, getOwnState:", store.getState());
    return {
      "payload": store.getState()
    };
  }

  onIncrement() {
    console.log("[DEBUG] enter the onIncrement method,payload: ", this.props.payload);
    this.props.updateSettings();
    store.dispatch(Actions.update(this.props.payload));
  }

  updateStateFromJsonEditor(stateChange) {
    console.log("[DEBUG] enter the updateStateFromJsonEditor method, state:", stateChange);
    store.dispatch(Actions.update(stateChange));
    console.log("[DEBUG] after updateStateFromJsonEditor, state is:", this.state);
  }

    runWorkflow() {
        let localState= this.state["payload"];
        let nodeId = localState["nodeId"];
        let workflowName = localState["workflowName"];
        let localPayload = {"options": localState["options"]};
        console.log("[DEBUG] runWorkflow, nodeId:", nodeId, ", workflowName:", workflowName,
            ", localPayload:", localPayload);
        RackHDRestAPIv2_0.api.nodesPostWorkflowById({
            body: localPayload,
            identifier: nodeId,
            name: workflowName
        }).then(res => {
          let workflow = res.obj;
          console.log("[DEBUG]##### response:", workflow);
        }).catch((err) => {
          console.error("[ERROR]:####", err);
        });

  }



  // state is : "options": {"options": xxxx}
  onChange() {
    console.log("[DEBUG] enter the onChange method.");
    this.setState(this.getOwnState());
    console.log("[DEBUG] the onChange state is:", this.state);
  }

//  shouldComponentUpdate(nextProps, nextState) {
//    return (nextProps.caption !== this.props.caption) ||
//      (nextState.value !== this.state.value);
//  }

  componentDidMount() {
    console.log("[DEBUG] enter the componentDidMount method.");
    store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    console.log("[DEBUG] enter the componentWillMount method.");
    store.unsubscribe(this.onChange);
  }

  render() {
    console.log("[DEBUG] enter the PayloadContainer's render method, the props:", this.props);
    console.log("[DEBUG] enter the PayloadContainer's render method, the state:", this.state);
    return (
        <Payload payload={this.state.payload}
      onIncrement={this.onIncrement}
      updateStateFromJsonEditor={this.updateStateFromJsonEditor}
      runWorkflow={this.runWorkflow}
      />
    );
  }
}

PayloadContainer.propTypes = {
  //caption: PropTypes.string.isRequired
};

export default PayloadContainer;

