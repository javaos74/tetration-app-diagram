var express = require('express');
var fs = require('fs');
var RestClient = require('./tetration.js');
var credentials = require('./credentials.js')
var prototab = require('./protocol_table.js')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const tetclient = new RestClient(credentials.API_ENDPOINT, credentials.API_KEY, credentials.API_SECRET)
var router = express.Router();
var show_port = true;

/* GET users listing. */
router.get('/apps', (req, res, next) => {
  tetclient.get('/applications', (error, response, body) => {
    var retval = []
    body.forEach( function( item) {
        d = { name: item.name, author: item.author, id: item.id}
        retval.push(d)
        //console.log( JSON.stringify(d))
    });
    res.send( JSON.stringify(retval));
  });
});

router.get('/fapps/:appid', (req, res, next) => {
    var appid = req.params.appid;
    var appVisData = { nodes: [], edges: [], options: {}, detail: {}}
    var body = JSON.parse(fs.readFileSync('public/data/'+appid+'.json', 'utf8'));
    var appName = body.name
    appVisData.detail.name = body.name
    appVisData.detail.description = body.description
    appVisData.detail.author = body.author
    appVisData.detail.primary = body.primary
    appVisData.detail.version = body.version
    appVisData.detail.creation = body.created_at
    // cluster handling 
    if ( body.hasOwnProperty('clusters') ) {
        for ( cluster of body.clusters) {
            var cur_node = {}
            var cur_ep_names = []
            for ( node of cluster.nodes) {
                cur_ep_names.push( node.name)
            }
            cur_node.id = cluster.id;
            cur_node.title = cur_ep_names.join("\r\n"); 
            cur_node.label = cluster.name 
            appVisData.nodes.push( cur_node)
        }
    }
    // inventory filter handling 
    if( body.hasOwnProperty( 'inventory_filters')) {
        for( inv_filter of body.inventory_filters) {
            var cur_node = {}
            cur_node.id = inv_filter.id;
            cur_node.label = inv_filter.name;
            cur_node.style = "filled";
            cur_node.color = { background: "lightblue"}
            appVisData.nodes.push( cur_node);
        }
    }
    // policies 
    if( body.hasOwnProperty('default_policies')) {
        for ( policy of body.default_policies) {
            if (show_port) {
                var policies = {}
                var port = "0", proto = "TCP", ports = [];
                for ( port_range of policy.l4_params) {
                    if (port_range.port[0] == port_range.port[1]) { 
                        port = String(port_range.port[0]);
                    } else {
                        port = String(port_range.port[0]) + "-" + String(port_range.port[1]);
                    }
                    //simple tcp or upd
                    proto = prototab[ port_range.proto]
                    if ( !Array.isArray(policies[proto]) ) 
                        policies[proto] = []
                    policies[proto].push( port);
                }
                //console.log( JSON.stringify( policies));
                var cur_node = { color: { background: 'lightgray'}, style: 'filled', shape: 'box'}
                for ( cur_policy in policies) {
                    ports.push( cur_policy + ":[" + policies[cur_policy]+"]")
                }
                //cur_node.label = policy.consumer_filter_name + '-->' + policy.provider_filter_name + ':\n' + ports.join('\n');
                cur_node.label = ports.join('\n');
                cur_node.id = policy.consumer_filter_id + policy.provider_filter_id
                appVisData.nodes.push( cur_node)
                //console.log( JSON.stringify( cur_node))

                var cur_edge = { arrows: "to", font: {size: 12}, from: policy.consumer_filter_id, to: policy.consumer_filter_id + policy.provider_filter_id }
                appVisData.edges.push( cur_edge)
                var cur_edge2 = { arrows: "to", font: {size: 12}, from: policy.consumer_filter_id + policy.provider_filter_id, to: policy.provider_filter_id}
                appVisData.edges.push( cur_edge2)
            } else {
                var cur_edge = { arrows: "to" }
                cur_edge.from = policy.consumer_filter_id;
                cur_edge.to = policy.provider_filter_id;
                appVisData.edges.push( cur_edge);
            }
        }
    }
    res.send( appVisData ); 
});

router.get('/apps/:appid', (req, res, next) => {
    var appid = req.params.appid;
    var appVisData = { nodes: [], edges: [], options: {}, detail: {}}
    tetclient.get('/applications/' + appid + '/details', (error, response, body) => {
        var appName = body.name
        appVisData.detail.name = body.name
        appVisData.detail.description = body.description
        appVisData.detail.author = body.author
        appVisData.detail.primary = body.primary
        appVisData.detail.version = body.version
        appVisData.detail.creation = body.created_at
        // cluster handling 
        if ( body.hasOwnProperty('clusters') ) {
            for ( cluster of body.clusters) {
                var cur_node = {}
                var cur_ep_names = []
                for ( node of cluster.nodes) {
                    cur_ep_names.push( node.name)
                }
                cur_node.id = cluster.id;
                //cur_node.label = cluster.name +":\n" + cur_ep_names.join("\n");
                cur_node.title = cur_ep_names.join("\r\n"); 
                cur_node.label = cluster.name 
                //cur_node.shape = "star";
                appVisData.nodes.push( cur_node)
            }
        }
        // inventory filter handling 
        if( body.hasOwnProperty( 'inventory_filters')) {
            for( inv_filter of body.inventory_filters) {
                var cur_node = {}
                cur_node.id = inv_filter.id;
                cur_node.label = inv_filter.name;
                cur_node.style = "filled";
                //cur_node.shape = "box";
                cur_node.color = { background: "lightblue"}
                appVisData.nodes.push( cur_node);
            }
        }
        // policies 
        if( body.hasOwnProperty('default_policies')) {
            for ( policy of body.default_policies) {
                if (show_port) {
                    var policies = {}
                    var port = "0", proto = "TCP", ports = [];
                    for ( port_range of policy.l4_params) {
                        if (port_range.port[0] == port_range.port[1]) { 
                            port = String(port_range.port[0]);
                        } else {
                            port = String(port_range.port[0]) + "-" + String(port_range.port[1]);
                        }
                        //simple tcp or upd
                        proto = prototab[ port_range.proto]
                        if ( !Array.isArray(policies[proto]) ) 
                            policies[proto] = []
                        policies[proto].push( port);
                    }
                    //console.log( JSON.stringify( policies));
                    var cur_node = { color: { background: 'lightgray'}, style: 'filled', shape: 'box'}
                    for ( cur_policy in policies) {
                        ports.push( cur_policy + ":[" + policies[cur_policy]+"]")
                    }
                    //cur_node.label = policy.consumer_filter_name + '-->' + policy.provider_filter_name + ':\n' + ports.join('\n');
                    cur_node.label = ports.join('\n');
                    cur_node.id = policy.consumer_filter_id + policy.provider_filter_id
                    appVisData.nodes.push( cur_node)
                    //console.log( JSON.stringify( cur_node))

                    var cur_edge = { arrows: "to", font: {size: 12}, from: policy.consumer_filter_id, to: policy.consumer_filter_id + policy.provider_filter_id }
                    appVisData.edges.push( cur_edge)
                    var cur_edge2 = { arrows: "to", font: {size: 12}, from: policy.consumer_filter_id + policy.provider_filter_id, to: policy.provider_filter_id}
                    appVisData.edges.push( cur_edge2)
                } else {
                    var cur_edge = { arrows: "to" }
                    cur_edge.from = policy.consumer_filter_id;
                    cur_edge.to = policy.provider_filter_id;
                    appVisData.edges.push( cur_edge);
                }
            }
        }
        //console.log( JSON.stringify( appVisData, null, 2));
        res.send( appVisData ); 
    });
});

module.exports = router;
