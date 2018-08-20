var isRealString = (str) => {
    //returns true if it's a string, false if not
    return  typeof str === 'string' && str.trim().length>0;
};

module.exports = {isRealString};