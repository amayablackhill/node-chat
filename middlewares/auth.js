var jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // Intentamos leer el token firmado desde la cookie
    const token = req.cookies.jwt_auth;

    if (!token) {
        // Si no hay token, el usuario no está autenticado
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ej. { userId: '...', nomuser: '...', profilePic: '...' }
        next();
    } catch (err) {
        console.error("Token JWT inválido o expirado", err);
        req.user = null;
        next();
    }
};

exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/");
    }
    next();
};
