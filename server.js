const express = require('express');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();
// Parse incoming strings or array data
app.use(express.urlencoded({ extended: true}));
// Parse incoming JSON data
app.use(express.json())
app.use(express.static('public'));
const { animals } = require('./data/aniamls')



function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result
}

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray}, null, 2)
    )
    return animal;
}

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = []
    let filteredResults = animalsArray;

    if (query.personalityTraits) {
        // Save personalityTrait as a deicated array
        // If personalityTrait is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        }else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each aniaml in the filteredResults array
            // Remember, its is initially a copy of the aniamlsArray,
            // but here we're updating it for each trait in the .forEach() loop
            // For each trait being targeted by the filter, the filteredResults 
            //array will then contain only the entries that contain the trait, 
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the for each is finished
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            ); 
        });
    }

    if (query.diet) {
        filteredResults = filteredResults.filter(animals => animals.diet === query.diet); 
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animals => animals.species === query.species)
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animals => animals.name === query.name)
    }
    return filteredResults
};

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false
    }
    return true
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results)
})

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result)
    }else {
        res.sendStatus(404)
    }
});

app.post('/api/animals', (req, res) => {
    //sets id based on what the next index of the array will be
    req.body.id = animals.length.toString();
    
    // if any data in req.body is incorrect, send 400 error back 
    if (!validateAnimal(req.body)) {
        res.sendStatus(400)
    } else {
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }
})

app.get('/', (req, res) => {
     res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`);
});