"use strict";

/**
 * This is the syntax rule for the ACE editor
 */

ace.define("ace/mode/ambrosia_highlight_rules",
    ["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],
    function(require, exports, module) {


        var oop = require("../lib/oop");
        var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

        var AmbrosiaFilterRules = function() {
           this.$rules = {
                "start" : [
                    {
                        token: "comment",
                        regex: /#[^\n]*/
                    },
                    {
                        token: "string",
                        regex: /"[^"]+"/
                    },
                    {
                        token: "constant.language.boolean",
                        regex: /(true|false)/
                    },
                    {
                        token: ["variable.language", "keyword.operator"],
                        regex: /(p|r|references|properties)(\.)/
                    },
                    {
                        token: "keyword.operator",
                        regex: /\./
                    },
                    {
                        token: "variable",
                        regex: /[a-zA-Z_\*]+/
                    },
                    {
                        token: "constant.numeric",
                        regex: /[0-9\.]+/
                    },{
                        token: "keyword.operator",
                        regex: /(==|!=|>=|>|<=|<|~|:|!:|!|&&|\|\|)/
                    }, {
                        token : "paren.lparen",
                        regex : /[\[({]/
                    }, {
                        token : "paren.rparen",
                        regex : /[\])}]/
                    }
                ]
            };
        };

        oop.inherits(AmbrosiaFilterRules, TextHighlightRules);

        exports.AmbrosiaFilterRules = AmbrosiaFilterRules;
});

ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});


ace.define(
    "ace/mode/ambrosia",
    ["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/ambrosia_highlight_rules"],
    function(require, exports, module) {

    var oop = require("../lib/oop");
    // defines the parent mode
    var TextMode = require("./text").Mode;
    var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;

    // defines the language specific highlighters and folding rules
    var AmbrosiaHighlightRules = require("./ambrosia_highlight_rules").AmbrosiaFilterRules;
    //var AmbrosiaFoldMode = require("./folding/mynew").MyNewFoldMode;

    var Mode = function() {
        // set everything up
        this.HighlightRules = AmbrosiaHighlightRules;
        this.$outdent = new MatchingBraceOutdent();
        //this.foldingRules = new AmbrosiaFoldMode();
    };
    oop.inherits(Mode, TextMode);

    (function() {
        // configure comment start/end characters
        this.lineCommentStart = "#";


        // special logic for indent/outdent.
        // By default ace keeps indentation of previous line
        this.getNextLineIndent = function(state, line, tab) {
            var indent = this.$getIndent(line);
            return indent;
        };

        this.checkOutdent = function(state, line, input) {
            return this.$outdent.checkOutdent(line, input);
        };

        this.autoOutdent = function(state, doc, row) {
            this.$outdent.autoOutdent(doc, row);
        };
    }).call(Mode.prototype);

    exports.Mode = Mode;
});


