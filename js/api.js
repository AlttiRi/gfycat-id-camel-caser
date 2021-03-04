export async function getWords() {
    const animalsPromise = fetch("./dictionaries/animals.json").then(resp => resp.json());
    const adjectivesPromise = fetch("./dictionaries/adjectives.json").then(resp => resp.json());

    const [animals, adjectives] = await Promise.all([animalsPromise, adjectivesPromise]);
    return {animals, adjectives};
}

export {WordQueues} from "./words-handler.js";