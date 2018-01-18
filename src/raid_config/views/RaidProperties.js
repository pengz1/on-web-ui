// Copyright 2015, EMC, Inc.

import { EventEmitter } from 'events';
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import radium from 'radium';
import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import AutoComplete from 'material-ui/AutoComplete';
import Raid from 'src-raid-config/Raid';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

@radium
export default class RaidProperties extends Component {
  constructor(props) {
    super(props);
    this.handleChangeNodeId = this.handleChangeNodeId.bind(this);
    this.freshCatalog = this.freshCatalog.bind(this);
  }
  state = {
    nodeIdList: [],
    nodeId: '',
    tableData: [],
    hasCatalog: false
  }

  componentDidMount() {
    Raid.getNodeIdList().then((nodes) =>{
        this.setState({nodeIdList: nodes});
    });
    Raid.judgeHasCatalog().then((hasCatalog) => {
        this.setState({hasCatalog: hasCatalog});
    });
  }

  componentWillUnmount() {}

  componentWillReceiveProps(nextProps) {}

  handleChangeNodeId(value){
    this.setState({nodeId: value});
    Raid.getRaidList(this.state.nodeId)
        .then((data) => {
            this.setState({tableData: data});
        }).catch((error) => {
            console.log('Error happens ' + JSON.stringify(error));
        });
  }
  freshCatalog(event){
    event.preventDefault();
    alert(this.state.nodeId);
    if(this.state.nodeId !== ''){
        Raid.freshMegaraidCatalog(this.state.nodeId);
    }
  }

  tableState = {
    fixedHeader: true,
    fixedFooter: true,
    stripedRows: true,
    showRowHover: false,
    selectable: false,
    multiSelectable: true,
    enableSelectAll: true,
    deselectOnClickaway: false,
    showCheckboxes: false,
    height: '300px',
  };

  render() {
    const hasCatalog = this.state.hasCatalog;
    return(
        <div>
            <div>
                <AutoComplete floatingLabelText="NodeId" filter={AutoComplete.noFilter} openOnFocus={true} dataSource={this.state.nodeIdList} style={this.btnStyle} onNewRequest={this.handleChangeNodeId}/>
                {hasCatalog ? (
                    <div>
                        <Table height={this.tableState.height}
                            fixedHeader={this.tableState.fixedHeader}
                            fixedFooter={this.tableState.fixedFooter}
                            selectable={this.tableState.selectable}
                            multiSelectable={this.tableState.multiSelectable}>
                            <TableHeader displaySelectAll={this.tableState.showCheckboxes} adjustForCheckbox={this.tableState.showCheckboxes} enableSelectAll={this.tableState.enableSelectAll}>
                                <TableRow>
                                    <TableHeaderColumn colSpan="6" tooltip="Virtual Disks" style={{textAlign: 'center'}}>
                                        <h2>Virtual Disks</h2>
                                    </TableHeaderColumn>
                                </TableRow>
                                <TableRow>
                                    <TableHeaderColumn tooltip="ID">ID</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Type">Type</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="State">State</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Size">Size</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="MediaType">MediaType</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Strip Size">Strip Size</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Write Policy">Write Policy</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Disks ID">Drives</TableHeaderColumn>
                                </TableRow>
                            </TableHeader>
                            <TableBody displayRowCheckbox={this.tableState.showCheckboxes} deselectOnClickaway={this.tableState.deselectOnClickaway} showRowHover={this.tableState.showRowHover} stripedRows={this.tableState.stripedRows}>
                                {this.state.tableData.map( (row, index) => (
                                    <TableRow key={index}>
                                        <TableRowColumn>{index}</TableRowColumn>
                                        <TableRowColumn>{row.type}</TableRowColumn>
                                        <TableRowColumn>{row.state}</TableRowColumn>
                                        <TableRowColumn>{row.size}</TableRowColumn>
                                        <TableRowColumn>{row.mediaType}</TableRowColumn>
                                        <TableRowColumn>{row.stripSize}</TableRowColumn>
                                        <TableRowColumn>{row.writePolicy}</TableRowColumn>
                                        <TableRowColumn>{row.drives}</TableRowColumn>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ):(
                    <h4>After nodeId is selected, the megaraid catalog graph needs to be triggered.&nbsp;
                        <a href='#' onClick={this.freshCatalog}>click me</a>
                    </h4>
                )}
            </div>
        </div>
    );
  }
}
