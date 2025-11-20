require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Movie = require('./models/Movie');

connectDB(); // Panggil fungsi koneksi di awal

const app = express();
const PORT = process.env.PORT || 3300; // Gunakan PORT dari .env
app.use(cors());
app.use(express.json());

// Rute-rute akan ditempatkan di sini...
app.get('/status', (req, res) => {
    res.json({ ok: true, service: 'film-api' });
});

app.get('/movies', async (req, res, next) => {
    try {
        const movie = await Movie.find({});
        res.json(movie);
    } catch (err) {
        next(err);
    }
});

app.get('/movies/:id', async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({
                error: 'Film tidak ditemukan'
            });
        }
        res.json(movie);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                error: 'Format ID tidak valid'
            });
        }
        next(err);
    }
});

app.post('/movies', async (req, res, next) => {
    try {
        const { title, director, year } = req.body;
        const newMovie = new Movie({
            title: req.body.title,
            director: director,
            year: year
        });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
});

app.put('/movies/:id', async (req, res, next) => {
    try {
        const { title, director, year } = req.body;
        if (!title || !director || !year) {
            return res.status(400).json({
                error: 'title, director, year wajib diisi'
            });
        }
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, director, year }, // Hanya update field ini
            { new: true, runValidators: true }
        );

        if (!updatedMovie) {
            return res.status(404).json({
                error: 'Film tidak ditemukan'
            });
        }
        res.json(updatedMovie);


    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                error: 'Format ID tidak valid'
            });
        }
        next(err);
    }
});

app.delete('/movies/:id', async (req, res, next) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({
                error: 'Film tidak ditemukan'
            });
        }
        res.status(204).send();

    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                error: 'Format ID tidak valid'
            });
        }
        next(err);
    }
});



// Fallback 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rute tidak ditemukan' });
});
// Error handler (opsional tapi bagus ditambahkan)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});
app.listen(PORT, () => {
    console.log('Server aktif di http://localhost:${PORT}');
});