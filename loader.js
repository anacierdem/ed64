#!/usr/bin/env node

const SerialPort = require('serialport')
var fs = require('fs');

const commands = {
  TEST: 'CMDT',
  BOOT: 'CMDS',
  WRITE: 'CMDW',
  READ: 'CMDR',
  FILL: 'CMDF'
};

const ACK = 'RSPk';
const TIMEOUT = 1000;
const STATUS_UPDATE_AT = 32768;
const MEG_32 = 33554432;

const ackError = new Error('Acknowledge timeout.');

const ports = SerialPort.list();

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

async function acknowledge(port) {
  return new Promise((resolve, reject) => {
    const portTimeout = setTimeout(() => {
      reject(ackError);
      port.close();
    }, TIMEOUT);

    function wait(data) {
      const response = bin2String(data);
      if (response.indexOf(ACK) > -1) {
        clearTimeout(portTimeout);
        port.removeListener('data', wait);
        resolve(true);
      }
    }

    port.on('data', wait);
  })
}

async function writeToPort(port, data) {
  return new Promise((resolve, reject) => {
    port.write(data, async (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

async function sendCommand(port, command, waitAck = true) {
  return new Promise(async (resolve, reject) => {
    try {
      await writeToPort(port, command);
      if (waitAck) {
        resolve(await acknowledge(port));
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

// Make sure to write 512 bytes of data to fill buffer on ed64
function prepareCommand(command) {
  const buffer = Buffer.alloc(512);
  buffer[0] = command.charCodeAt(0);
  buffer[1] = command.charCodeAt(1);
  buffer[2] = command.charCodeAt(2);
  buffer[3] = command.charCodeAt(3);
  return buffer;
}

function prepareWriteCommand(size, offset = 0) {
  const command = prepareCommand(commands.WRITE);;
  command[4] = offset;
  command[5] = 0;
  command[6] = (size / 512) >> 8;
  command[7] = (size / 512);

  return command;
}

function prepareReadCommand(size, offset = 0) {
  const command = prepareCommand(commands.READ);;
  command[4] = offset;
  command[5] = 0;
  command[6] = (size / 512) >> 8;
  command[7] = (size / 512);

  return command;
}

async function sendData(port, data) {
  console.log('Sending...');
  const size = data.byteLength;

  async function writeNext(offset) {
    console.log('Writing at', `${offset}/${size}`);
    if (offset >= size) {
      console.log('Try boot...');
      await sendCommand(port, prepareCommand(commands.BOOT), false);
    } else {
      const partial = Buffer.from(data.buffer, offset, STATUS_UPDATE_AT);

      if (offset === MEG_32) {
        console.log('Next 32m');
        await sendCommand(port, prepareWriteCommand(size - MEG_32, 64), false);
      }

      await writeToPort(port, partial);
      await writeNext(offset + STATUS_UPDATE_AT)
    }
  }

  await sendCommand(port, prepareWriteCommand(size), false);
  await writeNext(0);
}

async function prepare(port, contents) {
  if (contents.byteLength < 2097152) {
    try {
      await sendCommand(port, prepareCommand(commands.FILL));
      console.log('Fill success!');
      await sendData(port, contents);
    } catch(e) {
      console.log('Fill error!');
    }
  } else {
    await sendData(port, contents);
  }
}

function startListening(port) {
  port.on('data', (d) => console.log(bin2String(d)));
}

function findPortAndUpload(options) {
  const { fileName, keepAlive, read } = options;
  // Enumarate ports and invoke sendData
  ports.then((ports) => {
    ports.forEach(async ({ comName }) => {
      const port = new SerialPort(comName , {
        baudRate: 9600
      });

      // Open errors will be emitted as an error event
      port.on('error', function(err) {
        console.log('Error: ', err.message)
      });

      try {
        await sendCommand(port, prepareCommand(commands.TEST));
        console.log('Found ED64 on', comName);

        if (read) {
          startListening(port);
          await sendCommand(port, prepareReadCommand(2097152));
        } else {
          fs.readFile(fileName, async function(err, contents) {
            if (err) {
              console.log('Error reading file: ', err.message);
            }
            await prepare(port, contents);
            if (keepAlive) {
              startListening(port);
            } else {
              port.close();
            }
          });
        }
      } catch(e) {
        if (e !== ackError) console.log(e.message);
      }
    })
  });
}

const options = {
  fileName: process.argv[2],
  keepAlive: false,
  read: false
}

process.argv.forEach(function (val, index, array) {
  switch (val) {
    case '--keep-alive':
      options.keepAlive = true;
    break;
    case '--read':
      options.read = true;
    break;
  }
});

findPortAndUpload(options);
