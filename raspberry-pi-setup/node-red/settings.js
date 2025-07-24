/**
 * Active Target Node-RED Settings
 *
 * This is the settings file for Node-RED running in the Active Target system.
 * It configures Node-RED for optimal performance in the time tracking environment.
 */

module.exports = {
    // The TCP port that the Node-RED web server is listening on
    uiPort: process.env.PORT || 1880,

    // By default, the Node-RED UI accepts connections on all IPv4 interfaces.
    // To only allow connections from localhost, set this to "127.0.0.1"
    uiHost: "0.0.0.0",

    // Retry time in milliseconds for MQTT connections
    mqttReconnectTime: 15000,

    // Retry time in milliseconds for Serial port connections
    serialReconnectTime: 15000,

    // Retry time in milliseconds for TCP socket connections
    tcpReconnectTime: 10000,

    // The maximum length, in characters, of any message sent to the debug sidebar tab
    debugMaxLength: 1000,

    // The file containing the flows. If not set, it defaults to flows_<hostname>.json
    flowFile: 'flows.json',

    // To enabled pretty-printing of the flow within the flow file, set the following
    // property to true:
    flowFilePretty: true,

    // By default, credentials are encrypted in storage using a generated key.
    // To specify your own secret, set the following property:
    // credentialSecret: "a-secret-key",

    // By default, all user data is stored in the Node-RED install directory. To
    // use a different location, the following property can be used
    userDir: '/data/',

    // Node-RED scans the `nodes` directory in the install directory to find nodes.
    // The following property can be used to specify an additional directory to scan.
    nodesDir: '/data/nodes',

    // By default, the Node-RED UI is available at http://localhost:1880/
    // The following property can be used to specify a different root path.
    // If set to false, this is disabled.
    httpAdminRoot: '/',

    // Some nodes, such as HTTP In, can be used to listen for incoming HTTP requests.
    // By default, these are served relative to '/'. The following property
    // can be used to specify a different root path. If set to false, this is
    // disabled.
    httpNodeRoot: '/api',

    // The following property can be used to add a custom middleware function
    // in front of the HTTP In node.
    // httpNodeMiddleware: function(req,res,next) {
    //    // Handle/reject the request, or pass it on to the HTTP In node by calling next();
    //    // Optionally skip our rawBodyParser by setting this to true;
    //    req.skipRawBodyParser = true;
    //    next();
    // },

    // The following property can be used to verify websocket connection attempts.
    // This allows, for example, the HTTP request headers to be checked to ensure
    // they include valid authentication information.
    // webSocketNodeVerifyClient: function(info) {
    //    // 'info' has three properties:
    //    //   - origin : the value in the Origin header
    //    //   - req : the HTTP request
    //    //   - secure : true if req.connection.authorized or req.connection.encrypted
    //    return true;
    // },

    // The following property can be used to seed Global Context with predefined
    // values. This allows extra node modules to be made available with the
    // Function node.
    // functionGlobalContext: {
    //     // os:require('os'),
    //     // jfive:require("johnny-five"),
    //     // j5board:require("johnny-five").Board({repl:false})
    // },

    // Global context settings
    functionGlobalContext: {
        moment: require('moment'),
        // Add other useful modules here
    },

    // `global.keys()` returns a list of all properties set in global context.
    // This allows them to be displayed in the Context Sidebar within the editor.
    // In some circumstances it is not desirable to expose them to the editor. The
    // following property can be used to hide any property set in `functionGlobalContext`
    // from being list by `global.keys()`.
    // By default, the property is set to false to avoid accidental exposure of
    // their values. Setting this to true will cause the keys to be listed.
    exportGlobalContextKeys: false,

    // Context Storage
    // The following property can be used to enable context storage. The configuration
    // provided here will enable file-based context that flushes to disk every 30 seconds.
    // Refer to the documentation for further options: https://nodered.org/docs/api/context/
    contextStorage: {
        default: {
            module: "localfilesystem"
        },
    },

    // The following property can be used to order the categories in the editor
    // palette. If a node's category is not in the list, the category will get
    // added to the end of the palette.
    // If not set, the following default order is used:
    paletteCategories: ['subflows', 'common', 'function', 'network', 'sequence', 'parser', 'storage'],

    // Configure the logging output
    logging: {
        // Only console logging is currently supported
        console: {
            // Level of logging to be recorded. Options are:
            // fatal - only those errors which make the application unusable should be recorded
            // error - record errors which are deemed fatal for a particular request + fatal errors
            // warn - record problems which are non fatal + errors + fatal errors
            // info - record information about the general running of the application + warn + error + fatal errors
            // debug - record information which is more verbose than info + info + warn + error + fatal errors
            // trace - record very detailed logging + debug + info + warn + error + fatal errors
            // off - turn off all logging (doesn't affect metrics or audit)
            level: "info",
            // Whether or not to include metric events in the log output
            metrics: false,
            // Whether or not to include audit events in the log output
            audit: false
        }
    },

    // Customising the editor
    editorTheme: {
        projects: {
            // To enable the Projects feature, set this value to true
            enabled: false
        },
        page: {
            title: "Active Target - Node-RED",
            favicon: "/absolute/path/to/theme/icon",
            css: "/absolute/path/to/custom/css/file",
            scripts: "/absolute/path/to/custom/script/file"
        },
        header: {
            title: "Active Target Flow Editor",
            url: "http://active-target.local"
        },
        deployButton: {
            type: "simple",
            icon: "/absolute/path/to/deploy/icon"
        },
        menu: { // Hide unwanted menu items by setting them to false
            "menu-item-import-library": false,
            "menu-item-export-library": false,
            "menu-item-keyboard-shortcuts": false,
            "menu-item-help": {
                label: "Active Target Help",
                url: "http://active-target.local"
            }
        },
        userMenu: false, // Hide the user-menu even if adminAuth is enabled
        login: {
            image: "/absolute/path/to/login/page/big/image" // a 256x256 image
        },
        palette: {
            catalogues: [
                'https://catalogue.nodered.org/catalogue.json'
            ],
            theme: [
                {
                    category: ".*",
                    type: ".*",
                    color: "#f0f0f0"
                }
            ]
        },
        theme: ""
    },

    // Node-RED nodes
    nodesExcludes: ['90-exec.js'],

    // Add the nodes in
    functionExternalModules: true,

    // The following property can be used to set predefined values in Global Context.
    // This allows extra node modules to be made available with the
    // Function node.
    functionGlobalContext: {
        moment: require('moment')
    },

    // The following property can be used to disable the runtime APIs.
    // disableEditor: false,

    // Configure the admin API
    adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            password: "$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.",
            permissions: "*"
        }]
    },

    // Configure the runtime API
    httpNodeAuth: {user:"user",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},

    // The following property can be used to disable the editor from being loaded
    httpAdminAuth: {user:"admin",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},

    // Enable project feature
    editorTheme: {
        projects: {
            enabled: true
        }
    }
};
