const express = require('express');
const app = express();
const { animals } = require('./data/aniamls')



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
        filteredResults = filteredResults.filter(aniamls => animals.diet === query.diet); 
    }
    if (query.species) {
        filteredResults = filteredResults.filter(aniamls => animals.species === query.species)
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animals => animals.name === query.name)
    }
    return filteredResults
};

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results)
})

app.listen(3001, () => {
    console.log(`API server now on port 3001!`);
});