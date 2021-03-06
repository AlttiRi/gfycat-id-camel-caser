import {animals as animals1} from "./dictionaries/animals1.js";
import {animals as animals2} from "./dictionaries/animals2.js";
import {animals as animals3} from "./dictionaries/animals3.js";
import {adjectives as adjectives1} from "./dictionaries/adjectives1.js";
import {adjectives as adjectives2} from "./dictionaries/adjectives2.js";
import {adjectives as adjectives3} from "./dictionaries/adjectives3.js";

import fs from "fs/promises";
import path from "path";


await bundleJsons();

function getWords() {
    const animals = new Set([
        ...handle(animals1),
        ...handle(animals2),
        ...handle(animals3),
    ]);
    const adjectives = new Set([
        ...handle(adjectives1),
        ...handle(adjectives2),
        ...handle(adjectives3),
    ]);
    return {animals: [...animals].sort(), adjectives: [...adjectives].sort()};

    function handle(array) {
        return array.map(el => el.toLowerCase().replaceAll(/[^a-z]/g, ""));
    }
}

async function bundleJsons() {
    const {animals, adjectives} = getWords();
    logInfo({animals, adjectives});

    const animalsJson    = JSON.stringify(animals,    null," ");
    const adjectivesJson = JSON.stringify(adjectives, null," ");
    const animalsWritten    = fs.writeFile(path.join("dictionaries", "animals.json"), animalsJson);
    const adjectivesWritten = fs.writeFile(path.join("dictionaries", "adjectives.json"), adjectivesJson);

    return Promise.all([animalsWritten, adjectivesWritten]);
}

function logInfo({animals, adjectives}) {
    console.log(animals1.length);
    console.log(animals2.length);
    console.log(animals3.length);
    console.log(animals.length);
    console.log();
    console.log(adjectives1.length);
    console.log(adjectives2.length);
    console.log(adjectives3.length);
    console.log(adjectives.length);
}
