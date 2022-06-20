const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const { v4: uuidv4 } = require('uuid');
const writeFile = util.promisify(fs.writeFile);
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));
// app.use('/api', api);

const getNotes = () => {
    return readFile('db/db.json', 'utf-8').then(rawNotes => {
        let parsedNotes = [];
        try { 
            parsedNotes = parsedNotes.concat(JSON.parse(rawNotes))
        } catch (error) {
            parsedNotes = [];
        } return parsedNotes;
    })
}

app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
    getNotes().then(notesArray => {
        res.json(notesArray);
    }).catch(err => {
        res.status(500).json(err);
    })
});

app.post('/api/notes', (req, res) => {
    const noteObject = {title: req.body.title, text: req.body.text, id: uuidv4()};
    getNotes().then(oldNotes => [...oldNotes, noteObject]).then(newNotes => {
        writeFile('db/db.json', JSON.stringify(newNotes));
    }).then(() => res.json({msg: 'okay'})).catch(err => res.json(err));
});

app.delete('/api/notes/:id', (req, res) => {
    getNotes().then(notesArray => notesArray.filter(notes => notes.id !== req.params.id)).then(newArray => {
        writeFile('db/db.json', JSON.stringify(newArray));
    }).then(() => res.json({msg: 'okay'})).catch(err => res.json(err));
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);