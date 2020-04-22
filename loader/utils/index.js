function withPad(input, boundary, padWith = 0) {
  if (input.length % boundary !== 0) {
    const padded = Buffer.alloc(
      Math.ceil(input.length / boundary) * boundary,
      padWith
    );
    input.copy(padded, 0, 0);
    return padded;
  } else {
    return input;
  }
}

function bin2String(array) {
  var intermediate = cleanBinary(array);
  var result = '';
  for (var i = 0; i < intermediate.length; i++) {
    result += String.fromCharCode(intermediate[i]);
  }
  return result;
}

function cleanBinary(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    // assume empty c string-like
    if (array[i] === 0) {
      continue;
    }
    result.push(array[i]);
  }
  return Buffer.from(result);
}

module.exports = {
  withPad,
  bin2String,
  cleanBinary,
};
