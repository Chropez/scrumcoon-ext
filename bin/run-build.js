const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

let archive = archiver('zip');
const dist = path.join(__dirname, '/../dist');
const journalenCoonZip = path.join(dist + '/JournalenCoon.zip');

if (!fs.existsSync(dist)){
    fs.mkdirSync(dist);
    console.log('creating dist folder at:\r\n' + dist);
}

let output = fs.createWriteStream(journalenCoonZip);

output.on('close', function () {
    console.log('Zip file created: ' + archive.pointer() + ' total bytes');
    console.log('Zip file ready at: \r\n' + journalenCoonZip);
});

archive.on('error', function(err){
  console.log('error:' + err);
  throw err;
});

archive.pipe(output);
archive.bulk([
    {
      expand: true,
      cwd: '',
      src: [
        '**/*',
        '!node_modules/**',
        '!dist/**'
      ],
      dest: ''}
  ]);
archive.finalize();
