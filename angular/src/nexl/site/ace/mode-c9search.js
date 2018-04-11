define("ace/mode/c9search_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/lib/lang", "ace/mode/text_highlight_rules"], function (e, t, n) {
  "use strict";

  function o(e, t) {
    try {
      return new RegExp(e, t)
    } catch (n) {
    }
  }

  var r = e("../lib/oop"), i = e("../lib/lang"), s = e("./text_highlight_rules").TextHighlightRules, u = function () {
    this.$rules = {
      start: [{
        tokenNames: ["c9searchresults.constant.numeric", "c9searchresults.text", "c9searchresults.text", "c9searchresults.keyword"],
        regex: /(^\s+[0-9]+)(:)(\d*\s?)([^\r\n]+)/,
        onMatch: function (e, t, n) {
          var r = this.splitRegex.exec(e), i = this.tokenNames,
            s = [{type: i[0], value: r[1]}, {type: i[1], value: r[2]}];
          r[3] && (r[3] == " " ? s[1] = {type: i[1], value: r[2] + " "} : s.push({type: i[1], value: r[3]}));
          var o = n[1], u = r[4], a, f = 0;
          if (o && o.exec) {
            o.lastIndex = 0;
            while (a = o.exec(u)) {
              var l = u.substring(f, a.index);
              f = o.lastIndex, l && s.push({type: i[2], value: l});
              if (a[0]) s.push({type: i[3], value: a[0]}); else if (!l) break
            }
          }
          return f < u.length && s.push({type: i[2], value: u.substr(f)}), s
        }
      }, {
        regex: "^Searching for [^\\r\\n]*$", onMatch: function (e, t, n) {
          var r = e.split("\x01");
          if (r.length < 3) return "text";
          var s, u, a = 0, f = [{value: r[a++] + "'", type: "text"}, {value: u = r[a++], type: "text"}, {
            value: "'" + r[a++],
            type: "text"
          }];
          r[2] !== " in" && f.push({value: "'" + r[a++] + "'", type: "text"}, {
            value: r[a++],
            type: "text"
          }), f.push({
            value: " " + r[a++] + " ",
            type: "text"
          }), r[a + 1] ? (s = r[a + 1], f.push({value: "(" + r[a + 1] + ")", type: "text"}), a += 1) : a -= 1;
          while (a++ < r.length) r[a] && f.push({value: r[a], type: "text"});
          u && (/regex/.test(s) || (u = i.escapeRegExp(u)), /whole/.test(s) && (u = "\\b" + u + "\\b"));
          var l = u && o("(" + u + ")", / sensitive/.test(s) ? "g" : "ig");
          return l && (n[0] = t, n[1] = l), f
        }
      }, {regex: "^(?=Found \\d+ matches)", token: "text", next: "numbers"}, {
        token: "string",
        regex: "^\\S:?[^:]+",
        next: "numbers"
      }], numbers: [{regex: "\\d+", token: "constant.numeric"}, {regex: "$", token: "text", next: "start"}]
    }, this.normalizeRules()
  };
  r.inherits(u, s), t.C9SearchHighlightRules = u
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
}), define("ace/mode/folding/c9search", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function (e, t, n) {
  "use strict";
  var r = e("../../lib/oop"), i = e("../../range").Range, s = e("./fold_mode").FoldMode, o = t.FoldMode = function () {
  };
  r.inherits(o, s), function () {
    this.foldingStartMarker = /^(\S.*:|Searching for.*)$/, this.foldingStopMarker = /^(\s+|Found.*)$/, this.getFoldWidgetRange = function (e, t, n) {
      var r = e.doc.getAllLines(n), s = r[n], o = /^(Found.*|Searching for.*)$/, u = /^(\S.*:|\s*)$/,
        a = o.test(s) ? o : u, f = n, l = n;
      if (this.foldingStartMarker.test(s)) {
        for (var c = n + 1, h = e.getLength(); c < h; c++) if (a.test(r[c])) break;
        l = c
      } else if (this.foldingStopMarker.test(s)) {
        for (var c = n - 1; c >= 0; c--) {
          s = r[c];
          if (a.test(s)) break
        }
        f = c
      }
      if (f != l) {
        var p = s.length;
        return a === o && (p = s.search(/\(Found[^)]+\)$|$/)), new i(f, p, l, 0)
      }
    }
  }.call(o.prototype)
}), define("ace/mode/c9search", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/c9search_highlight_rules", "ace/mode/matching_brace_outdent", "ace/mode/folding/c9search"], function (e, t, n) {
  "use strict";
  var r = e("../lib/oop"), i = e("./text").Mode, s = e("./c9search_highlight_rules").C9SearchHighlightRules,
    o = e("./matching_brace_outdent").MatchingBraceOutdent, u = e("./folding/c9search").FoldMode, a = function () {
      this.HighlightRules = s, this.$outdent = new o, this.foldingRules = new u
    };
  r.inherits(a, i), function () {
    this.getNextLineIndent = function (e, t, n) {
      var r = this.$getIndent(t);
      return r
    }, this.checkOutdent = function (e, t, n) {
      return this.$outdent.checkOutdent(t, n)
    }, this.autoOutdent = function (e, t, n) {
      this.$outdent.autoOutdent(t, n)
    }, this.$id = "ace/mode/c9search"
  }.call(a.prototype), t.Mode = a
});
(function () {
  window.require(["ace/mode/c9search"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
