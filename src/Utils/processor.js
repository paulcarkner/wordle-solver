import {words, allowed} from './words.js';

// const reduceList = (words, letterState) => {
//     return false;
// }

export const checkWord = (word) => {
    return words.includes(word) || allowed.includes(word);
}

export const wordList = [...words, ...allowed];