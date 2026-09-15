const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-supabase-project-id');
const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// CORS Middleware to allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page from the public folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET database data
app.get('/api/data', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                success: false,
                message: 'Supabase credentials not configured in .env (SUPABASE_URL and SUPABASE_ANON_KEY required)'
            });
        }
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching data from Supabase:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch data', error: error.message });
    }
});

// CREATE/add data
const saveDataHandler = async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                success: false,
                message: 'Supabase credentials not configured in .env (SUPABASE_URL and SUPABASE_ANON_KEY required)'
            });
        }
        const { username, password } = req.body;
        const { data, error } = await supabase
            .from('users')
            .insert([{ username: username || '', password: password || '' }])
            .select();

        if (error) throw error;

        const newItem = data && data[0] ? data[0] : { username, password };
        res.json({ success: true, message: 'Data saved successfully', item: newItem });
    } catch (error) {
        console.error('Error adding data to Supabase:', error.message);
        res.status(500).json({ success: false, message: 'Failed to save data', error: error.message });
    }
};

app.post('/api/data', saveDataHandler);
app.post('/login', saveDataHandler);

// UPDATE data
app.put('/api/data/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                success: false,
                message: 'Supabase credentials not configured in .env'
            });
        }
        const { id } = req.params;
        const { username, password } = req.body;

        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (password !== undefined) updateData.password = password;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, message: 'Data updated successfully', item: data });
    } catch (error) {
        console.error('Error updating data in Supabase:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update data', error: error.message });
    }
});

// DELETE data
app.delete('/api/data/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                success: false,
                message: 'Supabase credentials not configured in .env'
            });
        }
        const { id } = req.params;
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting data from Supabase:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete data', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    if (!isConfigured) {
        console.warn('⚠️ Supabase credentials are missing or set to placeholder in .env! Update SUPABASE_URL and SUPABASE_ANON_KEY to connect to Supabase.');
    }
});

module.exports = app;