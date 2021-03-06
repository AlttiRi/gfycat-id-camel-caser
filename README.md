# [gfycat-id-camel-caser](https://alttiri.github.io/gfycat-id-camel-caser/)
The demo site that turns Gfycat's lowercase ID to CamelCase formatted ID.

---

<p align="center">
  <img src="https://user-images.githubusercontent.com/16310547/110215476-128ac300-7ebb-11eb-9a3a-66062a997056.png" alt="darkcreepybat -> DarkCreepyBat" title="darkcreepybat -> DarkCreepyBat"/>
</p>

---

Gfycat's ID matches such pattern: [Adjective](https://github.com/AlttiRi/gfycat-id-camel-caser/blob/master/dictionaries/adjectives.json)[Adjective](https://github.com/AlttiRi/gfycat-id-camel-caser/blob/master/dictionaries/adjectives.json)[Animal](https://github.com/AlttiRi/gfycat-id-camel-caser/blob/master/dictionaries/animals.json).

The example: 
- `lazyfatcat` turns to `LazyFatCat`.
- `emobluedog` turns to  `EmoBlueDog`
- `hexakosioihexekontahexaphobicparaskavidekatriaphobicqueenalexandrasbirdwingbutterfly`
turns to 
`HexakosioihexekontahexaphobicParaskavidekatriaphobicQueenalexandrasbirdwingbutterfly`

---

# Search logic

It is trying to match the most longer string by pattern `["adjective", "adjective", "animal"]` ignoring non `[a-zA-Z]` characters.
If the first is "adjective", then it looks for "adjective", then for "animal".
If no result has found, it is looking for any word sequence available in both dictionaries (adjectives and animals).
For example:
- `34REDCAT` -> `Red` _("adjective")_
- `blueredcatdog` -> `BlueRedCat` _("adjective", "adjective", "animal")_
- `catwhitedogred` -> `CatWhiteDogRed` _(No pattern used)_
- `happy-wideeyed-bullmastif` -> `HappyWideeyedBull`
- `happy-wideeyed-bullmastiff` -> `HappyWideeyedBullmastiff`

# iframe API

Here is the code snipped that you only need, which does two things:
- creates, appends, awaits the loading of the iframe,
- incapsulates the message communication logic within an easy to use async function.

This function is not this project specific, and can be reused for any other single function iframe API.
```js
async function initIframeAPI({src, name}) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("referrerpolicy", "no-referrer");
    iframe.setAttribute("style", "display: none;");
    iframe.setAttribute("src", src);
    document.body.append(iframe);
    await new Promise(resolve => {
        iframe.addEventListener("load", resolve);
    });

    let i = 0; const seed = Math.random().toString().substring(2);
    return function() {
        const inputArguments = [...arguments];
        const id = `${name}:${seed}:${i++}`;
        iframe.contentWindow.postMessage({inputArguments, id}, "*");
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
```

Here is the usage example:
```js
/**
 * @param {String} inputString
 * @param {TypeWord[]?} types = ["adjective", "adjective", "animal"]
 * @return {Promise<MatchResult>}
 */
const matchGfyId = await initIframeAPI({
    src: "https://alttiri.github.io/gfycat-id-camel-caser/iframe-api.html",
    name: "gfy-id-camel-caser"
});

/** @type {MatchResult} */
const result = await matchGfyId("redbluecat");
console.log(result.string); // "RedBlueCat"

console.log(await matchGfyId("catduck", ["animal", "animal"]));

```


The code of `iframe-api.html` is pretty simple:
```js
import {matchGfyId} from "./js/api.js";

const iframeApiName = "gfy-id-camel-caser";
window.onmessage = async function(event) {
    const {data: {inputArguments, id}, source, origin} = event;
    const result = await matchGfyId(...inputArguments);
    source.postMessage({
        data: result,
        from: iframeApiName,
        messageId: id
    }, origin);
};
```

Here is the example of the site that uses such approach: [alttiri.github.io/gfycat-id-camel-caser/?iframe=true](https://alttiri.github.io/gfycat-id-camel-caser/?iframe=true)

# Dictionaries

This site uses dictionaries of 
[animals](https://github.com/AlttiRi/gfycat-id-camel-caser/blob/master/dictionaries/animals.json) and 
[adjectives](https://github.com/AlttiRi/gfycat-id-camel-caser/blob/master/dictionaries/adjectives.json) words that are compilations of words available there:
[[1]](https://github.com/dexo568/gfycat-style-urls/),
[[1.1]](https://gist.github.com/ijmacdowell/8325491),
[[2]](https://codepen.io/r_p4rk/pen/rxWBwa),
[[3]](https://github.com/a-type/adjective-adjective-animal/tree/master/lib/lists).
