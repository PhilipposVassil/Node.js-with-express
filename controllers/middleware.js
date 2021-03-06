const {handleResponse, refreshTokens, verifyToken} = require("../utils");

module.exports.auth = function (req, res, next) {
// middleware that checks if JWT token exists and verifies it if it does exist.
// In all private routes, this helps to know if the request is authenticated or not.

        // check header or url parameters or post parameters for token
        let token = req.headers['authorization'];
        if (!token) return handleResponse(req, res, 401);

        token = token.replace();

        // get xsrf token from the header
        const xsrfToken = req.headers['x-xsrf-token'];
        if (!xsrfToken) {
            return handleResponse(req, res, 403);
        }

        // verify xsrf token
        const {signedCookies = {}} = req;
        const {refreshToken} = signedCookies;
        if (!refreshToken || !(refreshToken in refreshTokens) || refreshTokens[refreshToken] !== xsrfToken) {
            return handleResponse(req, res, 401);
        }

        // verify token with secret key and xsrf token
        verifyToken(token, xsrfToken, (err, payload) => {
            if (err)
                return handleResponse(req, res, 401);
            else {
                req.user = payload; //set the user to req so other routes can use it
                next();
            }
        });
    };