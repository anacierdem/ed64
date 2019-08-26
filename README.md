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

If you need change anything outside of main function, move your function after the library code. You can do this using a section `.text.*` and these will be mapped after any library code and will not shift anything until `_start` is called. For example for a vblank handler;

    void vblCallback(void) __attribute__((section(".text.after")));
    void vblCallback(void) {}

### Making a project rebootable

Create a new NPM project;

    npm init

Add following to your NPM scripts;

    "init": "libdragon install",
    "prepare": "npm run init"

install `ed64`;

    npm i ed64 --save

Now you are ready to link your project against libed64.

Check out https://github.com/anacierdem/ed64-example for a full example.

To update libdragon, set the version you need in package.json and run `npm i`.

## Tasklist

- [x] Implement ROM loader on js.
- [x] Implement a basic rebootable ROM.
- [x] Add a hook to newlib's stdout for serial interface.
- [x] Implement everdrive as a libdragon dependency.
- [ ] Add a GDB stub for real-time debugging & hot replacement.
- [ ] Implement a debugger for debugging the RSP.

## Support

If this helped you, consider supporting me;

<a href="https://patreon.com/anacierdem"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fanacierdem&style=for-the-badge" /> </a>
