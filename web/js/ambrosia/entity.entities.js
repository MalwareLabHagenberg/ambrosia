"use strict";

ambrosia.entity.entities = function() {
    function Process() {}
    Process.prototype = new A.entity.Entity();


    function File() {}
    File.prototype = new A.entity.Entity();


    function ServerEndpoint() {}
    ServerEndpoint.prototype = new A.entity.Entity();


    return {
        entity_registry: {
            'ambrosia.model.entities.Process': Process,
            'ambrosia.model.entities.File': File,
            'ambrosia.model.entities.ServerEndpoint': ServerEndpoint
        }
    };
}();