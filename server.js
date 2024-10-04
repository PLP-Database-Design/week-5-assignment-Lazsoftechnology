// Import dependencies
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create an Express application
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname + 'views');  // Specify the views folder

// Configure database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test the database connection
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL as id:', db.threadId);
});

// 1. Retrieve all patients
app.get('/patients', (req, res) => {
    db.query('SELECT patient_id, first_name, last_name, date_of_birth FROM patients', (err, results) => {
        if (err) {
            console.error('Error retrieving patients:', err);
            return res.status(500).send('Error retrieving patients');
        }
        res.json(results);
    });
});

// 2. Retrieve all providers
app.get('/providers', (req, res) => {
    db.query('SELECT first_name, last_name, provider_specialty FROM providers', (err, results) => {
        if (err) {
            console.error('Error retrieving providers:', err);
            return res.status(500).send('Error retrieving providers');
        }
        res.json(results);
    });
});

// 3. Filter patients by First Name
app.get('/patients/filter', (req, res) => {
    const firstName = req.query.first_name;  // Expecting a query parameter like ?first_name=John
    db.query('SELECT * FROM patients WHERE first_name = ?', [firstName], (err, results) => {
        if (err) {
            console.error('Error retrieving patients:', err);
            return res.status(500).send('Error retrieving patients');
        }
        res.json(results);
    });
});

// 4. Retrieve all providers by their specialty
app.get('/providers/filter', (req, res) => {
    const specialty = req.query.specialty;  // Expecting a query parameter like ?specialty=Cardiology
    db.query('SELECT * FROM providers WHERE provider_specialty = ?', [specialty], (err, results) => {
        if (err) {
            console.error('Error retrieving providers:', err);
            return res.status(500).send('Error retrieving providers');
        }
        res.json(results);
    });
});

// Render data.ejs with patients and providers
app.get('/data', (req, res) => {
    // Retrieve all patients
    db.query('SELECT patient_id, first_name, last_name, date_of_birth FROM patients', (err, patients) => {
        if (err) {
            console.error('Error retrieving patients:', err);
            return res.status(500).send('Error retrieving patients');
        }

        // Retrieve all providers
        db.query('SELECT first_name, last_name, provider_specialty FROM providers', (err, providers) => {
            if (err) {
                console.error('Error retrieving providers:', err);
                return res.status(500).send('Error retrieving providers');
            }

            // Render the data.ejs view and pass the patients and providers data
            res.render('data', { patients: patients, providers: providers });
        });
    });
});

// Listen to the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
