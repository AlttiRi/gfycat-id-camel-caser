import {matchString} from "./api.js";

main();

function main() {
    const inputElem = document.querySelector("input");
    const resultElem = document.querySelector("#result");

    inputElem.addEventListener("input", inputHandler);

    async function inputHandler(event) {
        /** @type {MatchResult} */
        const options = await matchString(inputElem.value);

        if (!options.wordQueue) {
            resultElem.textContent = " "; // Alt + 0160
            if (options.inputString.length) {
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



