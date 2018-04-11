define("ace/mode/tex_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/lib/lang", "ace/mode/text_highlight_rules"], function (e, t, n) {
  "use strict";
  var r = e("../lib/oop"), i = e("../lib/lang"), s = e("./text_highlight_rules").TextHighlightRules, o = function (e) {
    e || (e = "text"), this.$rules = {
      start: [{token: "comment", regex: "%.*$"}, {
        token: e,
        regex: "\\\\[$&%#\\{\\}]"
      }, {
        token: "keyword",
        regex: "\\\\(?:documentclass|usepackage|newcounter|setcounter|addtocounter|value|arabic|stepcounter|newenvironment|renewenvironment|ref|vref|eqref|pageref|label|cite[a-zA-Z]*|tag|begin|end|bibitem)\\b",
        next: "nospell"
      }, {token: "keyword", regex: "\\\\(?:[a-zA-Z0-9]+|[^a-zA-Z0-9])"}, {
        token: "paren.keyword.operator",
        regex: "[[({]"
      }, {token: "paren.keyword.operator", regex: "[\\])}]"}, {token: e, regex: "\\s+"}],
      nospell: [{token: "comment", regex: "%.*$", next: "start"}, {
        token: "nospell." + e,
        regex: "\\\\[$&%#\\{\\}]"
      }, {
        token: "keyword",
        regex: "\\\\(?:documentclass|usepackage|newcounter|setcounter|addtocounter|value|arabic|stepcounter|newenvironment|renewenvironment|ref|vref|eqref|pageref|label|cite[a-zA-Z]*|tag|begin|end|bibitem)\\b"
      }, {
        token: "keyword",
        regex: "\\\\(?:[a-zA-Z0-9]+|[^a-zA-Z0-9])",
        next: "start"
      }, {token: "paren.keyword.operator", regex: "[[({]"}, {
        token: "paren.keyword.operator",
        regex: "[\\])]"
      }, {token: "paren.keyword.operator", regex: "}", next: "start"}, {
        token: "nospell." + e,
        regex: "\\s+"
      }, {token: "nospell." + e, regex: "\\w+"}]
    }
  };
  r.inherits(o, s), t.TexHighlightRules = o
}), define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "ace/range"], function (e, t, n) {
  "use strict";
  var r = e("../range").Range, i = function () {
  };
  (function () {
    this.checkOutdent = function (e, t) {
      return /^\s+$/.test(e) ? /^\s*\}/.test(t) : !1
    }, this.autoOutdent = function (e, t) {
      var n = e.getLine(t), i = n.match(/^(\s*\})/);
      if (!i) return 0;
      var s = i[1].length, o = e.findMatchingBracket({row: t, column: s});
      if (!o || o.row == t) return 0;
      var u = this.$getIndent(e.getLine(o.row));
      e.replace(new r(t, 0, t, s - 1), u)
    }, this.$getIndent = function (e) {
      return e.match(/^\s*/)[0]
    }
  }).call(i.prototype), t.MatchingBraceOutdent = i
}), define("ace/mode/tex", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/text_highlight_rules", "ace/mode/tex_highlight_rules", "ace/mode/matching_brace_outdent"], function (e, t, n) {
  "use strict";
  var r = e("../lib/oop"), i = e("./text").Mode, s = e("./text_highlight_rules").TextHighlightRules,
    o = e("./tex_highlight_rules").TexHighlightRules, u = e("./matching_brace_outdent").MatchingBraceOutdent,
    a = function (e) {
      e ? this.HighlightRules = s : this.HighlightRules = o, this.$outdent = new u, this.$behaviour = this.$defaultBehaviour
    };
  r.inherits(a, i), function () {
    this.lineCommentStart = "%", this.getNextLineIndent = function (e, t, n) {
      return this.$getIndent(t)
    }, this.allowAutoInsert = function () {
      return !1
    }, this.$id = "ace/mode/tex"
  }.call(a.prototype), t.Mode = a
});
(function () {
  window.require(["ace/mode/tex"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
