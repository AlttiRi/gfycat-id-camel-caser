import {WordQueues} from "./words-handler.js";

main();


async function main() {
    const {adjectives: adjectivesArray, animals : animalsArray} = await getWords();
    const adjectives = new Set(adjectivesArray.map(el => el.toLocaleLowerCase()));
    const animals = new Set(animalsArray.map(el => el.toLocaleLowerCase()));

    Object.assign(globalThis, {adjectives, animals});
    console.log(adjectives, animals);

    const inputElem = document.querySelector("input");
    const resultElem = document.querySelector("#result");

    inputElem.addEventListener("input", handle);

    function handle(event) {
        const inputString = inputElem.value.toLowerCase().replaceAll(/[^a-z]/g, "");

        const wordQueues = new WordQueues();
        wordQueues.handle(inputString);

        const types = ["adjective", "adjective", "animal"]
        const options = {types};

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
        handleView(options);

        function handleView(options) {
            if (!options.wordQueue) {
                resultElem.textContent = " "; // Alt + 0160
                if (inputString.length) {
                    resultElem.className = "no-match";
                } else {
                    resultElem.className = "empty";
                }
                return;
            }

            /** Print "other-types" if the string doesn't match the types pattern
             * @see WordQueues.getMoreAppropriateStringByPattern */
            console.log(options.wordQueue, options.typed ? options.types.slice(0, options.wordQueue.words.length) : "other-types");

            resultElem.textContent = options.wordQueue.toString();
            if (options.typed) {
                const isTheSameLength = options.wordQueue.words.length === options.types.length;
                const noTailingChars = options.wordQueue.chars.length === 0;
                if (isTheSameLength && noTailingChars) {
                    resultElem.className = "strict-match";
                } else {
                    resultElem.className = "partial-match";
                }
            } else {
                resultElem.className = "other-pattern-match";
            }
        }
    }




    //todo delete
    // [unused]
    function handleOld(event) {
        let result = "";
        let current = "";
        for (const char of inputElem.value.toLocaleLowerCase()) {
            current += char;
            if (animals.has(current) || adjectives.has(current)) {
                result += current.charAt(0).toLocaleUpperCase() + current.substring(1);
                current = "";
            }
        }
        if (result) {
            resultElem.textContent = result;
        } else {
            resultElem.textContent = ".";
        }
    }
}



async function getWords() {
    const animalsPromise = fetch("./dictionaries/animals.json").then(resp => resp.json());
    const adjectivesPromise = fetch("./dictionaries/adjectives.json").then(resp => resp.json());

    const [animals, adjectives] = await Promise.all([animalsPromise, adjectivesPromise]);
    return {animals, adjectives};
}