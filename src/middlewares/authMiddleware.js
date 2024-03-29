import JWT from "jsonwebtoken";
import authModel from "../models/authModel.js";
import ApiError from "../utils/ApiError.js";

export const requiredSignIn = async (req, res, next) => {
    const token = req.cookies.token || req.body.token || (req.headers.authorization || '').replace('Bearer', '').trim();
    if (!token) {
        return next(new ApiError(400, 'Unauthenticated, please login'));
    }

    const tokenDetails = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDetails) {
        return next(new ApiError(401, 'Invalid token, please login'));
    }

    req.user = tokenDetails;
    next();
}


//Middleware for protecting routes
export function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        JWT.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.sendStatus(403); //Forbidden
            }
            req.user = user;
            next();
        })
    }
}


export const isAdmin = async (req, res, next) => {
    try {
        const user = await authModel.findById(req.user._id);
        if (user.role !== "ADMIN") {
            return next(new ApiError(401, 'UnAuthorizes Access'))
        }
        else {
            next();
        }
    } catch (error) {
        next(new ApiError(500, error.message));
    }
}