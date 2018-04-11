define("ace/mode/elm_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (e, t, n) {
  "use strict";
  var r = e("../lib/oop"), i = e("./text_highlight_rules").TextHighlightRules, s = function () {
    var e = this.createKeywordMapper({keyword: "as|case|class|data|default|deriving|do|else|export|foreign|hiding|jsevent|if|import|in|infix|infixl|infixr|instance|let|module|newtype|of|open|then|type|where|_|port|\u03bb"}, "identifier"),
      t = /\\(\d+|['"\\&trnbvf])/, n = /[a-z_]/.source, r = /[A-Z]/.source, i = /[a-z_A-Z0-9']/.source;
    this.$rules = {
      start: [{token: "string.start", regex: '"', next: "string"}, {
        token: "string.character",
        regex: "'(?:" + t.source + "|.)'?"
      }, {
        regex: /0(?:[xX][0-9A-Fa-f]+|[oO][0-7]+)|\d+(\.\d+)?([eE][-+]?\d*)?/,
        token: "constant.numeric"
      }, {token: "comment", regex: "--.*"}, {
        token: "keyword",
        regex: /\.\.|\||:|=|\\|"|->|<-|\u2192/
      }, {token: "keyword.operator", regex: /[-!#$%&*+.\/<=>?@\\^|~:\u03BB\u2192]+/}, {
        token: "operator.punctuation",
        regex: /[,;`]/
      }, {
        regex: r + i + "+\\.?", token: function (e) {
          return e[e.length - 1] == "." ? "entity.name.function" : "constant.language"
        }
      }, {
        regex: "^" + n + i + "+", token: function (e) {
          return "constant.language"
        }
      }, {token: e, regex: "[\\w\\xff-\\u218e\\u2455-\\uffff]+\\b"}, {
        regex: "{-#?",
        token: "comment.start",
        onMatch: function (e, t, n) {
          return this.next = e.length == 2 ? "blockComment" : "docComment", this.token
        }
      }, {token: "variable.language", regex: /\[markdown\|/, next: "markdown"}, {
        token: "paren.lparen",
        regex: /[\[({]/
      }, {token: "paren.rparen", regex: /[\])}]/}],
      markdown: [{regex: /\|\]/, next: "start"}, {defaultToken: "string"}],
      blockComment: [{regex: "{-", token: "comment.start", push: "blockComment"}, {
        regex: "-}",
        token: "comment.end",
        next: "pop"
      }, {defaultToken: "comment"}],
      docComment: [{regex: "{-", token: "comment.start", push: "docComment"}, {
        regex: "-}",
        token: "comment.end",
        next: "pop"
      }, {defaultToken: "doc.comment"}],
      string: [{token: "constant.language.escape", regex: t}, {
        token: "text",
        regex: /\\(\s|$)/,
        next: "stringGap"
      }, {token: "string.end", regex: '"', next: "start"}, {defaultToken: "string"}],
      stringGap: [{token: "text", regex: /\\/, next: "string"}, {token: "error", regex: "", next: "start"}]
    }, this.normalizeRules()
  };
  r.inherits(s, i), t.ElmHighlightRules = s
}), define("ace/mode/folding/cstyle", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function (e, t, n) {
  "use strict";
  var r = e("../../lib/oop"), i = e("../../range").Range, s = e("./fold_mode").FoldMode, o = t.FoldMode = function (e) {
    e && (this.foldingStartMarker = new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + e.start)), this.foldingStopMarker = new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + e.end)))
  };
  r.inherits(o, s), function () {
    this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/, this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/, this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/, this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/, this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/, this._getFoldWidgetBase = this.getFoldWidget, this.getFoldWidget = function (e, t, n) {
      var r = e.getLine(n);
      if (this.singleLineBlockCommentRe.test(r) && !this.startRegionRe.test(r) && !this.tripleStarBlockCommentRe.test(r)) return "";
      var i = this._getFoldWidgetBase(e, t, n);
      return !i && this.startRegionRe.test(r) ? "start" : i
    }, this.getFoldWidgetRange = function (e, t, n, r) {
      var i = e.getLine(n);
      if (this.startRegionRe.test(i)) return this.getCommentRegionBlock(e, i, n);
      var s = i.match(this.foldingStartMarker);
      if (s) {
        var o = s.index;
        if (s[1]) return this.openingBracketBlock(e, s[1], n, o);
        var u = e.getCommentFoldRange(n, o + s[0].length, 1);
        return u && !u.isMultiLine() && (r ? u = this.getSectionRange(e, n) : t != "all" && (u = null)), u
      }
      if (t === "markbegin") return;
      var s = i.match(this.foldingStopMarker);
      if (s) {
        var o = s.index + s[0].length;
        return s[1] ? this.closingBracketBlock(e, s[1], n, o) : e.getCommentFoldRange(n, o, -1)
      }
    }, this.getSectionRange = function (e, t) {
      var n = e.getLine(t), r = n.search(/\S/), s = t, o = n.length;
      t += 1;
      var u = t, a = e.getLength();
      while (++t < a) {
        n = e.getLine(t);
        var f = n.search(/\S/);
        if (f === -1) continue;
        if (r > f) break;
        var l = this.getFoldWidgetRange(e, "all", t);
        if (l) {
          if (l.start.row <= s) break;
          if (l.isMultiLine()) t = l.end.row; else if (r == f) break
        }
        u = t
      }
      return new i(s, o, u, e.getLine(u).length)
    }, this.getCommentRegionBlock = function (e, t, n) {
      var r = t.search(/\s*$/), s = e.getLength(), o = n, u = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/, a = 1;
      while (++n < s) {
        t = e.getLine(n);
        var f = u.exec(t);
        if (!f) continue;
        f[1] ? a-- : a++;
        if (!a) break
      }
      var l = n;
      if (l > o) return new i(o, r, l, t.length)
    }
  }.call(o.prototype)
}), define("ace/mode/elm", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/elm_highlight_rules", "ace/mode/folding/cstyle"], function (e, t, n) {
  "use strict";
  var r = e("../lib/oop"), i = e("./text").Mode, s = e("./elm_highlight_rules").ElmHighlightRules,
    o = e("./folding/cstyle").FoldMode, u = function () {
      this.HighlightRules = s, this.foldingRules = new o, this.$behaviour = this.$defaultBehaviour
    };
  r.inherits(u, i), function () {
    this.lineCommentStart = "--", this.blockComment = {start: "{-", end: "-}", nestable: !0}, this.$id = "ace/mode/elm"
  }.call(u.prototype), t.Mode = u
});
(function () {
  window.require(["ace/mode/elm"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
