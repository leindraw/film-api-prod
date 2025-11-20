
const express = require('express');

const app = express();
const PORT = 3000;

let movies = [
    {
        id: 1, title: 'Parasite', director: 'Bong Joon-ho', year: 2019
    },
    {
        id: 2, title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008
    },
    {
        id: 3, title: 'Spirited Away', director: 'Hayao Miyazaki', year: 2001
    },
];

app.get('/', (req, res) => { res.send('Server API Manajemen Film berjalan!') });

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.listen(PORT, () => {
    console.log('Server aktif di http://localhost:${PORT}');
});

app.get('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id);
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        return res.status(404).json({ message: 'Film tidak ditemukan' });
    }

    res.json(movie);
});