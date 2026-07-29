const https = require('https');

https.get('https://tr.pinterest.com/everly940/fashion-girls.rss', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const regex = /src="([^"]+)"/g;
        let match;
        const urls = [];
        while ((match = regex.exec(data)) !== null) {
            urls.push(match[1].replace('236x', '736x'));
        }
        console.log("Found:", urls.length);
        console.log(JSON.stringify(urls));
    });
}).on('error', err => {
    console.error(err.message);
});
