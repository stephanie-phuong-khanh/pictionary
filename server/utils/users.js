class Games {
    constructor () {
        this.games = [];
        //game code
        //player1, player2, player3, player4
        //team 1
        //team 2
        //team 1 score
        //team 2 score
        this.score = 0;
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
    removeUser (id) {
        var user = this.getUser(id);
        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return user;
    }
    getUser (id) {
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