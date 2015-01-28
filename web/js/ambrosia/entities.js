"use strict";

function Process(){
}
Process.prototype = new Entity();


function File(){
}
File.prototype = new Entity();

function ServerEndpoint(){
}
ServerEndpoint.prototype = new Entity();


Entity.entity_registry = {
    'ambrosia.model.entities.Process': Process,
    'ambrosia.model.entities.File': File,
    'ambrosia.model.entities.ServerEndpoint': ServerEndpoint
};
