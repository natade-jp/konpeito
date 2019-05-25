# npm install
```
npm install -g npm
npm install --save-dev rollup
npm install --save-dev rollup-plugin-buble
npm install --save-dev rollup-plugin-uglify
npm install --save-dev rollup-plugin-uglify-es
npm install --save-dev acorn@^6.0.0
npm install --save-dev eslint
npm install --save-dev esdoc
npm install --save-dev esdoc-standard-plugin
npm install --save-dev jest
npm install --save-dev babel-jest
npm install --save-dev babel-plugin-transform-es2015-modules-commonjs
```

# npm list
```
npm list --depth=0
konpeito
+-- acorn@6.0.0
+-- babel-jest@24.8.0
+-- babel-plugin-transform-es2015-modules-commonjs@6.26.2
+-- esdoc@1.1.0
+-- esdoc-standard-plugin@1.0.0
+-- jest@24.8.0
+-- rollup@1.11.3
+-- rollup-plugin-buble@0.19.6
+-- rollup-plugin-uglify@6.0.2
`-- rollup-plugin-uglify-es@0.0.1
```

# note

## ESdoc error type 1

An error occurs if the following is written.
```
@param {abd : ?(number|string)}
```

```
SyntaxError: Invalid regular expression: /[~](string$/: Unterminated group
    at new RegExp (<anonymous>)
    at ClassDocBuilder._findByName (\konpeito\node_modules\esdoc-publish-html-plugin\out\src\Builder\DocBuilder.js:117:20)
```

The error will not occur by rewriting as follows.
```
@param {test : (?number|?string)}
```

Or, rewrite the esdoc code.

### old
```
    const regexp = new RegExp(`[~]${name.replace('*', '\\*')}$`); // if name is `*`, need to escape.
    if (kind) {
```
### new
```
    const regexp = new RegExp(`[~]${name.replace(/[\(\)]/g, "").replace('*', '\\*')}$`); // if name is `*`, need to escape.
    if (kind) {
```

## ESdoc error type 2

An error occurs if the following is written.
```
@param {function(integer, string): integer}
```

```
SyntaxError: Invalid function type annotation: `function(Array<Complex>): Array<Complex>`
    at inner.split.map.v (\konpeito\node_modules\esdoc-publish-html-plugin\out\src\Builder\DocBuilder.js:675:39)
```

The error will not occur by rewriting as follows.
```
@param {function(value : integer, name : string): integer}
```

However, this method is not compatible with TypeScript.
And rewrite the esdoc code.

### old
```
    // e.g. function(a: number, b: string): boolean
    matched = typeName.match(/function *\((.*?)\)(.*)/);
    if (matched) {
```
### new
```
    let typeName2 = "";
    if(is_function) {
      let prm_num = 1;
      const prm_rep = function(text) {return text +" prm" + prm_num++ + ":"}
      typeName2 = typeName.replace(/\(|,/g, prm_rep);
    }
    matched = typeName2.match(/function *\((.*?)\)(.*)/);
    if (matched) {
```

With this method, no error will occur but you will not be able to use the esdoc service.
