'use strict';

// you have to require the utils module and call adapter function
const utils = require('@iobroker/adapter-core');

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
let sPort = null;
let adapter;

function startAdapter(options) {
     options = options || {};
     Object.assign(options, {
          name: 'tinyrx4',

          // is called when adapter shuts down - callback has to be called under any circumstances!
          unload: function (callback) {
            try {
                adapter.log.info('cleaned everything up...');
                adapter.setState('info.connection', false, true);
                callback();
            } catch (e) {
                callback();
            }
        },

        // is called if a subscribed object changes
        objectChange: function (id, obj) {
            // Warning, obj can be null if it was deleted
//            adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
        },

        // is called if a subscribed state changes
        stateChange: function (id, state) {
            // Warning, state can be null if it was deleted
//            adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
        
            // you can use the ack flag to detect if it is status (true) or command (false)
            if (state && !state.ack) {
                adapter.log.info('ack is not set!');
            }
        },

        // message
        message: function (obj) {
            if (obj) {
                switch (obj.command) {
                    case 'listUart':
                        if (obj.callback) {
                            if (SerialPort) {
                                // read all found serial ports
                                SerialPort.list((err, ports) => {
                                    adapter.log.info('List of port: ' + JSON.stringify(ports));
                                    adapter.sendTo(obj.from, obj.command, ports, obj.callback);
                                });
                            } else {
                                adapter.log.warn('Module serialport is not available');
                                adapter.sendTo(obj.from, obj.command, [{comName: 'Not available'}], obj.callback);
                            }
                        }
                    break;
                }
            }
        },

        // is called when databases are connected and adapter received configuration.
        // start here!
        ready: function () {
            main()
        }
    });

    adapter = new utils.Adapter(options);
    return adapter;
};

function createNode(id, data) {

    adapter.setObjectNotExists('Sensor_' + id, {
        type: 'channel',
        common: {
            name: 'Sensor ' + id,
            role: 'sensor'
        },
        native: {
            "addr": id
        }
    });

    if(/v=[0-9]+/.test(data)) {
        adapter.setObjectNotExists('Sensor_' + id + '.battery', {
            type: 'state',
            common: {
                "name": "Battery",
                "type": "number",
                "unit": "V",
                "min": 0,
                "max": 5,
                "read": true,
                "write": false,
                "role": "value.battery",
                "desc": "Battery"
            },
            native: {}
        });
   }

    if(/t=[0-9]+/.test(data)) {
        adapter.setObjectNotExists('Sensor_' + id + '.temperature', {
            type: 'state',
            common: {
                "name": "Temperature",
                "type": "number",
                "unit": "°C",
                "min": -50,
                "max": 50,
                "read": true,
                "write": false,
                "role": "value.temperature",
                "desc": "Temperature"
            },
            native: {}
        });

        adapter.setObjectNotExists('Sensor_' + id + '.config.offsetTemperature', {
            type: 'state',
            common: {
                "name": "Offset Temperature",
                "type": "number",
                "unit": "K",
                "min": -10,
                "max": 10,
                "read": true,
                "write": true,
                "role": "level.offset",
                "desc": "Offset Temperature"
            },
            native: {}
        });
   }

    if(/h=[0-9]+/.test(data)) {
        adapter.setObjectNotExists('Sensor_' + id + '.humidity', {
            type: 'state',
            common: {
                "name": "Humidity",
                "type": "number",
                "unit": "%",
                "min": 0,
                "max": 100,
                "read": true,
                "write": false,
                "role": "value.humidity",
                "desc": "Humidity"
            },
            native: {}
        });

        adapter.setObjectNotExists('Sensor_' + id + '.config.offsetHumidity', {
            type: 'state',
            common: {
                "name": "Offset Humidity",
                "type": "number",
                "unit": "%",
                "min": -20,
                "max": 20,
                "read": true,
                "write": true,
                "role": "level.offset",
                "desc": "Offset Humidity"
            },
            native: {}
        });
   }

    if(/p=[0-9]+/.test(data)) {
        adapter.setObjectNotExists('Sensor_' + id + '.pressure', {
            type: 'state',
            common: {
                "name":     "Pressure",
                "type":     "number",
                "unit":     "hPa",
                "min":      300,
                "max":      1100,
                "read":     true,
                "write":    false,
                "role":     "value.pressure",
            },
            native: {}
        });

        adapter.setObjectNotExists('Sensor_' + id + '.config.offsetPressure', {
            type: 'state',
            common: {
                "name": "Offset Pressure",
                "type": "number",
                "unit": "hPa",
                "min": -100,
                "max": 100,
                "read": true,
                "write": true,
                "role": "level.offset",
                "desc": "Offset Pressure"
            },
            native: {}
        });
   }

    if(/he=[0-9]+&/.test(data)) {
        adapter.setObjectNotExists('Sensor_' + id + '.height', {
            type: 'state',
            common: {
                "name":     "Height",
                "type":     "number",
                "unit":     "m",
                "min":      -450,
                "max":      9999,
                "read":     true,
                "write":    false,
                "role":     "value.height",
            },
            native: {}
        });

        adapter.setObjectNotExists('Sensor_' + id + '.config.offsetHeight', {
            type: 'state',
            common: {
                "name": "Offset Height",
                "type": "number",
                "unit": "m",
                "min": -100,
                "max": 100,
                "read": true,
                "write": true,
                "role": "level.offset",
                "desc": "Offset Height"
            },
            native: {}
        });
   }

    if(/d=[0-9]+&/.test(data)) {
        adapter.setObjectNotExists('Sensor_' + id + '.distance', {
            type: 'state',
            common: {
                "name":     "Distance",
                "type":     "number",
                "unit":     "cm",
                "min":      -1,
                "max":      300,
                "read":     true,
                "write":    false,
                "role":     "value.distance",
            },
            native: {}
        });

        adapter.setObjectNotExists('Sensor_' + id + '.config.offsetDistance', {
            type: 'state',
            common: {
                "name": "Offset Distance",
                "type": "number",
                "unit": "cm",
                "min": -50,
                "max": 50,
                "read": true,
                "write": true,
                "role": "level.offset",
                "desc": "Offset Distance"
            },
            native: {}
        });
   }

    if(/r=[0-9]+&/.test(data)) {
        adapter.setObjectNotExists('Sensor_' + id + '.contact', {
            type: 'state',
            common: {
                "name":     "Contact",
                "type":     "boolean",
                "read":     true,
                "write":    false,
                "role":     "sensor.window",
            },
            native: {}
        });
   }
}


function setNodeState(data) {

    let nodeId;
    let voltage;
    let temperature;
    let humidity;
    let pressure;
    let height;
    let distance;
    let contact;

    nodeId = data.split(' ')[0];

    adapter.getObject('Sensor_' + nodeId, function (err, obj) {
        if(err) {
            adapter.log.info(err);
        } else {
            if(!obj){
                adapter.log.info('Create new Sensor: ' + nodeId);
                createNode(nodeId, data);
            }
        }
    });

    if (/v=[0-9]+/.test(data)) {
        voltage = parseInt((data.match(/v=[0-9]+/)[0].substring(2))) / 1000;
        adapter.setState('Sensor_' + nodeId + '.battery', { val: voltage, ack: true});
    }

    if (/t=[0-9]+/.test(data)) {
        temperature = parseInt((data.match(/t=[0-9]+/)[0].substring(2))) / 100;
        adapter.getState('Sensor_' + nodeId + '.config.offsetTemperature', function (err, state) {
            if(err) {
                adapter.log.info(err);
            } else {
                if(state){
                    temperature = temperature + state.val;
                    adapter.setState('Sensor_' + nodeId + '.config.offsetTemperature', { val: state.val, ack: true});
                }
                adapter.setState('Sensor_' + nodeId + '.temperature', { val: temperature, ack: true});
            }
        });
    }

    if (/h=[0-9]+/.test(data)) {
        humidity = parseInt((data.match(/h=[0-9]+/)[0].substring(2))) / 100;
        adapter.getState('Sensor_' + nodeId + '.config.offsetHumidity', function (err, state) {
            if(err) {
                adapter.log.info(err);
            } else {
                if(state){
                    humidity = humidity + state.val;
                    adapter.setState('Sensor_' + nodeId + '.config.offsetHumidity', { val: state.val, ack: true});
                }
                adapter.setState('Sensor_' + nodeId + '.humidity', { val: humidity, ack: true});
            }
        });
    }

    if (/p=[0-9]+/.test(data)) {
        pressure = parseInt((data.match(/p=[0-9]+/)[0].substring(2))) / 100;
        adapter.getState('Sensor_' + nodeId + '.config.offsetPressure', function (err, state) {
            if(err) {
                adapter.log.info(err);
            } else {
                if(state){
                    pressure = pressure + state.val;
                    adapter.setState('Sensor_' + nodeId + '.config.offsetPressure', { val: state.val, ack: true});
                }
                adapter.setState('Sensor_' + nodeId + '.pressure', { val: pressure, ack: true});
            }
        });
    }

    if (/he=[0-9]+&/.test(data)) {
        height = parseInt((data.match(/he=[0-9]+/)[0].substring(3))) / 100;
        adapter.getState('Sensor_' + nodeId + '.config.offsetHeight', function (err, state) {
            if(err) {
                adapter.log.info(err);
            } else {
                if(state){
                    height = height + state.val;
                    adapter.setState('Sensor_' + nodeId + '.config.offsetHeight', { val: state.val, ack: true});
                }
                adapter.setState('Sensor_' + nodeId + '.height', { val: height, ack: true});
            }
        });
    }

    if (/d=[0-9]+&/.test(data)) {
        distance = parseInt((data.match(/d=[0-9]+/)[0].substring(2))) / 100;
        adapter.getState('Sensor_' + nodeId + '.config.offsetDistance', function (err, state) {
            if(err) {
                adapter.log.info(err);
            } else {
                if(state){
                    distance = distance + state.val;
                    adapter.setState('Sensor_' + nodeId + '.config.offsetDistance', { val: state.val, ack: true});
                }
                adapter.setState('Sensor_' + nodeId + '.distance', { val: distance, ack: true});
            }
        });
    }

    if (/r=[0-9]+&/.test(data)) {
        contact = parseInt((data.match(/r=[0-9]+/)[0].substring(2))) / 100;
        if(contact === 0 || contact === 1){ 
        adapter.setState('Sensor_' + nodeId + '.contact', { val: contact, ack: true});
        } else {
            adapter.log.warn(Wrong contact state received: Sensor_' + nodeId + '.contact : ' + contact);
        }         
    }

    adapter.log.debug('data received for Node Id: ' + nodeId + ' voltage=' + voltage + ' temperature=' + temperature + ' humidity=' + humidity+ ' presure=' + pressure + ' height=' + height + ' distance=' + distance + ' contact=' + contact);

}

function main() {

    if (!adapter.config.serialport) {
        adapter.log.warn('Please define the serial port.');
        return;
    }

    let bRate = parseInt(adapter.config.baudrate);
    let sPortName = adapter.config.serialport

    const sPort = new SerialPort(sPortName, {baudRate: bRate}, function(err) {
        if (err) {
        adapter.log.info('Serialport ' + err);
        return;
        }

        adapter.log.info('Serialport is open: ' + sPortName + ' with '  + bRate + ' bit/s');
        adapter.setState('info.connection', true, true);

        const parser = sPort.pipe(new Readline({ delimiter: '\r\n' }));

        parser.on('data', function(data) {

            adapter.log.debug('Data received: ' + data);

            var dataString;
            dataString = '' + data;
            dataString = dataString.replace(/[\r]/g, '');
            if (/^[0-9]+[ ][vthp]/.test(dataString) && dataString.split(' ')[0] >= 1) {
		setNodeState(data);
            } else {
                adapter.log.info('Invalid data: ' + data);
            }
        });
    });

    adapter.subscribeStates('*');

}


// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
} 
