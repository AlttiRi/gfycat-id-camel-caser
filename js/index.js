import {matchString} from "./api.js";

main();

function main() {
    const inputElem = document.querySelector("input");
    const resultElem = document.querySelector("#result");

    inputElem.addEventListener("input", inputHandler);

    async function inputHandler(event) {
        /** @type {MatchResult} */
        const result = await matchString(inputElem.value);

        if (!result.wordQueue) {
            resultElem.textContent = " "; // Alt + 0160
            if (result.inputString.length) {
                resultElem.className = "no-match";
            } else {
                resultElem.className = "empty";
            }
            return;
        }

        /** Print "other-types" if the string doesn't match the types pattern
         * @see WordQueues.getMoreAppropriateStringByPattern */
        console.log(result.wordQueue, result.typed ? result.types.slice(0, result.wordQueue.words.length) : "other-types");

        resultElem.textContent = result.string;
        if (result.typed) {
            const isTheSameLength = result.wordQueue.words.length === result.types.length;
            const noTailingChars = result.wordQueue.chars.length === 0;
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



