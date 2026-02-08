const http = require('http');
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname)));

const PORT = 3000;
const PUBLIC_DIR = __dirname; // Current directory
const parsedUrl = "";
const server = http.createServer((req, res) => {
    // Helper to send files
    const sendFile = (filePath, contentType) => {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end("Server Error: " + err.code);
            } else {
                // Add CORS headers to static files too if needed, but mainly for API
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    };

    // Enable CORS for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Handle POST /save-config (Saves JSON to file)
    if (req.method === 'POST' && req.url === '/save-config') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const json = JSON.parse(body);
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

    // Handle POST /save-lead (Saves User Details)
    if (req.method === 'POST' && req.url === '/save-lead') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newLead = JSON.parse(body);
                console.log('Received lead:', newLead);

                // Add timestamp
                newLead.timestamp = new Date().toISOString();

                const leadsPath = path.join(PUBLIC_DIR + '/js/', 'leads.json');

                // Read existing leads
                fs.readFile(leadsPath, (err, data) => {
                    let leads = [];
                    if (!err && data.length > 0) {
                        try {
                            leads = JSON.parse(data);
                        } catch (e) {
                            console.error("Error parsing leads.json", e);
                        }
                    }

                    leads.push(newLead);

                    fs.writeFile(leadsPath, JSON.stringify(leads, null, 4), err => {
                        if (err) {
                            console.error('Error saving lead:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: "Error saving lead" }));
                        } else {
                            console.log('Lead saved successfully');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: "Lead saved successfully" }));
                        }
                    });
                });
            } catch (e) {
                console.error('Invalid JSON received:', e);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
            }
        });
        return;
    }

    // Handle GET /get-leads
    if (req.method === 'GET' && req.url === '/get-leads') {
        const leadsPath = path.join(PUBLIC_DIR, 'js', 'leads.json');
        fs.readFile(leadsPath, (err, data) => {
            if (err) {
                // If file doesn't exist, return empty array
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('[]');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
        return;
    }

    // Handle Static Files (GET) - Serves html, css, js, images
    // Parse URL to ignore query strings (e.g. style.css?ver=1.0)
    let parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = parsedUrl.pathname;

    // Normalize path to prevent directory traversal
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath).toLowerCase();
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

console.log(`Server running at http://localhost:${PORT}/`);
console.log(`To configure, open: http://localhost:${PORT}/admin.html`);
server.listen(PORT);
