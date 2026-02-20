require("dotenv").config();
const port = process.env.SERVER_PORT || 3000;
const Mensaje = require("./models/mensaje.js");
var express = require("express"),
  fs = require("fs"),
  app = express(),
  http = require("http"),
  path = require("path"),
  { Server } = require("socket.io"),
  cookieParser = require("cookie-parser"),
  mongoose = require("mongoose"),
  multer = require("multer");

const server = http.createServer(app);

server.listen(port, (err, res) => {
  if (err) console.log(`ERROR: Connecting APP ${err}`);
  else console.log(`Server is running on port ${port}`);
});

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err, res) => {
    if (err) console.log(`ERROR: connecting to Database.  ${err}`);
    else console.log(`Database Online`);
  }
);

// Sockets
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("joinRoom", async ({ user, sala }) => {
    try {
      socket.join(sala);
      console.log(`${user} se ha unido a la sala: ${sala}`);

      const messages = await Mensaje.find({ channel: sala });
      socket.emit("history", messages);
    } catch (err) {
      console.error("Socket joinRoom error:", err);
    }
  });

  socket.on("toChat", async (data) => {
    try {
      const { sala, mensaje, usuario } = data;
      const date = new Date();

      console.log(`MENSAJE: ${usuario} -> ${mensaje}`);

      const newMessage = new Mensaje({
        channel: sala,
        mensaje,
        date,
        usuario,
        userPic: data.profilePic || "default.png"
      });
      await newMessage.save();

      io.to(sala).emit("message", {
        usuario,
        mensaje,
        date,
        profilePic: data.profilePic || "default.png"
      });
    } catch (err) {
      console.error("Socket toChat error:", err);
    }
  });

  // Indicador de Escribiendo...
  socket.on("typing", (data) => {
    socket.to(data.sala).emit("typing", data.usuario);
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.sala).emit("stopTyping", data.usuario);
  });
});


// Configuraciones de Express
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware de Cookies en lugar de Session
app.use(cookieParser());

// Importar rutas
var routesApi = require("./routes/api");
app.use("/api/v1", routesApi);

var routesMain = require("./routes/main");
app.use("/", routesMain);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).render("error", {
    message: err.message || "Ha ocurrido un error inesperado en el servidor.",
    user: req.user || null
  });
});

module.exports = app;
