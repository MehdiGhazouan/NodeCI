const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = {
    createUser: function(){
        return new User({}).save()
    },
    deleteUser: function(userId){
         return User.findByIdAndRemove(userId);
    }
}