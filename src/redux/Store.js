import {createStore} from 'redux';
import reducer from './Reducer.js';

const initValues = {
    "nodeId" : "initValues",
    "workflowName" : "Graph.InstallESXi",
    "options": {
        "defaults": {
            "version": "{version}",
            "repo": "http://{rackhd_ip}/esxi/{version}",
            "rootPassword": "{rootPassword}",
            "dnsServers": ["{dnsServers}"],
            "networkDevices": [
                {
                    "device": "{device}",
                    "ipv4": {
                        "ipAddr": "{ipAddr}",
                        "gateway": "{gateway}",
                        "netmask": "{netmask}"
                    }
                }
            ],
            "installDisk": "{installDisk}",
            "postInstallCommands": [
                "echo This command will run at the end ",
                "echo of the post installation step"
            ]
        }
    }

};

const store = createStore(reducer, initValues);

export default store;
