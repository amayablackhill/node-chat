var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messages = new Schema({
    //id: {type: Number, required: true},
    //rel_id: {type: Number, required: true},
    usuario: {type: String, required: true},
    mensaje: {type: String, required: true},
    date: {type: Date, required: true},
    channel: {type: String, required: true},
    userPic: {type: Object, required: false}
 });
 
 
module.exports = mongoose.model('Mensajes', messages);
