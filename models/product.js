const mongoose = require('mongoose');
const pagination=require('../util/pagination.js');
const ProductSchema=new mongoose.Schema({
	name:String,
	price:Number,
	stock:Number,
	images:String,
	detail:String,
	description:String,
	category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Category'
    },
    status:{
    	type:Number,
    	default:0
    },
    order:{
    	type:Number,
    	default:0
    },
},{
	timestamps:true
})

ProductSchema.statics.getPaginationProducts = function(page,query={},projection='name _id price status order',sort={order:-1}){
    return new Promise((resolve,reject)=>{
      let options = {
        page: page,//需要显示的页码
        model:this, //操作的数据模型
        query:query, //查询条件
        projection:projection, //投影，
        sort:sort,//排序
      }
      pagination(options)
      .then((data)=>{
        resolve(data); 
      })
    })
 }

const ProductModel=mongoose.model('Product',ProductSchema);

module.exports=ProductModel;