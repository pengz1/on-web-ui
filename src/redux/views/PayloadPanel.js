import React, { Component } from 'react';
import Payload from './Payload.js';

const style = {
  margin: '20px'
};

class PayloadPanel extends Component {
  render() {
    return (
      <div style={style}>
        <Payload payload={this.props.payload} updateSettings={this.props.updateSettings} />
        <hr/>
      </div>
    );
  }
}

export default PayloadPanel;

