// Copyright 2017, EMC, Inc.

export default class NodeUtils {

  static isArrayEqual = (arr1, arr2) => {
    if(arr1.length !== arr2.length) return false;
    for(var i = arr1.length; i--;) {
      if(arr1[i] !== arr2[i]) return false;
    }
    return true;
  };

  static getValueByPath = (dict, path) => {
    let curr = dict;
    path.split('.').forEach(key => {
      curr = curr && curr[key];
    });
    return curr;
  }

  static mergeData = (newData, oldData) => {
    //Merge Object data with values are arrays;
    let shouldUpdateData = false;
    Object.keys(newData).forEach((key) => {
      let newValue=newData[key];
      let oldValue=oldData[key];
      if (!oldValue || !NodeUtils.isArrayEqual(newValue, oldValue)) {
        shouldUpdateData = true;
        return false;
      }
    });
    if (shouldUpdateData) {
      return Object.assign(oldData || {}, newData)
    }
  }

  static filterNodes = (nodes, filters) => {
    let filteredNodes = [];
    //Krein: No nodes, no filters, or filters is empty will not do filtering;
    if (!(nodes && filters && filters !== {})){
      return nodes;
    }
    nodes.map((node) => {
      let matched = true;
      Object.keys(filters).map((key) => {
        let value = NodeUtils.getValueByPath(node, key);
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

  static getPowerInfo = (node) => {
    let curr = NodeUtils.getValueByPath(node, 'chassis.power');
    if (typeof curr !== 'undefined') {
      return curr ? 'on' : 'off';
    }
  };

  static getMemSize = (node) => {
    let memInfo = NodeUtils.getValueByPath(node, 'dmi.data.Memory Device') || [];
    let memSize = 0;
    memInfo.forEach(mem => {
      if (mem['Size'] && mem['Size'].toLowerCase() !== 'no module installed') {
        let size = parseInt(mem['Size'].split(" ")[0]);
        let unit = mem['Size'].split(" ")[1];
        if (unit.toLowerCase() === "mb"){
            size = size >> 10;//Krein: Support GB
        }
        memSize += size;
      }
    });
    return memSize;
  };

  static getPopoverInfo = (node) => {
    let memSize = NodeUtils.getMemSize(node);
    let cpuInfo = NodeUtils.getValueByPath(node, 'dmi.data.Processor Information') || [];
    let naStr = 'NA';
    return {
        "Host IP": naStr,
        CPU: cpuInfo.length ? (cpuInfo.length + " " + (cpuInfo[0] && cpuInfo[0]['Version'])) : naStr,
        "Mem Size": memSize ? memSize + " GB" : naStr,
        Disks: naStr,
        LED: NodeUtils.getValueByPath(node, 'chassis.uid') || naStr
    };
  };

}

