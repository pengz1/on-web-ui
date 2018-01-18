// Copyright 2015, EMC, Inc.

import { EventEmitter } from 'events';
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import radium from 'radium';
import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import AutoComplete from 'material-ui/AutoComplete';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import NodeStore from 'src-common/stores/NodeStore';
import Utils from 'src-common/utils/Utils';
import Raid from 'src-raid-config/Raid';

@radium
export default class RaidCreate extends Component {
  constructor(props) {
    super(props);
    this.handleChangeNodeId = this.handleChangeNodeId.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeRaidType = this.handleChangeRaidType.bind(this);
    this.handleTableSelect = this.handleTableSelect.bind(this);
  }

  state = {
    nodeIdList: [],
    nodeId: '',
    raidTypeList: ['raid0', 'raid1', 'raid5','raid6','raid10'],
    raidType: '',
    tableData: [],
    selectedRows: []
  }

  componentDidMount() {
    Raid.getNodeIdList().then((nodes) =>{
        this.setState({nodeIdList: nodes});
    });
  }

  componentWillUnmount() {}

  componentWillReceiveProps(nextProps) {}

  getDiskList(nodeId){
    var disks = [];
    return RackHDRestAPIv2_0.api.nodesGetCatalogSourceById({
        identifier: nodeId,
        source: 'megaraid-controllers'}).then((data)=>{
            var diskObj = data.obj.data['Controllers'][0]['Response Data']['PD LIST'];
            for(var i = 0; i< diskObj.length; i++){
                disks.push({
                    'enclosureId': diskObj[i]['EID:Slt'],
                    'diskId': diskObj[i].DID,
                    'mediaType': diskObj[i].Med,
                    'State': diskObj[i].State,
                    'Size': diskObj[i].Size
                });
            }
            return disks;
        }).then((disks) =>{
            this.setState({tableData: disks});
        }).catch((errors) =>{
            this.setState({tableData: []});
            console.log('Error happens in getDiskList: ' + JSON.stringify(errors));
        });
  }
  handleSubmit(event){
    event.preventDefault();
    Utils.isDellSystem(this.state.nodeId)
        .then((isDell) => {
            var rows = this.state.selectedRows, drives = [];
            for(var i = 0; i < rows.length; i++){
                drives.push(parseInt(this.state.tableData[rows[i]].enclosureId.split(':')[1]));
            }
            var body = {
                'name': '',
                'options': {
                    'bootstrap-ubuntu': {
                        'overlayfsFile': ''
                    },
                    'config-raid': {
                        'ssdStoragePoolArr':[],
                        'ssdCacheCadeArr':[],
                        'controller': 0,
                        'path': '',
                        'hddArr': [{
                            'enclosure': parseInt(this.state.tableData[rows[0]].enclosureId),
                            'type': this.state.raidType,
                            'drives': '['+ drives + ']'
                        }]
                    }
                }
            }
            if(isDell){
                console.log('The node ' + this.state.nodeId + ' is Dell system.');
            }else{
                console.log('The node ' + this.state.nodeId + ' is not Dell system.');
                body.name = 'Graph.Bootstrap.Megaraid.Configure';
                body.options['bootstrap-ubuntu']['overlayfsFile'] = 'raid.overlay.cpio.gz';
                body.options['config-raid'].path = '/opt/MegaRAID/storcli/storcli64';
            }
            return Utils.getControllerId(this.state.nodeId)
                .then((controllerId) => {
                    body.options['config-raid']['controller'] = controllerId;
                }).then(() =>{
                    RackHDRestAPIv2_0.api.nodesPostWorkflowById({
                        identifier: this.state.nodeId,
                        body: body
                    }).catch((error) => {
                        console.log('Error happens : ' + JSON.stringify(error));
                    });
                })
        });
    }

  handleChangeNodeId(value){
    this.setState({nodeId: value});
    this.getDiskList(value);
  }

  handleChangeRaidType(value){
    this.setState({raidType: value});
  }

  handleTableSelect(rows){
    var result = rows.slice(0);
    if (result == 'none') {
        result = [];
    }
    this.setState({selectedRows: result});
  }

  //for table
  tableStyles = {
    propContainer: {
        width: 200,
        overflow: 'hidden',
        margin: '20px auto 0',
      },
    propToggleHeader: {
        margin: '20px auto 10px',
      },
  };

  tableState = {
    fixedHeader: true,
    fixedFooter: true,
    stripedRows: false,
    showRowHover: false,
    selectable: true,
    multiSelectable: true,
    enableSelectAll: true,
    deselectOnClickaway: false,
    showCheckboxes: true
  };

  btnStyle = {
    margin: 12,
  };

  render() {
      return (
        <div>
            <form onSubmit={this.handleSubmit}>
                <AutoComplete floatingLabelText="NodeId" filter={AutoComplete.noFilter} openOnFocus={true} dataSource={this.state.nodeIdList} style={this.btnStyle} onNewRequest={this.handleChangeNodeId}/>
                <br/>
                <AutoComplete floatingLabelText="RaidType" filter={AutoComplete.noFilter} openOnFocus={true} dataSource={this.state.raidTypeList} style={this.btnStyle} onNewRequest={this.handleChangeRaidType}/>
                <div>
                    <Table
                        fixedHeader={this.tableState.fixedHeader}
                        fixedFooter={this.tableState.fixedFooter}
                        selectable={this.tableState.selectable}
                        multiSelectable={this.tableState.multiSelectable}
                        onRowSelection={this.handleTableSelect}>
                        <TableHeader displaySelectAll={this.tableState.showCheckboxes} adjustForCheckbox={this.tableState.showCheckboxes} enableSelectAll={this.tableState.enableSelectAll}>
                            <TableRow>
                                <TableHeaderColumn colSpan="6" tooltip="Internal Disks" style={{textAlign: 'center'}}>
                                    <h2>Internal Disks</h2>
                                </TableHeaderColumn>
                            </TableRow>
                            <TableRow>
                                <TableHeaderColumn tooltip="ID">ID</TableHeaderColumn>
                                <TableHeaderColumn tooltip="The EnclosureId:SlotId">enclosureId:slotId</TableHeaderColumn>
                                <TableHeaderColumn tooltip="The DiskId">DiskId</TableHeaderColumn>
                                <TableHeaderColumn tooltip="The MediaType">MediaType</TableHeaderColumn>
                                <TableHeaderColumn tooltip="The State">State</TableHeaderColumn>
                                <TableHeaderColumn tooltip="The Size">Size</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={this.tableState.showCheckboxes} deselectOnClickaway={this.tableState.deselectOnClickaway} showRowHover={this.tableState.showRowHover} stripedRows={this.tableState.stripedRows}>
                            {this.state.tableData.map( (row, index) => (
                                <TableRow key={index} selected={this.state.selectedRows.indexOf(index) !== -1}>
                                    <TableRowColumn>{index}</TableRowColumn>
                                    <TableRowColumn>{row.enclosureId}</TableRowColumn>
                                    <TableRowColumn>{row.diskId}</TableRowColumn>
                                    <TableRowColumn>{row.mediaType}</TableRowColumn>
                                    <TableRowColumn>{row.State}</TableRowColumn>
                                    <TableRowColumn>{row.Size}</TableRowColumn>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <RaisedButton label="Create" primary={true} style={this.btnStyle} type='submit'/>
                </div>
            </form>
        </div>
    );
  }

}
