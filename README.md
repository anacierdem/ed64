# ED64 Tools

This repository contains essential tools to be used with everdrive64.

## Loader

Use it to upload your z64 images to ED64. Usage;

First, make sure you have node.js (>= 7.6).

Install globally;

    npm install -g ed64

And invoke;

    loader64 [path to your file]

Install locally;

    npm install ed64

And invoke;

    node ./loader.js [path to your file]

You can continue monitoring serial communication after boot by providing `--keep-alive`.

    loader64 [path to your file] --keep-alive

Tested to be working with OS v2.12

Experimental read mode (will print 2m of data on console);

    loader64 --read