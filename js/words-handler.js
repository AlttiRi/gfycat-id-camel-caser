import {getWords} from "./api.js";

class Initializer {
    get inited() {
        return this._inited;
    }
    async init() {
        if (this._initialization) {
            await this._initedPromise;
        } else if (!this._inited) {
            await this._init();
        }
    }
    constructor(self, initLogic, run = false) {
        this._target = self;
        this._initLogic = initLogic;
        if (run) {
            this._init();
        }
    }

    _inited = false;
    _initialization = false;
    _initedResolve;
    _initedPromise = new Promise(resolve => {
        this._initedResolve = resolve;
    });
    async _init() {
        if (this._initialization || this._inited) {
            return;
        }
        this._initialization = true;
        await this._initLogic.call(this._target);
        this._initedResolve();
        this._initedPromise = Promise.resolve();
        this._inited = true;
        this._initialization = false;
        // console.log(this._target?.name, "inited");
    }
}

// Well, probably it makes more sense to inject the data instead of the self initialization, but let it be so.
class Types {
    /** @type {Set<String>} */
    static adjectives;
    /** @type {Set<String>} */
    static animals;

    static getTypes(word) {
        const types = [];
        Types.animals.has(word)    && types.push("animal");
        Types.adjectives.has(word) && types.push("adjective");
        return types;
    }

    static get inited() { return this._initializer.inited; }
    static init() { return this._initializer.init(); }
    static _initializer = new Initializer(this, this._initLogic);
    static async _initLogic() {
        const {adjectives: adjectivesArray, animals: animalsArray} = await getWords();
        const adjectives = new Set(adjectivesArray.map(el => el.toLowerCase()));
        const animals = new Set(animalsArray.map(el => el.toLowerCase()));

        this.adjectives = adjectives;
        this.animals = animals;
    }
}

class Word {
    /** @type {String} */
    value;
    /** @type {Array<String>} */
    types;
    constructor(value, types) {
        this.value = value;
        this.types  = types;
    }
    is(type) {
        return this.types.includes(type);
    }
}

class WordQueue {
    /** @type {Array<Word>} */
    words;
    /** @type {String} */
    chars;
    constructor(words = [], chars = "") {
        this.words = words;
        this.chars = chars;
    }
    enqueueWord({types}) {
        this.words.push(new Word(this.chars, types));
        this.chars = "";
    }
    append(char) {
        this.chars += char;
        return this.getChars();
    }
    getChars() {
        return this.chars;
    }
    toString(number = Number.MAX_SAFE_INTEGER) {
        return this.words.slice(0, number).map(w => {
            const word = w.value;
            return word.charAt(0).toUpperCase() + word.substring(1);
        }).join("");
    }
    copy() {
        const wordsArrayCopy = JSON.parse(JSON.stringify(this.words)) // [...this.words];
        return new WordQueue(wordsArrayCopy, this.chars);
    }
}

export class WordQueues {
    queues = [new WordQueue()];

    static get inited() { return this._initializer.inited; }
    static init() { return this._initializer.init(); }
    static _initializer = new Initializer(this, this._initLogic, true);
    static async _initLogic() {
        await Types.init();
    }

    handle(inputString) {
        for (const char of inputString) {
            this.enqueue(char);
        }
    }

    enqueue(char) {
        this.queues.forEach(queue => { // Warn: Array self modifying. Use only forEach.
            const currentWord = queue.append(char);
            let types = Types.getTypes(currentWord);
            if (types.length) {
                this.queues.push(queue.copy()); // [!here]
                queue.enqueueWord({types});
            }
        });
    }

    /**
     * Returns the most long string for any types order
     * @return {WordQueue}
     */
    getResultSimple() {
        const wordQueue = this.queues.reduce((acc, cur) => {
            if (acc.toString().length > cur.toString().length) {
                return acc;
            } else {
                return cur;
            }
        });
        if (wordQueue.words.length) {
            return wordQueue;
        }
        return null;
    }

    /**
     * It tolerates to not equal length of "wordArray" and "types" arguments
     * @param {Word[]} wordArray
     * @param {String[]} types
     */
    static isWordArraySoftMatchesPatten(wordArray, types) {
        if (types.length > wordArray.length) {
            return wordArray
                .map(word => word.types)
                .every((wordTypes, index) => {
                    return wordTypes.includes(types[index]);
                });
        } else {
            return types.every((type, index) => {
                return wordArray[index].types.includes(type);
            });
        }
    }

    /**
     * Requirement:
     * The same types order
     *
     * Preferences:
     * The same types count or near to it
     * The most long available string result (the less count of tailing "chars" for the same words count)
     *
     * @param {String[]} types
     * @return {WordQueue|null}
     */
    getMoreAppropriateStringByPattern(types) {
        const wordQueues = this.queues
            .filter(wordQueue => {
                return WordQueues.isWordArraySoftMatchesPatten(wordQueue.words, types);
            });

        /** @type {WordQueue[]} */
        let subResults;

        let expectedWordCount = types.length;
        while (expectedWordCount) {
            subResults = wordQueues.filter(wordQueue => wordQueue.words.length === expectedWordCount);
            if (subResults.length) {
                break;
            }
            expectedWordCount--;
        }
        if (!subResults.length) {
            return null;
        }

        // Select the most long string
        const result = subResults.reduce((pre, cur) => {
            const preCharsLength = pre.chars.length;
            const curCharsLength = cur.chars.length;
            if (preCharsLength < curCharsLength) {
                return pre;
            } else {
                return cur;
            }
        });
        return result;
    }
}
