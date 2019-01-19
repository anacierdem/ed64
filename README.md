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

## ED64 rebootable example

In the `./src` folder you can find a N64 program capable of rebooting on loader upload. To be able to use it;

- Make sure you have node.js (>= 7.6) and docker installed on your machine.
- Install vscode.
- Run `npm install` on this repository's root.
- Connect your Everdrive64 via USB and turn on your N64.
- Open this folder with vscode and hit F5.
- `libdragon` toolchain will be installed automatically as a docker container (named ed64) on your computer and will build, link and run the project.
- Stop and restart the project via vscode.
- Voila! You have a re-uploadable executable with print debugging.