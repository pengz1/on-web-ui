import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Processor from '../lib/Processor';

const styles = {
  radioButton: {
    marginTop: 16,
  },
};

export default class AddBmcIp extends React.Component {

    constructor(props) {
        super(props);
        this.processor = new Processor();
        this._handleTextFieldChange = this._handleTextFieldChange.bind(this);
    }

    state = {
      open: false,
    };

    handleOpen = () => {
      this.setState({open: true});
    };

    handleClose = () => {
      this.setState({open: false});
    };

    createBmcIp = () => {
        let {bmcIp, username, password} = this.state;
        return this.processor.isBmc(username, password, bmcIp).then((data) => {
            if (data !== 'valid') {
                this.setState({errormsg: 'INVALID BMC'});
                return Promise.reject('pop');
            }
        }).then(() => {
            return this.processor.createBmcIp(bmcIp, username, password).then((data) => {
                this.props.update();
            });
        }).then(() => {
            let tmp = {};
            tmp[bmcIp] = {};
            return this.processor.getBmcNodeList(tmp);
        }).then((res) => {
            let obj = res[bmcIp];
            if (obj && (obj.nodeId === null || obj.mac === null || obj.status === 'Discovered')) {
                return Promise.reject();
            }
        }).then(() => {
            this.setState({open: false});
            return this.processor.triggerDiscovery(username, password, bmcIp);
        }).catch(err => {
            if (err !== 'pop') {
                this.setState({open: false});
            }
            console.log(err);
        });
    }

    _handleTextFieldChange(e) {
        e.persist();
        this.setState({errormsg: null});
        this.setState((state) => state[e.target.name] = e.target.value);
    }

  render() {

    const actions = [
      <RaisedButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <RaisedButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.createBmcIp}
      />,
    ];

    return (
      <div>
        <RaisedButton label="Add Bmc IP" primary={true} onClick={this.handleOpen} />
        <Dialog
          title="Add Bmc IP"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
            <div>
              <TextField
                hintText='BMC IP'
                floatingLabelText='BMC IP'
                fullWidth={true}
                errorText={this.state.errormsg}
                name='bmcIp'
                onChange={this._handleTextFieldChange}
              />
              <TextField
                hintText='Username'
                floatingLabelText='Username'
                fullWidth={true}
                name='username'
                onChange={this._handleTextFieldChange}
              />
              <TextField
                hintText='Password'
                floatingLabelText='Password'
                fullWidth={true}
                name='password'
                type="password"
                onChange={this._handleTextFieldChange}
              />
            </div>
        </Dialog>
      </div>
    );

  }
}
