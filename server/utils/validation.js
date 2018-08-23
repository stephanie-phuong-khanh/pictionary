var isRealString = (str) => {
    //returns true if it's a string, false if not
    return typeof str === 'string' && str.trim().length>0;
};

var isRealCode = (str) => {
    var result = typeof str === 'string' && str.length === 4;
    for (var i = 0; i < str.length; i++) { 
        if (str.charCodeAt(i) < 48 || str.charCodeAt(i) > 57) {
            return false;
        }
    }
    return result;
}

module.exports = {isRealString, isRealCode};