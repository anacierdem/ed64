const commands = {
  TEST: 'CMDT',
  BOOT: 'CMDS',
  WRITE: 'CMDW',
  READ: 'CMDR',
  FILL: 'CMDF',
};

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
  const command = prepareCommand(commands.WRITE);
  command[4] = offset;
  command[5] = 0;
  command[6] = Math.ceil(size / 512) >> 8;
  command[7] = Math.ceil(size / 512);
  return command;
}

function prepareReadCommand(size, offset = 0) {
  const command = prepareCommand(commands.READ);
  command[4] = offset;
  command[5] = 0;
  command[6] = Math.ceil(size / 512) >> 8;
  command[7] = Math.ceil(size / 512);
  return command;
}

module.exports = {
  commands,
  prepareCommand,
  prepareReadCommand,
  prepareWriteCommand,
};
