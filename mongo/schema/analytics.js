const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    uid:{
        type:String
    }
   

});

const analyticsModel = mongoose.connection.useDb('ANALYTICS');

const analytics = analyticsModel.model('analytics', apkSchema);

module.exports = analytics;
