var express = require('express');
var RestClient = require('./tetration.js');
var credentials = require('./credentials.js')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const tetclient = new RestClient(credentials.API_ENDPOINT, credentials.API_KEY, credentials.API_SECRET)
var router = express.Router();
var show_port = false;

/* GET users listing. */
router.get('/apps', (req, res, next) => {
  tetclient.get('/applications', (error, response, body) => {
    retval = []
    body.forEach( function( item) {
        d = { name: item.name, id: item.id}
        retval.push(d)
        console.log( JSON.stringify(d))
    });
    //console.log(JSON.stringify(body, null, 2))
    res.send( JSON.stringify(retval));
  });
});

router.get('/apps/:appid', (req, res, next) => {
    var appid = req.params.appid;
    var appVisData = { nodes: [], edges: [], options: {}}
    tetclient.get('/applications/' + appid + '/details', (error, response, body) => {
        var appName = body.name
        // cluster handling 
        for ( cluster of body.clusters) {
            var cur_node = {}
            var cur_ep_names = []
            for ( node of cluster.nodes) {
                cur_ep_names.push( node.name)
            }
            cur_node.id = cluster.id;
            cur_node.label = cluster.name +":\n" + cur_ep_names.join("\n");
            appVisData.nodes.push( cur_node)
        }
        // inventory filter handling 
        for( inv_filter of body.inventory_filters) {
            var cur_node = {}
            cur_node.id = inv_filter.id;
            cur_node.label = inv_filter.name;
            cur_node.style = "filled";
            cur_node.color = { background: "lightblue"}
            appVisData.nodes.push( cur_node);
        }
        // policies 
        for ( policy of body.default_policies) {
            if (show_port) {

            } else {
                var cur_edge = { arrows: "to" }
                cur_edge.from = policy.consumer_filter_id;
                cur_edge.to = policy.provider_filter_id;
                appVisData.edges.push( cur_edge);
            }
        }
        console.log( JSON.stringify( appVisData, null, 2));
        res.send( appVisData ); 

    });
});

module.exports = router;
