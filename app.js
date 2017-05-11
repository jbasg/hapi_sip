'use Static';

const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');


const Plugin_Base = require('./hapi_plugin_base_route');


const HTTP_PORT = 4000;
const HTTP_PATH = './public/';

const FAYE_ENABLED = true;
const FAYE_PATH = '/faye';


const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, HTTP_PATH)
            }
        }
    }
});

server.connection({ port: HTTP_PORT });

if (FAYE_ENABLED){
    const faye = require('faye');
    const bayeux = new faye.NodeAdapter({mount: FAYE_PATH});
    bayeux.attach(server.listener);
}

//REGISTERED PLUGINS
server.register([     Inert
                    , Plugin_Base
                ], () => {});

// Server Method Sample
server.method('add',function(a,b,next) {
    return (next,null,a+b);
})

// Server App Sample
server.app.app_name = 'hapi_template';




server.start((err) => {

    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});