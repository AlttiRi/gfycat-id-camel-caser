import {WordQueues} from "./api.js";

main();

async function main() {
    const inputElem = document.querySelector("input");
    const resultElem = document.querySelector("#result");

    inputElem.addEventListener("input", handle);

    await WordQueues.init();
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
}



