const http = require('http');

const options = {
    host: '0.0.0.0',
    path: '/health',
    port: 53413,
    timeout: 5000
};

const healthCheck = http.request(options, (res) => {
    console.log(`HEALTHCHECK STATUS: ${res.statusCode}`);
    if (res.statusCode == 200) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
});

healthCheck.on('error', function (err) {
    console.error('ERROR: ', err);
    process.exit(1);
});

healthCheck.end();
