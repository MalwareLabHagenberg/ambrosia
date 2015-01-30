"use strict";

/**
 * @namespace contains all known entities
 */
ambrosia_web.entity.entities = function() {
    /**
     * Represents :class:`ambrosia.model.entities.Task`
     * @constructor
     */
    function Task() {}
    Task.prototype = new A.entity.Entity();


    /**
     * Represents :class:`ambrosia.model.entities.File`
     * @constructor
     */
    function File() {}
    File.prototype = new A.entity.Entity();

    /**
     * Represents :class:`ambrosia.model.entities.ServerEndpoint`
     * @constructor
     */
    function ServerEndpoint() {}
    ServerEndpoint.prototype = new A.entity.Entity();


    return {
        entity_registry: {
            'ambrosia.model.entities.Task': Task,
            'ambrosia.model.entities.File': File,
            'ambrosia.model.entities.ServerEndpoint': ServerEndpoint
        }
    };
}();