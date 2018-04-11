define("ace/snippets/haskell", ["require", "exports", "module"], function (e, t, n) {
  "use strict";
  t.snippetText = "snippet lang\n	{-# LANGUAGE ${1:OverloadedStrings} #-}\nsnippet info\n	-- |\n	-- Module      :  ${1:Module.Namespace}\n	-- Copyright   :  ${2:Author} ${3:2011-2012}\n	-- License     :  ${4:BSD3}\n	--\n	-- Maintainer  :  ${5:email@something.com}\n	-- Stability   :  ${6:experimental}\n	-- Portability :  ${7:unknown}\n	--\n	-- ${8:Description}\n	--\nsnippet import\n	import           ${1:Data.Text}\nsnippet import2\n	import           ${1:Data.Text} (${2:head})\nsnippet importq\n	import qualified ${1:Data.Text} as ${2:T}\nsnippet inst\n	instance ${1:Monoid} ${2:Type} where\n		${3}\nsnippet type\n	type ${1:Type} = ${2:Type}\nsnippet data\n	data ${1:Type} = ${2:$1} ${3:Int}\nsnippet newtype\n	newtype ${1:Type} = ${2:$1} ${3:Int}\nsnippet class\n	class ${1:Class} a where\n		${2}\nsnippet module\n	module `substitute(substitute(expand('%:r'), '[/\\\\]','.','g'),'^\\%(\\l*\\.\\)\\?','','')` (\n	)	where\n	`expand('%') =~ 'Main' ? \"\\n\\nmain = do\\n  print \\\"hello world\\\"\" : \"\"`\n\nsnippet const\n	${1:name} :: ${2:a}\n	$1 = ${3:undefined}\nsnippet fn\n	${1:fn} :: ${2:a} -> ${3:a}\n	$1 ${4} = ${5:undefined}\nsnippet fn2\n	${1:fn} :: ${2:a} -> ${3:a} -> ${4:a}\n	$1 ${5} = ${6:undefined}\nsnippet ap\n	${1:map} ${2:fn} ${3:list}\nsnippet do\n	do\n		\nsnippet \u03bb\n	\\${1:x} -> ${2}\nsnippet \\\n	\\${1:x} -> ${2}\nsnippet <-\n	${1:a} <- ${2:m a}\nsnippet \u2190\n	${1:a} <- ${2:m a}\nsnippet ->\n	${1:m a} -> ${2:a}\nsnippet \u2192\n	${1:m a} -> ${2:a}\nsnippet tup\n	(${1:a}, ${2:b})\nsnippet tup2\n	(${1:a}, ${2:b}, ${3:c})\nsnippet tup3\n	(${1:a}, ${2:b}, ${3:c}, ${4:d})\nsnippet rec\n	${1:Record} { ${2:recFieldA} = ${3:undefined}\n				, ${4:recFieldB} = ${5:undefined}\n				}\nsnippet case\n	case ${1:something} of\n		${2} -> ${3}\nsnippet let\n	let ${1} = ${2}\n	in ${3}\nsnippet where\n	where\n		${1:fn} = ${2:undefined}\n", t.scope = "haskell"
});
(function () {
  window.require(["ace/snippets/haskell"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
