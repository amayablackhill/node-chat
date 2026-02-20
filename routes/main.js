var express = require("express");
var path = require("path");
var router = express.Router();
var controllerDir = "../controllers";
var Users = require(path.join(controllerDir, "users"));
var Messages = require(path.join(controllerDir, "message"));
var Upload = require(path.join(controllerDir, "upload"));
var { verifyToken, requireAuth } = require("../middlewares/auth");

// Inyectar usuario en TODAS las peticiones EJS para que el header sepa si hay login
router.use(verifyToken);

router.get("/", async (req, res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    if (req.user) {
        return res.redirect("/chat-list");
    }
    res.render("principal", { user: req.user });
});

router.post("/login", Users.login, (req, res) => {
    if (!req.user) {
        return res.redirect("/");
    }
    res.redirect("/chat-list");
});

router.get("/register", (req, res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    if (req.user) {
        return res.redirect("/chat-list");
    }
    res.render("register", { user: req.user });
});

router.post("/register", Users.validar, Users.save, (req, res) => {
    res.redirect("/chat-list");
});

// ✅ Mostrar mensajes en la sala de chat
router.get("/chat/view", requireAuth, Messages.getMessages, (req, res) => {
    res.render("chat", {
        messages: req.messages,
        room: req.room,
        user: req.user
    });
});

// ✅ Enviar mensaje vía vista EJS clásica (mantemos compatibilidad, aunque mejor será usar /api/messages)
router.post("/chat/view", requireAuth, Messages.sendMessage, (req, res) => {
    res.redirect(`/chat/view?salas=${req.room}`);
});

// ✅ Historial de mensajes
router.get("/history/list", requireAuth, (req, res) => {
    res.render("history-list", { user: req.user });
});

router.get("/history/view/", requireAuth, Messages.getMessages, (req, res) => {
    res.render("history", {
        messages: req.messages,
        room: req.room,
        user: req.user
    });
});

router.post("/history/delete", requireAuth, Messages.deleteHistory, (req, res) => {
    res.render("history", { messages: [], room: req.room, user: req.user });
});

// ✅ Cerrar sesión correctamente (ahora usando la cookie)
router.get("/logout", (req, res) => {
    res.clearCookie("jwt_auth");
    res.redirect("/");
});

// ✅ Lista de chats
router.get("/chat-list", requireAuth, (req, res) => {
    res.render("chat-list", { user: req.user });
});

router.get("/error", (req, res) => {
    res.render("error", { user: req.user, message: "Ha ocurrido un error inesperado" });
});

// perfil
router.get("/perfil", requireAuth, (req, res) => {
    res.render("perfil", { user: req.user });
});

router.post("/perfil", requireAuth, Upload.uploadImg.single("profilePic"), Users.updateFoto, Users.updateNombre, (req, res) => {
    res.redirect("/perfil");
});

module.exports = router;