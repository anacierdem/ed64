# ED64 Tools

[![Build Status](https://travis-ci.org/anacierdem/ed64.svg?branch=master)](https://travis-ci.org/anacierdem/ed64)

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

    node ./node_modules/ed64/loader.js [path to your file]

Or on this repository's root;

    node ./loader.js [path to your file]

You can continue monitoring serial communication after boot by providing `--keep-alive`.

    loader64 [path to your file] --keep-alive

This will print the communication on the console as well as starting a socket connection on the port given by `--server-port=1338`. If port is not given it defaults to 1337. This is the point of communication with say GDB.

Tested to be working with OS v2.12 on an everdrive64 v3.

## ED64 rebootable example

In the `./src` folder you can find a N64 program capable of rebooting on loader upload. To be able to use it;

- Make sure you have node.js (>= 7.6) and docker installed on your machine.
- Install vscode.
- Run `npm install` on this repository's root.
- `libdragon` toolchain will be installed automatically as a docker container (named ed64) on your computer.
- Connect your Everdrive64 via USB and turn on your N64.
- Open this folder with vscode and hit F5.
- Stop and restart the project via vscode.
- Voila! You have a re-uploadable executable with print debugging.

When calling `everdrive_init(true)`, the first parameter determines whether to hook to stdio or not. If you pass `true`, all standard outputs will go serial over USB.

If you need change anything outside of main function, move your function after the library code. You can do this using a section `.text.*` and these will be mapped after any library code and will not shift anything until `_start` is called. For example for a vblank handler;

    void vblCallback(void) __attribute__((section(".text.after")));
    void vblCallback(void) {}

### Making a project rebootable

Create a new NPM project;

    npm init

install `ed64`;

    npm i ed64 --save

Add following to your NPM scripts;

    "prepare": "libdragon install"

This will install and initialize libdragon when you do `npm i` for your repository.

Now you are ready to link your project against libed64.

Check out https://github.com/anacierdem/ed64-example for a full example.

To update libdragon, run;

    npm i libdragon@latest --save
    npm i

The second `npm i` will actually download the docker container and prepare it, thanks to the `prepare` script.

## Tasklist

- [x] Implement ROM loader on js.
- [x] Implement a basic rebootable ROM.
- [x] Add a hook to newlib's stdout for serial interface.
- [x] Implement everdrive as a libdragon dependency.
- [ ] Implement UNFloader protocol on js and use UNFloader as the usblib thus adding extended cartridge support.
- [ ] Do a proper pif boot and prevent overwrite t ocause any issues.
- [ ] Add screen capture & dump functionality.
- [ ] Add a GDB stub for real-time debugging & hot replacement.
- [ ] Implement direct SD card access via `libdragon` filesystem API.
- [ ] Implement a debugger for debugging the RSP.

## Development

You can run `npm run format` to automatically check and fix javascript code style.

## Funding

If this tool helped you, consider supporting its development by sponsoring it!
