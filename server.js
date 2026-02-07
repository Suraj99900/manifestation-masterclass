const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Save config API
app.post('/manifestation/save-config', (req, res) => {
    const configPath = path.join(__dirname, 'js', 'config.json');

    fs.writeFile(configPath, JSON.stringify(req.body, null, 4), err => {
        if (err) {
            console.error(err);
            return res.status(500).send("Write Error");
        }
        res.send("Saved");
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
