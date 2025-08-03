// server.js
const express = require('express');
const path = require('path');
// Assuming phrasalVerbs.js is in a 'data' directory relative to server.js
// It will be loaded and processed by the client-side JavaScript
// const phrasalVerbsData = require('./data/phrasalVerbs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get all phrasal verbs (client will handle mastery data)
app.get('/api/verbs', (req, res) => {
    // For now, we just need a way to signal the client to use its local copy
    // or fetch the base list if it doesn't have one.
    // The actual data list will be in public/data/phrasalVerbs.js for client-side fetching
    // Or embedded directly if small enough. Let's assume client-side fetch for modularity.
    // This endpoint could be used in the future for server-side data persistence if needed.
    // For now, it's a placeholder or can serve the base list.
    // Let's have it serve the path to the actual data file.
    res.json({ message: "Phrasal verbs data is managed client-side or fetched from /data/phrasalVerbs.js" });
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Phrasal Verbs App is running! Access it via your Glitch project's URL.`);
});