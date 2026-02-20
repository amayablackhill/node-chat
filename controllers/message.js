var Message = require("../models/mensaje");

exports.getMessages = async (req, res, next) => {
    try {
        req.room = req.query.salas || [1, 2, 3, 4];
        req.messages = await Message.find({ channel: req.room }).sort({ date: 1 });

        next();

    } catch (error) {
        console.error(`Error: ${error}`);
        // Fallback genérico a next() o renderizado básico según la ruta original
        req.messages = [];
        req.user = null;
        next();
    }
};

exports.sendMessage = async (req, res, next) => {
    try {
        req.mensaje = req.body.mensaje;
        req.usuario = req.body.usuario || (req.user ? req.user.nomuser : null);
        req.room = req.body.salas;
        req.date = Date.now();

        const newMessage = new Message({
            usuario: req.usuario,
            mensaje: req.mensaje,
            date: req.date,
            channel: req.room,
            userPic: req.user ? req.user.profilePic : "uploads/default.png"
        });

        await newMessage.save();
        next();
    } catch (error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ error: "Error al enviar el mensaje" });
    }
};

exports.deleteHistory = async (req, res, next) => {
    try {
        const room = req.body.room || req.query.salas || req.params.room;

        if (!room) {
            return res.status(400).json({ error: "Room parameter is required." });
        }

        await Message.deleteMany({ channel: room });
        req.room = room;
        next();
    } catch (error) {
        console.error(`Error deleting history: ${error}`);
        res.status(500).json({ error: "Internal server error." });
    }
};
