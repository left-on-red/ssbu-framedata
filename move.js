let location = './hitboxes';

let fs = require('fs');

let folders = fs.readdirSync(location);
for (let f = 0; f < folders.length; f++) {
    let newname = folders[f].substring(0, folders[f].length - 1);
    console.log(`"${newname}"`);
    fs.renameSync(`${location}/${folders[f]}`, `${location}/${newname}`);
}