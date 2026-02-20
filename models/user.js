var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    //id: {type: String, required: true},
    user: { type: String, required: true },
    pass: { type: String, required: true },
    profilePic: { type: String, required: false }
    //name: {type: String, required: true},
    //role: {type: String, required: true},
});

module.exports = mongoose.model('User', UserSchema);
