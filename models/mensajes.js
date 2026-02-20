var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messages = new Schema({
    id: {type: Number, required: true},
    rel_id: {type: Number, required: true},
    mensaje: {type: String, required: false},
    date: {type: String, required: false},
    channel: {type: Number, required: false},
});
 
 
module.exports = mongoose.model('Mensajes', messages);

