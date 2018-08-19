const fetch = require('node-fetch');
const qs = require('querystringify');
const fs = require('fs');
const argv = require('yargs').argv;

const baseUrl = 'http://api.qrserver.com/v1/';
const endpoints = {
  create: 'create-qr-code/',
};

const defaultOptions = {
  width: 100,
  height: 100,
  data: 'Hello from GoQR Node!',
  targetDir: '.',
  fileName: 'qrcode.png'
};

const stringify = params => qs.stringify(params, '&');

function buildImageSize(width, height) {
  if (width && !height) {
    return `${width}x${defaultOptions.height}`;
  } else if (height && !width) {
    return `${defaultOptions.width}x${height}`;
  } else {
    return `${defaultOptions.width}x${defaultOptions.height}`;
  }
}

async function createQRCode() {
  const { w, width, h, height, t, text, d, dir, f, filename } = argv;
  let size = buildImageSize(w || width, h || height);
  if (!t && !text) {
    console.log('Text must be provided with either the -t or the --text flag.');
    process.exit(1);
  }

  const queryString = stringify({ size, data: t || text }).slice(1);
  const url = `${baseUrl}${endpoints.create}?${queryString}`
  const response = await fetch(url)
  const outDir = d || dir || defaultOptions.targetDir;
  const fileName = f || filename || defaultOptions.fileName

  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(`${outDir}/${fileName}`);
    response.body.pipe(fileStream);
    response.body.on('error', err => {
      reject(err);
    });
    fileStream.on('finish', () => {
      resolve();
    });
  });
}

async function main() {
  if (argv.r || argv.read) {
    console.log('Unimplemented.');
  } else if (argv.c || argv.create) {
    await createQRCode();
  } else if (argv.h || argv.help) {
    console.log('GoQR Help');
  } else {
    await createQRCode();
  }
}

main();
