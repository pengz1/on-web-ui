import NodeStore from 'src-common/stores/NodeStore';
import CatalogStore from 'src-common/stores/CatalogStore';
import WorkflowStore from 'src-common/stores/WorkflowStore';
import IpmiStore from 'src-common/stores/IpmiStore';
import BmcIpStore from 'src-common/stores/BmcIpStore';

export default class Processor {

    constructor() {
        this.nodes = new NodeStore();
        this.catalogs = new CatalogStore();
        this.workflows = new WorkflowStore();
        this.ipmi = new IpmiStore();
        this.bmcips = new BmcIpStore();
    }

    getBmcIpList() {
        return this.bmcips.list();
    }

    getBmcNodeList(bmcIps) {
        // Validate all bmc ip
        let promises = [];
        Object.keys(bmcIps).forEach(ip => {
            let promise = this.isBmc('admin', 'admin', ip).then(res => {
                res = res === 'valid' ? 'running' : res;
                bmcIps[ip].status = res;
            });
            promises.push(promise);
        });
        return Promise.all(promises).then(() => {
            // Then get node list and match bmc info in node's catalog
            return this.nodes.listComputeNode().then(() =>{
                let promises = [];
                this.nodes.each(node => {
                    let promise = this.catalogs.listNodeSource(node.id, 'bmc')
                    .then(() => {
                        let bmcCatalog = Object.keys(this.catalogs.collection)
                            .filter(o => this.catalogs.collection[o])[0];
                        let ip = this.catalogs.collection[bmcCatalog].data['IP Address'];
                        let mac = this.catalogs.collection[bmcCatalog].data['MAC Address'];
                        console.log(ip + '  ' + mac )
                        bmcIps[ip].nodeId = node.id;
                        bmcIps[ip].mac = mac;
                        bmcIps[ip].status = 'Discovered';
                    }).catch((err) => {
                        console.log('no bmc found: ' + node.id);
                    });
                    promises.push(promise);
                });
                return Promise.all(promises).then(() => {
                    return bmcIps;
                });
            });
        });
    }

    isBmc(user, passwd, host) {
        return this.ipmi.run(user, passwd, host, 'bmc info 2>/dev/null', 'timeout 2')
        .then(res => {
            let status = JSON.parse(res.statusText).status;
            return status === 'success' ? 'valid' : 'invalid';
        });
    }

    triggerDiscovery(user, passwd, host) {
        return this.ipmi.run(user, passwd, host, 'chassis bootdev pxe').then(() => {
            return this.ipmi.run(user, passwd, host, 'chassis power cycle');
        }).then(res => {
            return JSON.parse(res.statusText);
        });
    }

    flush(bmcIps) {
        let promises = [];
        Object.keys(bmcIps).forEach(ip => {
            if (bmcIps[ip].nodeId === null && bmcIps[ip].status === 'valid') {
                let promise = this.triggerDiscovery('admin', 'admin', ip).then(() => {
                    bmcIps[ip].status = 'Pxe Boot Triggered';
                });
                promises.push(promise);
            }
        });
        return Promise.all(promises).then(() => {
            return bmcIps;
        });
    }

    createBmcIp(ip, username, password) {
        return this.bmcips.create(ip, username, password).then(res => {
            return JSON.parse(res.statusText);
        });
    }

}

