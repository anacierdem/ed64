#!/usr/bin/env node

const { withPad } = require('./loader/utils');
const { prepareCommand, commands } = require('./loader/commands');

const SerialPort = require('serialport');
const fs = require('fs');

const ACK = Buffer.from('cmdr\0', 'ascii');
const TEST_TIMEOUT = 1000;

const MEG = 1024 * 1024;
// This should be a multiple of 512
const STATUS_UPDATE_AT = MEG;
const STATUS_TIMEOUT = 2000;

const ROM_START_ADDRESS = 0x10000000;
const CRC_AREA = 0x100000 + 4096;

const STATUS_ERROR = 1;
const STATUS_BAD_PARAM = 1;

/**
 * Waits for an ack from the Everdrive
 * @param port
 * @returns true if achnowledged on time
 */
function test(port) {
  return new Promise((resolve) => {
    const portTimeout = setTimeout(() => {
      resolve(false);
      port.close();
    }, TEST_TIMEOUT);

    let buffer = Buffer.alloc(0);
    function wait(data) {
      buffer = Buffer.concat([buffer, data]);
      if (buffer.includes(ACK)) {
        clearTimeout(portTimeout);
        port.removeListener('data', wait);
        resolve(true);
      }
    }

    port.on('data', wait);
  });
}

function writeToPort(port, data) {
  return new Promise((resolve, reject) => {
    port.write(data, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
}

async function sendData(port, data) {
  async function continueUpload(size, offset = 0) {
    const remainingBytes = size - offset;
    if (remainingBytes > 0) {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => {
          reject(new Error('Upload timed out.'));
        }, STATUS_TIMEOUT)
      );

      const amount = Math.min(STATUS_UPDATE_AT, remainingBytes);
      const nextOffset = offset + amount;
      await Promise.race([
        timeout,
        writeToPort(port, data.slice(offset, nextOffset)),
      ]);
      console.log(`Uploaded ${((nextOffset / size) * 100).toFixed(2)}%`);
      await continueUpload(size, nextOffset);
    }
  }

  try {
    data = withPad(data, 512);
    const size = data.byteLength;

    if (size < CRC_AREA) {
      console.log('Start fill');
      await writeToPort(
        port,
        prepareCommand(commands.ROM_FILL, ROM_START_ADDRESS, CRC_AREA)
      );

      console.log('Fill complete.');
    }

    await writeToPort(
      port,
      prepareCommand(commands.ROM_WRITE, ROM_START_ADDRESS, size)
    );

    console.log('Sending...');

    await continueUpload(size);

    console.log('Now booting...');
    await writeToPort(port, prepareCommand(commands.ROM_START, 0, 0, 1));

    const buffer = Buffer.alloc(256);
    await writeToPort(port, buffer);

    console.log('Done uploading.');
  } catch (e) {
    port.close();
    throw e;
  }
}

const DATATYPE_TEXT = 0x01;
const DATATYPE_RAWBINARY = 0x02;
const DATATYPE_HEADER = 0x03;
const DATATYPE_SCREENSHOT = 0x04;

function startListening(port) {
  let buffer = Buffer.alloc(0);
  let headerData = Buffer.alloc(16);
  port.on('data', (d) => {
    buffer = Buffer.concat([buffer, d]);
    let headerMarker = -1;
    while ((headerMarker = buffer.indexOf(Buffer.from('DMA@', 'ascii'))) >= 0) {
      let read = headerMarker + 4;

      if (read + 4 > buffer.length) {
        // Don't have enough data for header yet
        break;
      }

      // We can read the 4 byte header now
      const header = buffer.readInt32BE(read);
      const size = header & 0x00ffffff;
      const type = (header & 0xff000000) >> 24;
      read += 4;

      if (read + size + 4 > buffer.length) {
        // Don't have enough data yet for data + cmp
        break;
      }

      const data = buffer.slice(read, read + size);
      read += size;

      if (
        buffer.slice(read, read + 4).compare(Buffer.from('CMPH', 'ascii')) !== 0
      ) {
        console.error('Incomplete packet was received: ' + data.toString());
      }
      read += 4;

      switch (type) {
        case DATATYPE_TEXT:
          process.stdout.write(data);
          break;
        case DATATYPE_HEADER:
          console.assert(
            data.length == 16,
            `Header size was not correct expected 16 received: ${data.length}`
          );
          data.copy(headerData);
          break;
        case DATATYPE_SCREENSHOT: {
          const headerType = headerData.readInt32BE(0);
          // const depth = headerData.readInt32BE(1);
          // const width = headerData.readInt32BE(2);
          // const height = headerData.readInt32BE(3);
          console.assert(
            headerType == DATATYPE_SCREENSHOT,
            `Last received header was not ${DATATYPE_SCREENSHOT}, received: ${headerType}`
          );
          headerData.fill(0);
          // TODO: handle screenshot
          break;
        }
        case DATATYPE_RAWBINARY:
          // TODO: handle binary file
          break;
      }

      const newBuf = Buffer.alloc(buffer.length - read);
      buffer.copy(newBuf, 0, read);
      buffer = newBuf;
    }
  });
}

async function findPortAndUpload(options) {
  try {
    const { fileName, keepAlive } = options;
    // Enumarate ports and invoke sendData
    const ports = await SerialPort.list();
    let found = false;
    for (let { path } of ports) {
      const port = new SerialPort(path, {
        baudRate: 9600,
      });

      // Open errors will be emitted as an error event, just let user know
      port.on('error', function (err) {
        console.error('Port Error: ', err.message);
      });

      await writeToPort(port, prepareCommand(commands.TEST));
      found = await test(port);
      if (found) {
        console.log('Found ED64 on', path);

        const contents = fs.readFileSync(fileName);

        await sendData(port, contents);

        if (keepAlive) {
          startListening(port, options.port);
        } else {
          port.close();
        }
        break;
      }
    }
    if (!found) {
      console.error('No everdrive found!');
      process.exit(STATUS_ERROR);
    }
  } catch (e) {
    console.error(`Error occurred: ${e.message}`);
    process.exit(STATUS_ERROR);
  }
}

const options = {
  keepAlive: false,
  port: 1337,
};

// TODO: add shorthand syntax
process.argv.forEach(function (val, index) {
  if (index < 2) {
    return;
  }

  switch (val) {
    case '--keep-alive':
      options.keepAlive = true;
      return;
  }

  if (val.indexOf('--') === 0) {
    console.error(`encountered unknown flag: ${val}`);
    process.exit(STATUS_BAD_PARAM);
  }

  if (options.fileName || !val) {
    console.error('You must provide only a single ROM file to read from');
    process.exit(STATUS_BAD_PARAM);
  }

  options.fileName = val;
});

if (!options.fileName) {
  console.error('You must provide a ROM file');
  process.exit(STATUS_BAD_PARAM);
}

if (
  !fs.existsSync(options.fileName) ||
  fs.statSync(options.fileName).isDirectory()
) {
  console.error(`${options.fileName} is not a ROM`);
  process.exit(STATUS_BAD_PARAM);
}

findPortAndUpload(options);
