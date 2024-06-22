const jwt = require('jsonwebtoken');

const getUserIdFromToken = (token) => {

    try {
        const decoded = jwt.verify(token, 'VbhxvsSEON');
        return decoded.id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }

} 

module.exports = getUserIdFromToken;