const {DICTIONARY, Words} = require('./word-gen');

class Games {
    constructor () {
        this.games = [];
    }
    newGame (room, firstPlayer) {
        var game = {
            room,
            gamePlayers : [],   //player objects
            team1: {
                member1: undefined,
                member2: undefined,
                score: 0
            },
            team2: {
                member1: undefined,
                member2: undefined, 
                score: 0
            },
            turnNumber: 0,
            words: new Words
        };
        game.gamePlayers.push(firstPlayer);
        this.games.push(game);
        return game;
    }
    addPlayer (room, addedPlayerObj) {
        var game = this.getGame(room);
        if (game.gamePlayers.length < 4) {
            game.gamePlayers.push(addedPlayerObj);
        } else {return undefined;} //room is full
        return addedPlayerObj;
    }
    getGame (room) { //returns game
        return this.games.filter((game) => game.room === room)[0];
    }
    getNumberOfPlayersInGame (room) {
        return this.getGame(room).gamePlayers.length;
    }
    setTeams (room) {
        function shuffle (array) {   //helper function
            var currentIndex = array.length, temporaryValue, randomIndex;
            while (0 !== currentIndex) {
              randomIndex = Math.floor(Math.random() * currentIndex);
              currentIndex -= 1;
              temporaryValue = array[currentIndex];
              array[currentIndex] = array[randomIndex];
              array[randomIndex] = temporaryValue;
            }
            return array;
        }
        var arrBefore = this.getGame(room).gamePlayers;
        var arrAfter = shuffle(arrBefore);
        this.getGame(room).team1.member1 = arrAfter[0];
        this.getGame(room).team2.member1 = arrAfter[1];
        this.getGame(room).team1.member2 = arrAfter[2];
        this.getGame(room).team2.member2 = arrAfter[3];
        this.getGame(room).gamePlayers = arrAfter;      //permanently re-arranges gamePlayers array
    }
    returnScore (teamNumber, room) {
        if (teamNumber === 1) {
            return this.getGame(room).team1.score;
        } else if (teamNumber === 2) {
            return this.getGame(room).team2.score;
        }
        return -1;
    }
    removeUserFromGame (room, playerID) {
        var game = this.getGame(room); //returns game
        if (game) {
            if (game.gamePlayers.length > 1) {
                var changedGame = this.getGame(room); //game
                changedGame.gamePlayers = changedGame.gamePlayers.filter((gamePlayer) => gamePlayer.id !== playerID);
                this.games = this.games.filter((game) => game.room !== room);
                this.games.push(changedGame);
            } else { //last player --> compelely remove game
                this.deleteGame(room);
            }
        }
    }
    deleteGame (room) {
        console.log('DELETING GAME');
        var game = this.getGame(room);
        if (room) {
            return this.games = this.games.filter((game) => game.room !== room);
        }
        return 0;
    }
    increaseTurn (room) {
        console.log('Increase Turn function called');
        for (var i=0; i<this.games.length; i++) {
            if (this.games[i].room === room) { 
                this.games[i].turnNumber++; 
                console.log('Turn:', this.games[i].turnNumber);
                return this.games[i].turnNumber;
            }
        }
        return undefined;
    }
    /*
    *       GAME PLAY FUNCTIONS
    */
    newWord (room) {
        for (var i=0; i<this.games.length; i++) {
            if (this.games[i].room === room) { 
                this.games[i].words.newWordObject(); 
                var newWord = this.games[i].words.getLatestWord();
                console.log('New word:', newWord);
                return newWord;
            }
        }
    }

    addScore (teamNumber, room) { //teamNumber either 1 or 2
        if (teamNumber === 1) {
            this.getGame(room).team1.score++;
        } else if (teamNumber === 2) {
            this.getGame(room).team2.score++;
        }
        return this.returnScore(teamNumber, room);
    }
}



class Users {
    constructor () {
        this.users = [];
    }
    addUser(id, name, room) {
        var user = {id, name, room};
        this.users.push(user);
        return user;
    }
    // setTurn (idArg, turnNum) {
    //     for (var i=0; i<this.users.length; i++) {
    //         if (this.users[i].id === idArg) { this.users[i].turn = turnNum; return; }
    //     }
    //     //this.users.filter((user) => user.id === idArg)[0].turn = turnNum;
    // }
    removeUser (id) {
        var user = this.getUser(id);
        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return user;
    }
    getUser (id) { //returns user
        return this.users.filter((user) => user.id === id)[0];
    }
    getUserByRoom (room) {
        return this.users.filter((user) => user.room === room)[0];
    }
    getUserList (room) {
        //returns an array of strings of names
        var users = this.users.filter((user) => user.room === room);
        var namesArray = users.map((user) => user.name);
        return namesArray;
    }
}

module.exports = {
    Games,
    Users
};