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

export class WordQueue {
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
    get __LINE__() { // for debug
        return this.toString();
    }
    copy() {
        const wordsArrayCopy = JSON.parse(JSON.stringify(this.words)) // [...this.words];
        return new WordQueue(wordsArrayCopy, this.chars);
    }
}

export class WordQueues {
    queues = [new WordQueue()];
    handle(inputString) {
        let index = 0;
        for (const char of inputString) {
            const isLast = inputString.length === index + 1;
            this.enqueue(char, isLast);
            index++;
        }
    }
    enqueue(char, isLast) {
        this.queues.forEach(queue => { // Warn: Array self modifying. Use only forEach.
            const currentWord = queue.append(char);
            let types = WordQueues.getTypes(currentWord);
            if (types.length) {
                //if (!isLast) { // commented to simplify logic
                    this.queues.push(queue.copy()); // [!here]
                //}
                queue.enqueueWord({types});
            }
        });
    }

    static getTypes(word) {
        let types = [];
        animals.has(word) && types.push("animal");
        adjectives.has(word) && types.push("adjective");
        return types;
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
     * @param {String[]} types   */
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



    // todo delete
    /** @param {Word[]} wordArray
     *  @param {String[]} types   */
    static isWordArrayMatchesPattenHard(wordArray, types) {
        if (types.length !== wordArray.length) {
            return false;
        }
        return wordArray
            .map(word => word.types)
            .every((wordTypes, index) => {
                return wordTypes.includes(types[index]);
            });
    }

    // todo delete
    /**
     * Return the first matched to the types pattern string
     * @return {string}
     */
    getResultByPatten(types) {
        const results = [];

        for (const wordQueue of this.queues) {
            if (wordQueue.words.length !== types.length) {
                continue;
            }
            const matched = WordQueues.isWordArraySoftMatchesPatten(wordQueue.words, types);
            if (matched) {
                console.log("matched", wordQueue.toString());
                results.push(wordQueue);
            }
        }
        console.log(results);
        return results
            .map(wordQueue => wordQueue.toString(types.length))
            .reduce((pre, cur) => pre.length >= cur.length ? pre : cur);
    }

    // todo delete
    /**
     * @typedef SearchResult
     * @property {WordQueue} wordQueue
     * @property {"full" | "partial"} match
     * @property {Boolean} hasTailingChars
     * @property {Number} wordCount
     */
    /**
     * @param {String[]} types
     * @return {SearchResult[]}
     */
    getResultsByPatten(types) {
        const results = [];

        for (const wordQueue of this.queues) {
            const matched = WordQueues.isWordArraySoftMatchesPatten(wordQueue.words, types);

            if (matched) {
                let sameWordCount, noTailingChars;

                if (wordQueue.words.length === types.length) {
                    sameWordCount = true;
                }
                if (wordQueue.chars.length === 0) {
                    noTailingChars = true;
                }

                const result = {wordQueue, wordCount: wordQueue.words.length};
                if (!noTailingChars) {
                    Object.assign(result, {hasTailingChars: true});
                }
                if (sameWordCount) {
                    Object.assign(result, {match: "full"});
                } else {
                    Object.assign(result, {match: "partial"});
                }
                results.push(result);
            }
        }
        return results;
    }

}






