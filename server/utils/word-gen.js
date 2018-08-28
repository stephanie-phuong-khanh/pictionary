const fs = require('fs');
const dictionary = fs.readFileSync('./server/utils/dictionary.json', 'utf8');
const DICTIONARY = JSON.parse(dictionary);

class Words {
    constructor () {
        this.indices = [];
    }
    getWordObject () { //get word that hasn't already been generated
        for (;;) {
            var randomIndex = Math.floor(Math.random()*DICTIONARY.length);
            var alreadyExisting = this.indices.find(num=>num===randomIndex);
            if (!alreadyExisting) { 
                var word = DICTIONARY[randomIndex];
                var letterHintIndex = Math.floor(Math.random()*word.length);
                var hintWord = "";
                function setCharAt(str,index,chr) {
                    if(index > str.length-1) return str;
                    return str.substr(0,index) + chr + str.substr(index+1);
                }
                for (var i=0; i<word.length; i++) {
                    hintWord += "_";
                }
                hintWord = setCharAt(hintWord, letterHintIndex, word[letterHintIndex]);
                console.log(hintWord);
                return { word, hintWord };
            }
        }
        return undefined;
    }
}

var words = new Words;
console.log(words.getWordObject());

module.exports = {
    DICTIONARY,
    Words
}

