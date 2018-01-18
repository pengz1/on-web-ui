import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import Utils from 'src-common/utils/Utils';

//module.exports = new Utils({
export default class Raid{
    static getNodeIdList(){
        return RackHDRestAPIv2_0.api.nodesGetAll()
            .then(function(data){
                var result = data.obj;
                var nodes = [];
                for(var i = 0; i < result.length; i++){
                    if(result[i].type === 'compute'){
                        nodes.push(result[i].id.toString());
                    }
                }
                nodes.push('node-01');
                return nodes;
            }).catch(function(err){
                console.log("Error happens in getNodeIdList: "+ JSON.stringify(err));
            });
    }

    static getRaidList(nodeId){
        return RackHDRestAPIv2_0.api.nodesGetCatalogSourceById({
            identifier: nodeId,
            source: 'megaraid-virtual-disks'}).then((data)=>{
                var response = data.obj.data.Controllers[0]['Response Data'];
                if(response === undefined){
                    return;
                }
                var key = Object.keys(response),vdCount = 0, vdList = [];
                for(var i = 0; i < key.length;i++){
                    if(key[i].includes('c0')){
                        vdCount++;
                    }
                }
                for(var i = 0; i < vdCount; i++){
                    var drives = [], pds = response['PDs for VD ' + i];
                    for(var j = 0; j < pds.length; j++){
                       drives.push(pds[j]['DID']);
                    }
                    vdList.push({
                        'name': response['/c0/v' + i][0].Name,
                        'type': response['/c0/v' + i][0].TYPE,
                        'state': response['/c0/v' + i][0].State,
                        'size': response['/c0/v' + i][0].Size,
                        'mediaType': response['PDs for VD ' + i][0].Med,
                        'stripSize': response['VD'+ i +' Properties']['Strip Size'],
                        'writePolicy': response['VD'+ i +' Properties']['Write Cache(initial setting)'],
                        'drives': '[' + drives + ']'
                    });
                }
                return vdList;
            }).catch((error) => {
                console.log('Error happens ' + JSON.stringify(error));
            });
    }

    static judgeHasCatalog(){
        return RackHDRestAPIv2_0.api.catalogsGet()
            .then((data) => {
                var response = data.obj;
                var megaraidSource = [
                    'megaraid-physical-drives',
                    'megaraid-controllers',
                    'megaraid-megaraid-controller-count',
                    'megaraid-virtual-disks'
                ];
                for(var i = 0; i < response.length; i++){
                    if(megaraidSource.includes(response[i].source)){
                        return true;
                    }
                }
                return false;
            }).catch((error) =>{
                console.log('Error happens ' + JSON.stringify(error));
            });
    }

    static freshMegaraidCatalog(nodeId){
        Utils.isDellSystem(nodeId)
            .then((isDell) => {
                var body = {
                    'name': '',
                    'options': {
                        'bootstrap-ubuntu': {
                            'overlayfsFile': ''
                        }
                     }
                }
                if(isDell){
                    console.log('The nodeId ' + nodeId + 'is dell system');
                }else{
                    console.log('The nodeId '+ nodeId + 'is not dell system');
                    body.name = 'Graph.Bootstrap.Megaraid.Catalog';
                    body.options['bootstrap-ubuntu']['overlayfsFile'] = 'raid.overlay.cpio.gz';
                }
                console.log('########## body = ' + JSON.stringify(body));
                RackHDRestAPIv2_0.api.nodesPostWorkflowById({
                    identifier: nodeId,
                    body: body
                }).catch((error) => {
                    console.log("Error happens : " + JSON.stringify(error));
                });
        }).catch((error) => {
            console.log('Error happens ' + JSON.stringify(error));
        });
    }
};

