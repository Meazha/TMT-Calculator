const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./tmt_brands.db');

// Create brands table if not exists
db.run(`CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    weight_per_rod REAL NOT NULL,
    size INTEGER NOT NULL
)`);

// Get all brands
app.get('/brands', (req, res) => {
    db.all('SELECT * FROM brands', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ brands: rows });
    });
});

// Add a new brand
app.post('/add-brand', (req, res) => {
    const { name, weight_per_rod, size } = req.body;
    db.run('INSERT INTO brands (name, weight_per_rod, size) VALUES (?, ?, ?)', [name, weight_per_rod, size], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Calculate Estimate
app.post('/estimate', (req, res) => {
    const { brandId, rodCount, pricePerKg, size } = req.body;
    db.get('SELECT * FROM brands WHERE id = ?', [brandId], (err, brand) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Example weights based on sizes (update with actual data)
        const weightPerRod = {
            6: 0.222,
            8: 0.395,
            10: 0.617,
            12: 0.888,
            16: 1.578,
            20: 2.466,
            25: 3.855,
            32: 5.791
        };

        const rodWeight = weightPerRod[size] || brand.weight_per_rod;
        const totalWeight = rodWeight * rodCount;
        const totalCost = totalWeight * pricePerKg;

        res.json({
            size,
            rodCount,
            totalWeight,
            totalCost
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
