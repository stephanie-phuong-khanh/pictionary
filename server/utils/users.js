class Games {
    constructor () {
        this.games = [];
    }
    newGame (room, firstPlayer) {
        var game = {
            room,
            gamePlayers : [],
            team1: {
                member1: undefined,
                member2: undefined,
                score: 0
            },
            team2: {
                member1: undefined,
                member2: undefined, 
                score: 0
            }
        };
        game.gamePlayers.push(firstPlayer);
        this.games.push(game);
        return game;
    }
    addPlayer (room, addedPlayer) {
        var game = this.getGame(room);
        if (game.gamePlayers.length < 4) {
            game.gamePlayers.push(addedPlayer);
        } else {return undefined;} //room is full
        return addedPlayer;
    }
    returnScore (teamNumber, room) {
        if (teamNumber === 1) {
            return this.getGame(room).team1.score;
        } else if (teamNumber === 2) {
            return this.getGame(room).team2.score;
        }
        return -1;
    }
    addScore (teamNumber, room) { //1 or 2
        if (teamNumber === 1) {
            this.getGame(room).team1.score++;
        } else if (teamNumber === 2) {
            this.getGame(room).team2.score++;
        }
        return this.returnScore(teamNumber, room);
    }
    getGame (room) { //returns game
        console.log('GET GAME:', this.games.filter((game) => game.room === room)[0]);
        return this.games.filter((game) => game.room === room)[0];
    }
    getNumberOfPlayersInGame (room) {
        return this.games.getGame(room).gamePlayers.length;
    }
    setTeams (room) {
        var arrBefore = this.getGame(room).gamePlayers;
        var arrAfter = shuffle(arrBefore);
        this.getGame(room).team1.member1 = arrAfter[0];
        this.getGame(room).team1.member2 = arrAfter[1];
        this.getGame(room).team2.member1 = arrAfter[2];
        this.getGame(room).team2.member2 = arrAfter[3];
    }
    removeUserFromGame (room, player) { //what if single player leaves tho?
        var game = this.getGame(room); //returns game
        if (game) {
            if (game.gamePlayers.length > 1) {
                var changedGame = this.getGame(room); //game
                changedGame.gamePlayers = changedGame.gamePlayers.filter((gamePlayer) => gamePlayer !== player);
                this.games = this.games.filter((game) => game.room !== room);
                this.games.push(changedGame);
            } else { //last player --> compelely remove game
                this.deleteGame(room);
            }
        }
    }
    deleteGame (room) {
        var game = this.getGame(room);
        if (room) {
            return this.games = this.games.filter((game) => game.room !== room);
        }
        return 0;
    }
}

var shuffle = (array) => {
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

class Users {
    constructor () {
        this.users = [];
    }
    addUser(id, name, room) {
        var user = {id, name, room};
        this.users.push(user);
        return user;
    }
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
    Users,
    shuffle
};