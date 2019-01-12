# ED64 Tools

This repository contains essential tools to be used with everdrive64.

## Loader

Use it to upload your z64 images to ED64. Usage;

Install globally;

    npm install -g ed64

And invoke;

    loader64 [path to your file]

You can continue monitoring serial communication after boot by providing `--keep-alive`.

    loader64 [path to your file] --keep-alive

Tested to be working with OS v2.12 for images