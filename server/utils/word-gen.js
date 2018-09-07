const fs = require('fs');
const dictionary = fs.readFileSync('./server/utils/dictionary.json', 'utf8');
const DICTIONARY = JSON.parse(dictionary);

class Words {
    constructor () {
        this.indices = [];
        this.wordArr = [];
    }
    newWordObject () { //get word that hasn't already been generated
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
                //console.log(hintWord);
                var wordObj = { word, hintWord };
                this.wordArr.push(wordObj);
                return wordObj ;
            }
        }
        return undefined;
    }
    getLatestWord () {
        return this.wordArr[this.wordArr.length-1];
    }
}

module.exports = {
    DICTIONARY,
    Words
}

