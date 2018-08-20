var randtoken = require('rand-token').generator({
    chars: '0-9'
});

var tokenGenerate = () => {
    return randtoken.generate(4);
}

module.exports = {tokenGenerate};

//console.log(tokenGenerate());


