define("ace/split", ["require", "exports", "module", "ace/lib/oop", "ace/lib/lang", "ace/lib/event_emitter", "ace/editor", "ace/virtual_renderer", "ace/edit_session"], function (e, t, n) {
  "use strict";
  var r = e("./lib/oop"), i = e("./lib/lang"), s = e("./lib/event_emitter").EventEmitter, o = e("./editor").Editor,
    u = e("./virtual_renderer").VirtualRenderer, a = e("./edit_session").EditSession, f = function (e, t, n) {
      this.BELOW = 1, this.BESIDE = 0, this.$container = e, this.$theme = t, this.$splits = 0, this.$editorCSS = "", this.$editors = [], this.$orientation = this.BESIDE, this.setSplits(n || 1), this.$cEditor = this.$editors[0], this.on("focus", function (e) {
        this.$cEditor = e
      }.bind(this))
    };
  (function () {
    r.implement(this, s), this.$createEditor = function () {
      var e = document.createElement("div");
      e.className = this.$editorCSS, e.style.cssText = "position: absolute; top:0px; bottom:0px", this.$container.appendChild(e);
      var t = new o(new u(e, this.$theme));
      return t.on("focus", function () {
        this._emit("focus", t)
      }.bind(this)), this.$editors.push(t), t.setFontSize(this.$fontSize), t
    }, this.setSplits = function (e) {
      var t;
      if (e < 1) throw"The number of splits have to be > 0!";
      if (e == this.$splits) return;
      if (e > this.$splits) {
        while (this.$splits < this.$editors.length && this.$splits < e) t = this.$editors[this.$splits], this.$container.appendChild(t.container), t.setFontSize(this.$fontSize), this.$splits++;
        while (this.$splits < e) this.$createEditor(), this.$splits++
      } else while (this.$splits > e) t = this.$editors[this.$splits - 1], this.$container.removeChild(t.container), this.$splits--;
      this.resize()
    }, this.getSplits = function () {
      return this.$splits
    }, this.getEditor = function (e) {
      return this.$editors[e]
    }, this.getCurrentEditor = function () {
      return this.$cEditor
    }, this.focus = function () {
      this.$cEditor.focus()
    }, this.blur = function () {
      this.$cEditor.blur()
    }, this.setTheme = function (e) {
      this.$editors.forEach(function (t) {
        t.setTheme(e)
      })
    }, this.setKeyboardHandler = function (e) {
      this.$editors.forEach(function (t) {
        t.setKeyboardHandler(e)
      })
    }, this.forEach = function (e, t) {
      this.$editors.forEach(e, t)
    }, this.$fontSize = "", this.setFontSize = function (e) {
      this.$fontSize = e, this.forEach(function (t) {
        t.setFontSize(e)
      })
    }, this.$cloneSession = function (e) {
      var t = new a(e.getDocument(), e.getMode()), n = e.getUndoManager();
      return t.setUndoManager(n), t.setTabSize(e.getTabSize()), t.setUseSoftTabs(e.getUseSoftTabs()), t.setOverwrite(e.getOverwrite()), t.setBreakpoints(e.getBreakpoints()), t.setUseWrapMode(e.getUseWrapMode()), t.setUseWorker(e.getUseWorker()), t.setWrapLimitRange(e.$wrapLimitRange.min, e.$wrapLimitRange.max), t.$foldData = e.$cloneFoldData(), t
    }, this.setSession = function (e, t) {
      var n;
      t == null ? n = this.$cEditor : n = this.$editors[t];
      var r = this.$editors.some(function (t) {
        return t.session === e
      });
      return r && (e = this.$cloneSession(e)), n.setSession(e), e
    }, this.getOrientation = function () {
      return this.$orientation
    }, this.setOrientation = function (e) {
      if (this.$orientation == e) return;
      this.$orientation = e, this.resize()
    }, this.resize = function () {
      var e = this.$container.clientWidth, t = this.$container.clientHeight, n;
      if (this.$orientation == this.BESIDE) {
        var r = e / this.$splits;
        for (var i = 0; i < this.$splits; i++) n = this.$editors[i], n.container.style.width = r + "px", n.container.style.top = "0px", n.container.style.left = i * r + "px", n.container.style.height = t + "px", n.resize()
      } else {
        var s = t / this.$splits;
        for (var i = 0; i < this.$splits; i++) n = this.$editors[i], n.container.style.width = e + "px", n.container.style.top = i * s + "px", n.container.style.left = "0px", n.container.style.height = s + "px", n.resize()
      }
    }
  }).call(f.prototype), t.Split = f
}), define("ace/ext/split", ["require", "exports", "module", "ace/split"], function (e, t, n) {
  "use strict";
  n.exports = e("../split")
});
(function () {
  window.require(["ace/ext/split"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
