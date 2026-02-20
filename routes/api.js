var express = require("express");
var router = express.Router();
var Users = require("../controllers/users");
var Messages = require("../controllers/message");
var { requireAuth } = require("../middlewares/auth");

/**
 * AUTH ENDPOINTS
 */

// Login devuelve token en cookie (ya lo hace el propio controller) y un status 200 en JSON
router.post("/auth/login", Users.login, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

// Registro
router.post("/auth/register", Users.validar, Users.save, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

// Logout (Limpiar Cookie)
router.post("/auth/logout", (req, res) => {
    res.clearCookie("jwt_auth");
    res.status(200).json({ success: true });
});

// Perfil (Obtener estado de sesión actual para el front sin recargar y validar cookie de forma segura) 
router.get("/auth/session", requireAuth, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

/**
 * MESSAGES ENDPOINTS
 */

// Obtener mensajes históricos de una sala en json (para React/Vue o Fetch de EJS)
router.get("/messages", requireAuth, Messages.getMessages, (req, res) => {
    res.status(200).json({ success: true, messages: req.messages, room: req.room });
});

// Borrar el historial
router.post("/messages/clear", requireAuth, Messages.deleteHistory, (req, res) => {
    res.status(200).json({ success: true, room: req.room });
});

module.exports = router;
