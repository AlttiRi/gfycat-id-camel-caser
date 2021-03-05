import {WordQueues} from "./words-handler.js";

export async function getWords() {
    const animalsPromise = fetch("./dictionaries/animals.json").then(resp => resp.json());
    const adjectivesPromise = fetch("./dictionaries/adjectives.json").then(resp => resp.json());

    const [animals, adjectives] = await Promise.all([animalsPromise, adjectivesPromise]);
    return {animals, adjectives};
}

/**
 * @typedef MatchResult
 * @property {WordQueue} wordQueue
 * @property {Boolean} typed
 * @property {String[]} types
 * @property {String} inputString
 */

/**
 * @param {String} inputString
 * @return {Promise<MatchResult>}
 */
export async function matchString(inputString) {
    const _inputString = inputString.toLowerCase().replaceAll(/[^a-z]/g, "");
    await WordQueues.init();
    const wordQueues = new WordQueues();
    wordQueues.handle(inputString);

    const types = ["adjective", "adjective", "animal"];
    const options = {types, inputString: _inputString};

    const resultWordQueue = wordQueues.getMoreAppropriateStringByPattern(types);
    if (resultWordQueue) {
        Object.assign(options, {
            wordQueue: resultWordQueue,
            typed: true
        });
    } else {
        const resultWordQueue = wordQueues.getResultSimple();
        if (resultWordQueue) {
            Object.assign(options, {
                wordQueue: resultWordQueue,
                typed: false
            });
        }
    }
}
