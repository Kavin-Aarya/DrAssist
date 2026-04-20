import jwt from "jsonwebtoken";

const auth = (res, userID) => {
    const id = (userID?._id ?? userID).toString();
    const token = jwt.sign({ id:id }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"});
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "1d"});

    res.cookie("refreshToken", refreshToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return token;
}

export const refresh = (req,res) => {
    const cookies = req.cookies;
    if (!cookies.refreshToken) {
        res.status(401).json({ message: "Unauthorized"});
    }

    const refreshToken = cookies.refreshToken;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, asyncHandler(async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const foundUser = await User.findOne({ id: decoded.id});
        if (!foundUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = jwt.sign({ id: userID }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "10s"});
    }));

    res.json({token});

}

export const logout = (req, res) => {
    // Add the || {} fallback so it doesn't crash if cookie-parser is missing
    const cookies = req.cookies || {}; 
    if (!cookies.refreshToken) {
        return res.sendStatus(204); // Must be sendStatus, not just status
    }
    res.clearCookie("refreshToken", {httpOnly: true, sameSite: "None", secure: "true"});
    return res.json({ message: 'Cookie Cleared' });
};

export const verifyToken = (req, res, next) => {
    // Check for token in cookies or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Attach the user ID to the request object
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

export default auth