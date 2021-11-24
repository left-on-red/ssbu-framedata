let https = require('https');
let fs = require('fs');
let jsdom = require('jsdom').JSDOM;
let request = require('request');

function download(url, filename) {
    return new Promise(function(resolve, reject) {
        request.head(url, function(error, response, body) {
            request(url).pipe(fs.createWriteStream(filename)).on('close', resolve);
        });
    });
}

function get(url) {
    return new Promise(function(resolve, reject) {
        https.get(url, function(response) {
            let data = '';
            response.on('data', function(chunk) { data += chunk });
            response.on('end', function() { resolve(data) });
            response.on('error', function(error) { reject(error) });
        });
    });
}

async function processImage(url, name) {
    let html = await get(url);
    let dom = new jsdom(html).window.document;
    let img = dom.getElementsByTagName('img')[0];
    let src = img.getAttribute('src');

    let filename = dom.getElementById('firstHeading').textContent.split('File:')[1];
    filename = filename.replace(name.split(' ').join(''), '');
    if (filename.includes('SSBU')) { filename = filename.replace('SSBU', '') }
    console.log(`${name}: ${filename}`);
    await download(`https://www.ssbwiki.com${src}`, `hitboxes/${name}/${filename}`);
}

async function getImage(url, name) {
    let html = await get(url);
    let dom = new jsdom(html).window.document;
    let list = dom.getElementsByClassName('gallery')[0].children;
    for (let l = 0; l < list.length; l++) {
        let item = list[l].children[0].children[0].children[0].children[0];
        let link = item.getAttribute('href');
        await processImage(`https://www.ssbwiki.com${link}`, name);
    }
}

async function start() {
    let html = await get('https://www.ssbwiki.com/Category:Hitboxes_(SSBU)');
    let dom = new jsdom(html).window.document;
    let list = dom.getElementsByClassName('mw-category-group')[0].children[1].children;
    for (let l = 0; l < list.length; l++) {
        let item = list[l].children[0].children[0].children[1];
        let name = item.innerHTML.split('(')[1].split('SSBU)')[0].split('&amp;').join('&').split('.').join('');
        name = name.substring(0, name.length - 1);
        let link = item.getAttribute('href');
        if (!fs.existsSync(`hitboxes/${name}`)) { fs.mkdirSync(`hitboxes/${name}`) }
        await getImage(`https://www.ssbwiki.com${link}`, name);
    }
}
start();