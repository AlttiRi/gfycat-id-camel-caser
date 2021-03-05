// import {matchString} from "./api.js";

main();

async function main() {
    const inputElem = document.querySelector("input");
    const resultElem = document.querySelector("#result");

    const url = new URL(location.href);
    const useIframeApi = JSON.parse(url.searchParams.get("iframe"));

    if (useIframeApi) {
        globalThis.matchString = await initIframeAPI({
            src: "https://alttiri.github.io/gfycat-id-camel-caser/iframe-api.html",
            name: "gfy-id-camel-caser"
        });
    } else {
        appendInlineScript(`
            import {matchString} from "./js/api.js";
            globalThis.matchString = matchString;
        `, true);
    }

    inputElem.addEventListener("input", inputHandler);
    async function inputHandler(event) {
        /** @type {MatchResult} */
        const result = await matchString(inputElem.value);
        viewHandler(result);
    }

    /** @param {MatchResult} result */
    function viewHandler(result) {
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

async function initIframeAPI({src, name}) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("referrerpolicy", "no-referrer"); // Hide to GitHub from where you use this iframe.
    iframe.setAttribute("style", "display: none;");
    iframe.setAttribute("src", src);

    document.body.append(iframe);
    await new Promise(resolve => {
        iframe.addEventListener("load", resolve);
    });

    let i = 0; const seed = Math.random();
    return function(inputData) {
        const id = `${name}:${seed}:${i++}`;
        iframe.contentWindow.postMessage({inputData, id}, "*"); // Only "*". new URL(src).origin does not work with "sandbox" iframe. A stupid limitation.
        let promiseResolve;
        const handler = event => {
            const {data, from, messageId} = event.data;
            if (name === from && id === messageId) {
                window.removeEventListener("message", handler);
                promiseResolve(data);
            }
        }
        return new Promise(resolve => {
            promiseResolve = resolve;
            window.addEventListener("message", handler);
        });
    }
}

function appendInlineScript(code, module = false) {
    const script = document.createElement("script");
    script.textContent = code;
    module && (script.type = "module");
    document.querySelector("head").append(script);
}

