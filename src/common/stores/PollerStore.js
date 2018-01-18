// Copyright 2015, EMC, Inc.

import Store from 'src-common/lib/Store';

import RackHDRestAPIv2_0 from '../messengers/RackHDRestAPIv2_0';

export default class PollerStore extends Store {

  api = RackHDRestAPIv2_0.url;
  resource = 'pollers';

  list() {
    return RackHDRestAPIv2_0.api.pollersGet()
      .then(res => this.recollect(res.obj))
      .catch(err => this.error(null, err));
  }

  read(id) {
    return RackHDRestAPIv2_0.api.pollersIdGet({identifier: id})
      .then(res => this.change(id, res.obj))
      .catch(err => this.error(id, err));
  }

  relateNodeByCommand(node, command, nodeStore) { //Krein: may be should create PollerDataStore
    return RackHDRestAPIv2_0.api.nodesGetPollersById({identifier: node.id})
    .then(res => {
        let pollers = res.obj;
        let pollerId;
        pollers.forEach(poller =>{
            let pollerCommand = poller.config && poller.config.command;
            if (pollerCommand === command){
                pollerId = poller.id;
                return false;
            }
        });
        return RackHDRestAPIv2_0.api.pollersCurrentDataGet({identifier: pollerId})
        .then(res => {
            node[command] = res.obj[0][command] || node[command];
            if(nodeStore) { nodeStore.change(node.id, node);}
        });
    });
  }

  relateNode(node, commands, nodeStore) { //Krein: may be should create PollerDataStore
    return RackHDRestAPIv2_0.api.nodesGetPollersById({identifier: node.id})
    .then(res => {
        let pollers = res.obj;
        let commandPollerMap = {};
        let promises = [];
        pollers.forEach(poller =>{
            let command = poller.config && poller.config.command;
            if (command && commands.indexOf(command) !== -1) {
                commandPollerMap[command] = poller.id;
            }
        });
        Object.keys(commandPollerMap).forEach(key => {
            let id = commandPollerMap[key];
            let promise = new Promise((resolve) => {
                return RackHDRestAPIv2_0.api.pollersCurrentDataGet({identifier: id})
                .then(res => {
                    node[key] = res.obj[0][key] || node[key];
                    if(nodeStore) { nodeStore.change(node.id, node, true);} //Silent=true to minimize refresh of page
                })
                .then(resolve, resolve);
            });
            promises.push(promise);
        });
        return Promise.all(promises);
    });
  }

  create(id, data) {
    data.id = id;
    return RackHDRestAPIv2_0.api.pollersPost({content: data})
      .then(() => this.insert(id, data))
      .catch(err => this.error(id, err));
  }

  update(id, data) {
    return RackHDRestAPIv2_0.api.pollersPatch({identifier: id, content: data})
      .then(() => this.change(id, data))
      .catch(err => this.error(id, err));
  }

  destroy(id) {
    return RackHDRestAPIv2_0.api.pollersDelete({identifier:id})
      .then(() => this.remove(id))
      .catch(err => this.error(id, err));
  }

  listNode(nodeId) {
    this.empty();
    return RackHDRestAPIv2_0.api.nodesGetPollersById({identifier: nodeId})
      .then(res => this.collect(res.obj))
      .catch(err => this.error(null, err));
  }

}
