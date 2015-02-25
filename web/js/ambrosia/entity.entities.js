"use strict";

/**
 * @namespace contains all known entities
 */
ambrosia_web.entity.entities = function() {
    /**
     * Represents :class:`ambrosia.model.entities.Task`
     * @constructor
     */
    var Task = Class('ambrosia_web.entity.entities.Task', A.entity.Entity, {});

    /**
     * Represents :class:`ambrosia.model.entities.File`
     * @constructor
     */
    var File = Class('ambrosia_web.entity.entities.File', A.entity.Entity, {});

    /**
     * Represents :class:`ambrosia.model.entities.App`
     * @constructor
     */
    var App = Class('ambrosia_web.entity.entities.App', A.entity.Entity, {});

    /**
     * Represents :class:`ambrosia.model.entities.ServerEndpoint`
     * @constructor
     */
    var ServerEndpoint = Class('ambrosia_web.entity.entities.ServerEndpoint', A.entity.Entity, {});

    return {
        entity_registry: {
            'ambrosia.model.entities.Task': Task,
            'ambrosia.model.entities.File': File,
            'ambrosia.model.entities.ServerEndpoint': ServerEndpoint,
            'ambrosia.model.entities.App': App
        }
    };
}();