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

import NodeUtils from 'src-solution-center/lib/NodeUtils';
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
    //catalogs: null,
    loading: true,
    nodeFilters: {},
    power: {}
  };

  componentWillMount() {
    //this.nodes.startMessenger();
    //this.catalogs.startMessenger();
  }

  componentDidMount() {
    //Krein: Each render() will trigger this items, if nodes are not the same, it will trigger
    //render() again. That means any catalogs/pollers and other items will trigger this.
    //this.unwatchNodes = this.nodes.watchAll('nodes', this); //watchAll will monitor all data
    //changes to this.nodes and refresh all catalogs as well. Is this necessary?
    //this.unwatchCatalogs = this.catalogs.watchAll('catalogs', this);
    this.listNodes();
  }

  componentWillUnmount() {
    //this.nodes.stopMessenger();
    //this.catalogs.stopMessenger();
    //this.unwatchNodes();
  }

  renderGraphLink = (graph) => {
    let graphName = graph && graph.name;
    if (graphName){
        return (<Link to={'/oc/' + graph.instanceId}>{graphName}</Link>);
    }
    return NodeGrid.naStr;
  }

  updateNodeFilters = (newList) => {
    let nodeFilters = NodeUtils.mergeData(newList, (this.state.nodeFilters));
    if (nodeFilters) {
      this.setState({nodeFilters});
    }
  }

  refreshNodes = () => {
    this.listNodes.call(this);
  }

  listNodes() {
    this.state.loading = true;
    this.nodes.list()
    .then(() => {
      let promises = [];
      let retrieveObj = {
        catalogs: ['dmi', 'rmm'], //Krein: How to handle BMC && RMM
        pollers: ['chassis', 'driveHealth'],
        workflow: ['active']
      }
      this.nodes.each(node => {
          if (node.type === "enclosure") return;
          let promise;
          Object.keys(retrieveObj).forEach(key => {
            promise = new Promise((resolve) => {
            //Krein: Still relateNode method of each store will publish events for each source,
            //A better idea is to combine them and added to node store once.
              this[key]['relateNode'](node, retrieveObj[key], this.nodes)
              .then(resolve, resolve);
            });
            promises.push(promise);
          })
      });
      Promise.all(promises).then(() => {
        this.setState({
          loading: false,
          nodes: this.nodes.all()
        });
      });
    });
  }

  filterNodes = (nodes) => {
    return NodeUtils.filterNodes(nodes, this.state.nodeFilters);
  };

  render() {
    let naStr = NodeGrid.naStr;
    let mapper = (node) => {
      let systemInfo = NodeUtils.getValueByPath(node, 'dmi.data.System Information') || {};
      return {
        Type: node.type,
        Model: systemInfo['Product Name'] || naStr,
        Id: <Link to={'/mc/nodes/' + node.id}>{node.id}</Link>,
        SN: systemInfo['Serial Number'] || naStr,
        Manufacturer: systemInfo['Manufacturer'] || naStr,
        BMC_IP: NodeUtils.getValueByPath(node, 'rmm.data.IP Address') || naStr,
        Power: NodeUtils.getPowerInfo(node) || naStr, //Krein Why can't use renderExpandIcon()?
        ActiveGraph: this.renderGraphLink(node.activeGraph) || naStr,
        Misc: <NodePopover data={NodeUtils.getPopoverInfo(node)} nodeId={node.id} />
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
          toolbarContent={<NodeGridToolbar nodes={this.state.nodes} updateFilters={this.updateNodeFilters} refresh={this.refreshNodes}/>}
        />
      </div>
    );
  }
}
