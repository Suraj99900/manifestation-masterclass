const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname; // Current directory

const server = http.createServer((req, res) => {
    // Helper to send files
    const sendFile = (filePath, contentType) => {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end("Server Error: " + err.code);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    };

    // Handle POST /save-config (Saves JSON to file)
    if (req.method === 'POST' && req.url === '/save-config') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                // Validate JSON
                const json = JSON.parse(body);
                // Write to file
                const configPath = path.join(PUBLIC_DIR, 'js', 'config.json');
                fs.writeFile(configPath, JSON.stringify(json, null, 4), err => {
                    if (err) {
                        res.writeHead(500);
                        res.end("Write Error");
                    } else {
                        res.writeHead(200);
                        res.end("Saved");
                    }
                });
            } catch (e) {
                res.writeHead(400);
                res.end("Invalid JSON");
            }
        });
        return;
    }

    // Handle Static Files (GET) - Serves html, css, js, images
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
        case '.jpeg': contentType = 'image/jpeg'; break;
        case '.gif': contentType = 'image/gif'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
    }

    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            sendFile(filePath, contentType);
        } else {
            // Try finding .html extension (e.g. /admin -> /admin.html)
            const htmlPath = filePath + '.html';
            fs.stat(htmlPath, (errHtml, statsHtml) => {
                if (!errHtml && statsHtml.isFile()) {
                    sendFile(htmlPath, 'text/html');
                } else {
                    res.writeHead(404);
                    res.end("404 Not Found");
                }
            });
        }
    });
});

console.log(`Server running at https://lifehealerkavita.com/manifestation/`);
console.log(`To configure, open: https://lifehealerkavita.com/manifestation/admin.html`);
server.listen(PORT);
