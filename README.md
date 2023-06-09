The `generator.mjs` script creates a tree of commonjs and esm files.
The files only include require or imports statements and this is meant to
compare the performance of both module systems.

My tests using code generated by this package and real world examples show
that esm is 10-70% slower than cjs. While this test is contrived I found the
results counter intuitive, I expected esm to be the clear winner over cjs.

esm imports are syntax statements that can be evaulated without executing the
script. A JavaScript engine should be able to read all import statements and
load dependencies in parallel. Both IO and parsing could be parallel.

commonjs require function is a normal JavaScript function and a engine must
parse and execute sequentially, each `require` blocking on IO and executing the
tree of required dependencies sequentially.

While the tests in this package are contrived I've seen similar results
testing `@aws-sdk/`. The sdk has dist-cjs and dist-es compiled using
typescript's module `commonjs` and `esnext` respectivly. dist-es cannot be run
in node as-is so I wrote a set of codemod scripts to add extensions,
`index.js`, json assertions, and conditional export to the code which allows it
to run in node. `require('@aws-sdk/client-s3')` was 1.57 times faster than
`import '@aws-sdk/client-s3'`;


# Running these tests

Call the generator to create a tree with five levels with six children per
node.
```
npm start 5 6
> cjs-esm-bench@1.0.0 start
> tsx generator.mts 5 6
```

```
hyperfine --warmup 3 'node bench-5x6/index.mjs' 'node bench-5x6/index.cjs'
Benchmark 1: node bench-5x6/index.mjs
  Time (mean ± σ):     621.0 ms ±  24.8 ms    [User: 914.7 ms, System: 94.4 ms]
  Range (min … max):   588.2 ms … 663.4 ms    10 runs

Benchmark 2: node bench-5x6/index.cjs
  Time (mean ± σ):     364.0 ms ±   7.6 ms    [User: 444.3 ms, System: 53.1 ms]
  Range (min … max):   354.8 ms … 379.0 ms    10 runs

Summary
  'node bench-5x6/index.cjs' ran
    1.71 ± 0.08 times faster than 'node bench-5x6/index.mjs'
```
