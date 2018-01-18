import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';

//module.exports = new Utils({
export default class Utils{
    static isDellSystem(nodeId){
        return RackHDRestAPIv2_0.api.nodesGetById({identifier: nodeId})
            .then((response) => {
                var node = response.obj;
                for(var i = 0; i < node.identifiers.length; i++) {
                    if(/^[0-9|A-Z]{7}$/.test(node.identifiers[i])){
                        return true;
                    }
                }
                return false;
            }).catch((error) => {
                console.log("Error happens: " + JSON.stringify(error));
            });
    }
    static getControllerId(nodeId){
        var controller;
        return RackHDRestAPIv2_0.api.nodesGetCatalogSourceById({
                identifier: nodeId,
                source: 'megaraid-controllers'
            }).then(function(response) {
                return response.obj.data['Controllers'][0]['Command Status']['Controller']
            }).catch(function(error) {
                console.log("Error happens : "  + JSON.stringify(error));
            });
    };
};

