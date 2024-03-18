const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    uid:{
        type:String
    },
    isGroup:{
        type:Boolean
    },
    most_active_member:{
        name:{
            type:String
        },
        messages:{
            type:Number
        }
    },
    emojis:{
        // hex:count
        type:Array
    },
    most_active_day:{
        Mon:{
            type:Number,
            default:0
        },
        Tue:{
            type:Number,
            default:0
        },
        Wed:{
            type:Number,
            default:0
        },
        Thu:{
            type:Number,
            default:0
        },
        Fri:{
            type:Number,
            default:0
        },
        Sat:{
            type:Number,
            default:0
        },
        Sun:{
            type:Number,
            default:0
        },
        
    },
    average_response_time:{
        type:String
    },
    average_msgs_per_day:{
        type:Number
    },
    total_messages:{
        type:Number
    }   

});

const analyticsModel = mongoose.connection.useDb('ANALYTICS');

const analytics = analyticsModel.model('analytics', apkSchema);

module.exports = analytics;
