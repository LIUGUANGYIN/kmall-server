const mongoose = require('mongoose');

const ResourceSchema=new mongoose.Schema({
	name:String,
	path:String

});
const ResourceModel=mongoose.model('Resource',ResourceSchema);

module.exports=ResourceModel;