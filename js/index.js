// import {matchGfyId} from "./api.js";

main();

async function main() {
    const inputElem = document.querySelector("input");
    const resultElem = document.querySelector("#result");

    const url = new URL(location.href);
    const useIframeApi = (function() {
        try {
            return JSON.parse(url.searchParams.get("iframe"));
        } catch { return false; }
    })();

    if (useIframeApi) {
        globalThis.matchGfyId = await initIframeAPI({
            src: "https://alttiri.github.io/gfycat-id-camel-caser/iframe-api.html",
            name: "gfy-id-camel-caser"
        });
    } else {
        appendInlineScript(`
            import {matchGfyId} from "./js/api.js";
            globalThis.matchGfyId = matchGfyId;
        `, true);
    }

    inputElem.addEventListener("input", inputHandler);
    async function inputHandler(event) {
        /** @type {MatchResult} */
        const result = await matchGfyId(parseFromUrl(inputElem.value));
        viewHandler(result);
    }

    function parseFromUrl(textSearch) {
        if (["https://", "http://"].some(prefix => textSearch.startsWith(prefix))) {
            try {
                const url = new URL(textSearch);
                const match = url.pathname.match(/[^\/]+$/);
                return match ? match[0] : textSearch;
            } catch (e) {
                console.log("[error][url-parsing]", e);
            }
        }
        return textSearch;
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
        iframe.addEventListener("load", resolve, {once: true});
    });

    let i = 0; const seed = Math.random().toString().substring(2);
    return function() {
        const inputArguments = [...arguments];
        const id = `${name}:${seed}:${i++}`;
        iframe.contentWindow.postMessage({inputArguments, id}, "*"); // Only "*". new URL(src).origin does not work with "sandbox" iframe. A stupid limitation.
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
