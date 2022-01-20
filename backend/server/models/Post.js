const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

    title:{
        type :String,
        require : true,
        unique : true
    },

   desc:{
        type : String,
        require : true,
    },

    photo:{
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
