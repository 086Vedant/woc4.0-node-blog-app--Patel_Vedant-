const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

    title:{
        type :String,
        require : [true, 'User title required'],
        unique : true
    },

   desc:{
        type : String,
        require : true,
    },

    image:{
        type : String,
        require : false
    },

    username:{
        type : String,
        require : true,
    },

    categories: {
        type: Array,
        required: false
    }

})

module.exports=mongoose.model('Post',PostSchema);
