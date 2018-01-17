import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { RaisedButton, LinearProgress, Snackbar } from 'material-ui';
import FormatHelpers from 'src-common/lib/FormatHelpers';
import ResourceTable from 'src-common/views/ResourceTable';
import DiscoveryWorkflowMonitor from '../lib/DiscoveryWorkflowMonitor';
import Processor from '../lib/Processor';
import AddBmcIp from './AddBmcIp';

export default class BmcIps extends Component {

    state = {
        pop: false,
        alertmsg: '',
        ips: {},
        nodes: null,
        catalogs: null,
        workflows: null,
        ipmi: null,
        bmcips: null
    };

    constructor() {
        super();
        this.processor = new Processor();
        this.nodes = this.processor.nodes;
        this.catalogs = this.processor.catalogs;
        this.workflows = this.processor.workflows;
        this.bmcips = this.processor.bmcips;
    }

    componentWillMount() {
        this.updateBmcIpList().then(() => {
            this.nodes.startMessenger();
            this.catalogs.startMessenger();
            this.workflows.startMessenger();
        }).catch(err => {
            console.log(err)
        });
    }

    componentDidMount() {
        this.unwatchNodes = this.nodes.watchAll('nodes', this);
        this.unwatchCatalogs = this.catalogs.watchAll('catalogs', this);
        this.unwatchWorkflows = this.workflows.watchAll('workflows', this);
        this.DiscoveryWorkflowMonitor = new DiscoveryWorkflowMonitor({
            discoveredEvents: msg => {
                this.processor.getBmcNodeList(this.state.ips).then(res => {
                    this.setState({ips: res});
                });
            }
        });
    }

    updateBmcIpList() {
        return this.processor.getBmcIpList().then(data => {
            data.forEach(ip => {
                this.state.ips[ip] = {
                    'nodeId': null,
                    'status': null,
                    'mac': null
                }
            });
            this.setState({ips: this.state.ips});
        }).then(() => {
            return this.processor.getBmcNodeList(this.state.ips)
        }).then((res) => {
            this.setState({ips: res})
        });
    }

    alertMsg(msg) {
        this.setState({
            pop: true,
            alertmsg: msg
        });
    }

    render() {
        return (
            <div>
                <ResourceTable
                    initialEntities={Object.keys(this.state.ips)}
                    routeName="nodes"
                    emptyContent="No Data"
                    headerContent="BMC"
                    toolbarContent={<AddBmcIp ips={Object.keys(this.state.ips)}
                                    update={()=>this.updateBmcIpList()}
                                    alertMsg={(msg)=>this.alertMsg(msg)}/>}
                    mapper={ip => (
                        {
                            BMC: ip,
                            NodeId: this.state.ips[ip]['nodeId'] || 'N/A',
                            MAC: this.state.ips[ip]['mac'] || 'N/A',
                            STATUS: this.state.ips[ip]['status'] || 'N/A'
                        }
                    )} />
                    <Snackbar
                      open={this.state.pop}
                      message={this.state.alertmsg}
                      autoHideDuration={4000}
                    />
            </div>
        )
    }

}
