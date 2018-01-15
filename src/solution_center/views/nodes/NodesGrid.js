// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import {
    RaisedButton,
    LinearProgress,
    IconButton,
    FontIcon,
    Popover,
    Table,
    TableHeader,
    TableRow,
    TableHeaderColumn,
    TableBody,
    TableRowColumn
  } from 'material-ui';

import FormatHelpers from 'src-common/lib/FormatHelpers';
import ResourceTable from 'src-common/views/ResourceTable';
import DataTable from 'src-common/views/DataTable';
import NodeStore from 'src-common/stores/NodeStore';
import WorkflowStore from 'src-common/stores/WorkflowStore';
import CatalogStore from 'src-common/stores/CatalogStore';
import PollerStore from 'src-common/stores/PollerStore';
import NodeGridToolbar from './NodeGridToolbar';
import NodePopover from './NodePopover';

export default class NodeGrid extends Component {

  static contextTypes = {
      router: PropTypes.any, //Krein: rourter is default delivered to all children?
      muiTheme: PropTypes.any //How this is delivered?
  };

  nodes = new NodeStore();
  catalogs = new CatalogStore();
  workflow = new WorkflowStore();
  pollers = new PollerStore();

  static naStr = "NA";

  state = {
    nodes: null,
    catalogs: null,
    loading: true,
    nodeFilters: {},
    power: {}
  };

  componentWillMount() {
    this.nodes.startMessenger();
    this.catalogs.startMessenger();
  }

  componentDidMount() {
    this.unwatchNodes = this.nodes.watchAll('nodes', this);
    this.unwatchCatalogs = this.catalogs.watchAll('catalogs', this);
    this.listNodes();
  }

  componentWillUnmount() {
    this.nodes.stopMessenger();
    this.catalogs.stopMessenger();
    this.unwatchNodes();
  }

  renderGraphLink = (graph) => {
    let graphName = graph && graph.name;
    if (graphName){
        return (<Link to={'/oc/' + graph.instanceId}>{graphName}</Link>);
    }
    return NodeGrid.naStr;
  }

  updateNodeFilters = (newList) => {
    let arrayCompare = (arr1, arr2) => {
      //arr1 = arr1.sort();
      //arr2 = arr2.sort();
      if(arr1.length !== arr2.length) return false;
      for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i]) return false;
      }
      return true;
    };
    let shouldUpdateFilters = false;
    Object.keys(newList).forEach((key) => {
      let newValue=newList[key];
      let oldValue=this.state.nodeFilters[key];
      if (!oldValue || !arrayCompare(newValue, oldValue)) {
        shouldUpdateFilters = true;
        return false;
      }
    })
    if (shouldUpdateFilters) {
      let nodeFilters = Object.assign(this.state.nodeFilters, newList)
      this.setState({nodeFilters});
    }
  }

  dictRetrieve = (dict, path) => {
      let curr = dict;
      path.split('.').forEach(key => {
          curr = curr && curr[key];
      });
      return curr;
  }

  listNodes() {
    this.setState({loading: true});
    this.nodes.list()
    .then(() => {
      let promises = [];
      let sourceList = ['dmi', 'bmc'];
      this.nodes.each(node => {
          let promise;
          sourceList.forEach(source => {
            promise = new Promise((resolve) => {
              this.catalogs.relateNode(node, source, this.nodes)
              .then(resolve, resolve);
            });
            promises.push(promise);
          });
          promise = new Promise((resolve) => {
            this.pollers.relateNodeByCommands(node, ['chassis', 'driveHealth'], this.nodes)
            .then(resolve, resolve);
          });
          promises.push(promise);
          promise = new Promise((resolve) => {
            this.workflow.getActiveGraph(node.id)
            .then(graph => {node["activeGraph"] = graph[0] || node["activeGraph"];})
            .then(resolve, resolve);
          });
          promises.push(promise);
      });
      Promise.all(promises).then(() => {
        this.setState({loading: false});
      });
    });
  }

  filterNodes = (nodes) => {
    let filteredNodes = [];
    let filters = this.state.nodeFilters;
    if ( !nodes || filters.length === 0){
      return nodes;
    }
    nodes.map((node) => {
      let matched = true;
      Object.keys(filters).map((key) => {
        let value = this.dictRetrieve(node, key);
        let filter = filters[key];
        if (filter.length === 0) {
          //Krein: empty string to match all nodes;
          return true;
        }
        if (!value || filter.indexOf(value) === -1) {
          matched = false;
          return false;
        }
      });
      if (matched) { filteredNodes.push(node)}
    });
    return filteredNodes;
  };

  render() {
    let naStr = NodeGrid.naStr;
    let powerInfo = (node) => {
        let curr = this.dictRetrieve(node, 'chassis.power');
        if (typeof curr === 'undefined') {
            return;
        }
        return curr ? 'on' : 'off';
    }
    let popInfo = (node) => {
        let memInfo = this.dictRetrieve(node, 'dmi.data.Memory Device') || [];
        let memSize = 0;
        memInfo.forEach(mem => {
            if (mem['Size'] && mem['Size'].toLowerCase() !== 'no module installed') {
                let size = parseInt(mem['Size'].split(" ")[0]);
                let unit = mem['Size'].split(" ")[1];
                if (unit.toLowerCase() === "mb"){
                    size = size >> 10;
                }
                memSize += size; //Krein: Support GB
            }
        });
        let cpuInfo = this.dictRetrieve(node, 'dmi.data.Processor Information') || [];
        return {
            "Host IP": naStr,
            CPU: cpuInfo.length ? (cpuInfo.length + " " + (cpuInfo[0] && cpuInfo[0]['Version'])) : naStr,
            "Mem Size": memSize ? memSize + " GB" : naStr,
            Disks: naStr,
            LED: this.dictRetrieve(node, 'chassis.uid') || naStr
        };
    };
    let mapper = (node) => {
      let systemInfo = this.dictRetrieve(node, 'dmi.data.System Information') || {};
      let popData = popInfo(node);
      return {
        Type: node.type,
        Model: systemInfo['Product Name'] || naStr,
        Id: <Link to={'/mc/nodes/' + node.id}>{node.id}</Link>,
        SN: systemInfo['Serial Number'] || naStr,
        Manufacturer: systemInfo['Manufacturer'] || naStr,
        BMC_IP: this.dictRetrieve(node, 'bmc.data.IP Address') || naStr,
        Power: powerInfo(node, 'chassis.power') || naStr, //Krein Why can't use renderExpandIcon()?
        ActiveGraph: this.renderGraphLink(node.activeGraph) || naStr,
        Misc: <NodePopover data={popData} nodeId={node.id} />
      }
    };
    return ( //Krein: Implement Node Tool bar, how this.state.nodes be rendered?
      <div className="NodesGrid" >
        <ResourceTable
          initialEntities={this.filterNodes(this.state.nodes)}
          routeName="nodes list"
          emptyContent="No nodes."
          headerContent="Nodes"
          mapper={mapper}
          loadingContent={<LinearProgress mode={this.state.loading ? 'indeterminate' : 'determinate'} value={100} />}
          toolbarContent={<NodeGridToolbar nodes={this.state.nodes} updateFilters={this.updateNodeFilters}/>}
        />
      </div>
    );
  }
}
