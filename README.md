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

    node ./node_modules/ed64/loader.js [path to your file]

Or on this repository's root;

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
- `libdragon` toolchain will be installed automatically as a docker container (named ed64) on your computer.
- Connect your Everdrive64 via USB and turn on your N64.
- Open this folder with vscode and hit F5.
- Stop and restart the project via vscode.
- Voila! You have a re-uploadable executable with print debugging.

When calling `everdrive_init(true)`, the first parameter determines whether to hook to stdio or not. If you pass `true`, all standard outputs will go serial over USB.

Changing anything outside of main function is not yet supported. This is still useful for basic consecutive testing.

## Tasklist

- [x] Implement ROM loader on js.
- [x] Implement a basic rebootable ROM.
- [x] Add a hook to newlib's stdout for serial interface.
- [ ] Implement everdrive as a libdragon dependency.
- [ ] Implement a fully stable rebootable ROM.
- [ ] Add a GDB stub for real-time debugging & hot replacement.
- [ ] Implement a debugger for debugging the RSP.