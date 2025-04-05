const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Session management
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Serve HTML files
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/sign', (req, res) => {
    res.sendFile(path.join(__dirname, 'sign.html'));
});

// User data management
const getUsers = () => {
    if (fs.existsSync('users.json')) {
        const data = fs.readFileSync('users.json', 'utf8');
        return JSON.parse(data);
    }
    return [];
};

const saveUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const existingUser  = users.find(u => u.username === username);

    if (existingUser ) {
        return res.status(400).send('Username already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    saveUsers(users);
    res.status(201).send('User  registered successfully.');
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.loggedIn = true;
        req.session.username = username; // Store username in session
        res.status(200).send('Login successful.');
    } else {
        res.status(401).send('Invalid credentials.');
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.status(200).send('Logged out successfully.');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Scores storage in scores.json
const getScores = () => {
    if (fs.existsSync('scores.json')) {
        const data = fs.readFileSync('scores.json', 'utf8');
        return JSON.parse(data);
    }
    return [];
};

const saveScores = (scores) => {
    fs.writeFileSync('scores.json', JSON.stringify(scores, null, 2));
};

// Handle score submission
app.post('/submit-score', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).send('You must be logged in.');
    }

    const { name, email, condition, score } = req.body;

    if (!name || !email || !condition || typeof score !== 'number') {
        return res.status(400).send('Invalid data.');
    }

    const scores = getScores();
    scores.push({
        username: req.session.username,
        name,
        email,
        condition,
        score,
        date: new Date().toISOString()
    });

    saveScores(scores);
    res.status(201).send('Score saved!');
});
