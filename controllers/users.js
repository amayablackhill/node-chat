var User = require("../models/user");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// JWT Helper
const signToken = (user) => {
    return jwt.sign(
        { userId: user._id, nomuser: user.user, profilePic: user.profilePic || "default.png" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

exports.login = async (req, res, next) => {
    try {
        // Buscar un usuario que coincida con las credenciales proporcionadas
        const usuario = await User.findOne({ user: req.body.user });

        if (!usuario) {
            return res.status(401).json({ isAuth: false, info: "Usuario no encontrado o contraseña incorrecta" });
        }

        // Verificar la contraseña contra el hash de la Base de Datos
        const isMatch = await bcrypt.compare(req.body.pass, usuario.pass);
        if (!isMatch) {
            return res.status(401).json({ isAuth: false, info: "Usuario no encontrado o contraseña incorrecta" });
        }

        req.user = usuario;

        // Generar JWT
        const token = signToken(usuario);

        // Configurar la cookie HttpOnly para que JavaScript en frontend no pueda leerla (Seguridad XSS)
        res.cookie('jwt_auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Sólo HTTPS en producción
            maxAge: 24 * 60 * 60 * 1000 // 1 Día
        });

        console.log("Usuario autenticado exitosamente:", usuario.user);
        console.log("JWT emitido con profilePic:", usuario.profilePic || "default.png");

        next();
    } catch (error) {
        console.error(`Error al intentar iniciar sesión: ${error.message}`);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.validar = async (req, res, next) => {
    try {
        if (req.body.pass !== req.body.passconf) {
            return res.render("error", { message: "Las contraseñas no coinciden" });
        }

        const user = await User.findOne({ user: req.body.user });

        if (user) {
            return res.render("error", { message: "El usuario ya existe" });
        }

        next();

    } catch (error) {
        console.error(`${error.message}`);
        res.render("error", { message: "Error interno en la validación" });

    }
}

exports.save = async (req, res, next) => {
    try {
        let nomUser = req.body.user;
        let contr = req.body.pass;

        // Encriptar la contraseña (Cost factor 10 por default)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contr, salt);

        let newUser = new User({ user: nomUser, pass: hashedPassword });
        let status = await newUser.save();

        // Autologuear al usuario recién registrado
        const token = signToken(newUser);
        res.cookie('jwt_auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        });

        req.user = { userId: newUser._id, nomuser: nomUser, profilePic: "default.png" };

        next();

    } catch (error) {
        console.error(`Error saving User" ${error}`);
        res.render("error", { message: "Error al guardar el usuario" });

    }
};

exports.updateFoto = async (req, res, next) => {
    try {
        const actualuser = req.user.nomuser;
        var userProfile = await User.findOne({ user: actualuser });

        if (req.file) {
            userProfile.profilePic = req.file.filename;
            userProfile.markModified("profilePic");
            await userProfile.save();
        }

        // Hay que reemitaer el token porque la infomación del payload cambió
        const token = signToken(userProfile);
        res.cookie('jwt_auth', token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 });

        req.user.profilePic = userProfile.profilePic;

        next();
    } catch (error) {
        console.error(error);
        res.render("error", { message: "Error al actualizar la foto" });
    }
};

exports.updateNombre = async (req, res, next) => {
    try {
        const actualuser = req.user.nomuser;
        const nounom = req.body.nomuser;

        var nouUser = await User.findOne({ user: actualuser });

        nouUser.user = nounom;
        await nouUser.save();

        // Renovar Cookie
        const token = signToken(nouUser);
        res.cookie('jwt_auth', token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 });

        req.user.nomuser = nounom;

        next();
    } catch (error) {
        console.error(error);
        res.render("error", { message: "Error al actualizar el nombre" });
    }
};

