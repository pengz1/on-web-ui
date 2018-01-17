
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { RaisedButton, LinearProgress } from 'material-ui';

import FormatHelpers from 'src-common/lib/FormatHelpers';
import NodeStore from 'src-common/stores/NodeStore';
import CatalogStore from 'src-common/stores/CatalogStore';
import WorkflowStore from 'src-common/stores/WorkflowStore';
import ResourceTable from 'src-common/views/ResourceTable';
import DiscoveryWorkflowMonitor from '../lib/DiscoveryWorkflowMonitor';


export default class DiscoveryWorkflows extends Component {

    nodes = new NodeStore();
    catalogs = new CatalogStore();
    workflows = new WorkflowStore();

    state = {
        nodes: null,
        catalogs: null,
        workflows: null,
        discoveryWorkflows: []
    };

    componentWillMount() {
        this.nodes.startMessenger();
        this.catalogs.startMessenger();
        this.workflows.startMessenger();
        this.listDiscoveryWorkflows();
    }

    componentDidMount() {
        this.DiscoveryWorkflowMonitor = new DiscoveryWorkflowMonitor( {
            startedEvents: msg => {
                //console.log('111111111111111111111111111111111111111')
                //console.log(msg);
                //console.log({
                //    targetNode: msg.data.action,
                //    graphId: msg.data.data.graphId,
                //    graphName: msg.data.data.graphName,
                //    status: msg.data.data.status
                //});
                if (msg.data.data.graphName === 'SKU Discovery') {
                    //console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
                    this.listDiscoveryWorkflows();
                } else {
                    //console.log('Other graphs are running');
                }
            },
            finishedEvents: msg => {
                //console.log('4444444444444444444444444444444444444444444');
                //console.log(msg);
                this.listDiscoveryWorkflows();
            }
        });
        this.unwatchNodes = this.nodes.watchAll('nodes', this);
        this.unwatchCatalogs = this.catalogs.watchAll('catalogs', this);
        this.unwatchWorkflows = this.workflows.watchAll('workflows', this);
    }

    render() {
        return (
            <div>
                <ResourceTable
                    initialEntities={this.state.discoveryWorkflows}
                    routeName="nodes"
                    emptyContent="No Data"
                    headerContent="Discovery Workflows"
                    mapper={workflow => (
                        {
                            WorkflowId: workflow.id || 'N/A',
                            graphId: workflow.context.graphId || 'N/A',
                            graphName: workflow.context.graphName || 'N/A',
                            status: workflow.status || 'N/A'
                        }
                    )} />
            </div>
        )
    }

    listDiscoveryWorkflows() {
        //console.log('+++++++++++++++++++++++++++++++++++++++++++++')
        this.workflows.list().then(() => {
            let all = [];
            this.workflows.each(w => all.push(w));
            //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            //console.log(all)
            //console.log('filtered ' + all.filter(workflow => workflow && workflow.injectableName === 'Graph.SKU.Discovery'))
            //console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
            //console.log(this.state.discoveryWorkflows)
            this.setState({
                discoveryWorkflows: all.filter(workflow => workflow && workflow.injectableName === 'Graph.SKU.Discovery')
            });
        });
    }

}
