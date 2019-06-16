# install
```
rm -rf node_modules
rm package-lock.json
npm cache clear --force
npm install
```

# scripts
```
# Debug mode
npm run dev
# /html/examples/demos/ES6/
# You will be able to use the "Math.konpeito" on the console.

# Create scripts for distribution
npm run build
# /build/konpeito.module.mjs
# /build/konpeito.module.min.mjs
# /build/konpeito.umd.mjs
# /build/konpeito.module.min.mjs

# Create documents.
npm run doc
# /docs/

# Create typescript definition file.
npm run dts
# /build/konpeito.d.ts

# Run the test.
npm run test
# ^(/src/).*(.test.mjs)$

# Test only one file.
npm run test_target -- Matrix
npm run test_target -- Complex
npm run test_target -- LinearAlgebra
...
```

# list
```
> npm list --depth=0
konpeito@0.1.8
+-- acorn@6.1.1
+-- babel-jest@24.8.0
+-- babel-plugin-transform-es2015-modules-commonjs@6.26.2
+-- esdoc@1.1.0
+-- esdoc-standard-plugin@1.0.0
+-- jest@24.8.0
+-- jsdoc@3.6.2
+-- jsdoc-export-default-interop@0.3.1
+-- rollup@1.15.5
+-- rollup-plugin-buble@0.19.6
+-- rollup-plugin-uglify@6.0.2
+-- rollup-plugin-uglify-es@0.0.1
`-- tsd-jsdoc@2.3.0
```

# purpose
```
# Packaging the script described in the ES6.
npm install --save-dev rollup
npm install --save-dev rollup-plugin-buble
npm install --save-dev rollup-plugin-uglify
npm install --save-dev rollup-plugin-uglify-es
npm install --save-dev acorn

# For error check of ES6.
npm install --save-dev eslint

# For document creation of ES6.
npm install --save-dev esdoc
npm install --save-dev esdoc-standard-plugin

# For unit test of ES6.
npm install --save-dev jest
npm install --save-dev babel-jest
npm install --save-dev babel-plugin-transform-es2015-modules-commonjs

# For typescript type definition creation.
npm install --save-dev jsdoc
npm install --save-dev jsdoc-export-default-interop
npm install --save-dev tsd-jsdoc
```
