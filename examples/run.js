var  mqtt2opc = require("../mqtt2opcua").run;
var  Events = require('events').EventEmitter;

var opcua = require("node-opcua");

forward = new Events();
backward = new Events();

// Set up forward and reverse data conversion functions
// These are based on topic path - the finer grained pattern will be used.
// Examples below


function isInt(number) {
        if(!/^["|']{0,1}[-]{0,1}\d{0,}(\.{0,1}\d+)["|']{0,1}$/.test(number)) return false;
        return !(number - parseInt(number));
    }

function isFloat(number) {
        return(/^[-+]?[0-9]*[.,][0-9]+(?:[eE][-+]?[0-9]+)?$/.test(number)) 
    }

function isFloat2(number) {
        if(!/^["|']{0,1}[-]{0,1}\d{0,}(\.{0,1}\d+)["|']{0,1}$/.test(number)) return false;
        if(number === "0.0") return true;
        return number - parseInt(number) ? true : false;
    }

forward.on("Biocad-IOT/+/+", function(payload) {
    //console.log('on: ', payload.toString());

   // const data = {};

   //  if (isFloat(payload)) {
   //      //console.log('float: ', payload.toFloat());
   //      data.type = opcua.DataType.Double;
   //      data.parse = (e) => parseFloat(e);
   // } else if (isInt(payload)) {
   //      data.type = "UInt32";
   //      data.parse = (e) => parseInt(e);
   // } else {
   //      //console.log('string: ', payload.toString());
   //      data.type = "String";
   //      data.parse = (e) => String(e);
   // }
   //console.log(data.type);
    return {
            dataType: "String",
            value: String(payload)
         };
});

backward.on("Biocad-IOT/+/+", function(variant) {
       console.log('backward');

            return {
                topic:variant.topic,
                payload:variant.value
            };
});

options = {
    opcName:"/MQTT-OPCUA",
    opcHost:"localhost",
    opcPort:51215,
    mqttHost:process.env.MQTTHOST || "localhost",
    mqttPort:"1883",
    mqttUsername:process.env.MQTTNAME || "OPCUA",
    mqttPassword:process.env.MQTTPASS || "",
    mqttOpcJson:'/mqtt/opc/json',
    opcMqtt:'/opc/mqtt',
    debug:true,
    roundtrip:false,	// set to true to limit updates to onMessage (i.e. validate an accuator is set)
    forward:forward,	// data converter - mqtt -> opcua
    backward:backward,	// data converter - opcua -> mqtt
    topics:['Biocad-IOT/+/mqtt/opc/json'] // Customize to override. These are the default so uncessary.
};

var server = new mqtt2opc(options);