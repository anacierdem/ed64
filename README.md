# ED64 Tools

[![Build](https://github.com/anacierdem/ed64/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/anacierdem/ed64/actions/workflows/ci.yml?branch=master)

This repository contains essential tools to be used with everdrive64 (v3 and x7) and `libdragon`.
Libdragon is not a requirement as long as your ROM supports the UNFLoader protocol.
Tested to be working with OS v3.05 on an everdrive64 v3. Should also work on an X7.

## Loader

Use this to upload your z64 images to ED64. Make sure you have node.js (>= 14) and install globally;

    npm install -g ed64

Or you can grap the pre-built executable from the releases and put it somewhere on your PATH if you are on Windows. Then you won't need node.js on you machine.

Then invoke the loader;

    loader64 <rom file> [flags]

You can start listening for UNFLoader style text messages and pipe them to the stdout after boot by providing `--keep-alive`.

    loader64 <rom file> --keep-alive

## ED64 example

In the `./src` folder you can find a N64 program. To be able to use it;

- Make sure you have node.js (>= 14) and docker installed on your machine.
- Install vscode.
- Run `npm install` on this repository's root.
- `libdragon` toolchain will be installed automatically as a docker container (named ed64) on your computer.
- Connect your Everdrive64 via USB and turn on your N64.
- Open this folder with vscode and hit F5.
- Voila! You have an executable with print debugging.

When using `libdragon` all standard error will go serial over USB.

### Creating a new libdragon project

Create a new NPM project;

    npm init

install `ed64`;

    npm i ed64 --save

Add following to your NPM scripts;

    "prepare": "libdragon install"

This will install and initialize libdragon when you do `npm i` for your repository.

To update libdragon, run;

    npm i libdragon@latest --save
    npm i

The second `npm i` will actually download the docker container and prepare it, thanks to the `prepare` script.

To invoke the locally installed loader;

    npx loader64 <rom file> [flags]

## Tasklist

- [x] Implement ROM loader.
- [x] Implement UNFloader protocol on js and use UNFloader as the usblib thus adding extended cartridge support.
- [ ] Add screen capture & dump functionality.
- [ ] Add a GDB stub for real-time debugging & hot replacement.
- [ ] Implement direct SD card access via `libdragon` filesystem API.
- [ ] Implement a debugger for debugging the RSP.

## Development

You can run `npm run format` to automatically check and fix javascript code style.

To invoke the local version do;

    npx loader64 <rom file> [flags]

## Funding

If this tool helped you, consider supporting its development by sponsoring it!
