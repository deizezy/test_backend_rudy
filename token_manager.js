const jwt = require('jsonwebtoken');
const cry = require('crypto');
const token_data = require('./token_data.json')

class TokenManager {
    static GenerateToken(payload) {
        return jwt.sign(payload, token_data['secret_key'], { "expiresIn": "60s" });
    }
    static checkAuth(request) {
        try {
            console.log(request.headers);
            let accessToken = request.headers.authorization.split(" ")[1];
            let jwtRes = jwt.verify(String(accessToken), token_data['secret_key']);
            return jwtRes;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    static getSecretKey() {
        return cry.randomBytes(64).toString("hex");
    }
}

module.exports = TokenManager;