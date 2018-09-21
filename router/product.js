const Router = require('express').Router;
const path=require('path');
const fs=require('fs');
const ProductModel = require('../models/product.js')
const pagination = require('../util/pagination.js')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/resource/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

const router = Router();

//获取商品列表
router.get('/homeList',(req,res)=>{
    let page=req.query.page;
    let query={status:0};
    if(req.query.categoryId){
        query.category=categoryId;
    }else{
        query.name={$regex:new RegExp(req.query.keyword,'i')}
    }
    let projection='_id name price images';
    let sort={order:-1};
    if(req.query.orderBy=='price_asc'){
        sort={price:-1}
    }else if(req.query.orderBy=='price_desc'){
        sort={price:1}
    }
    ProductModel.getPaginationProducts(page,query,projection,sort)
    .then(result=>{
        res.json({
            code:0,
            data:{
                current:result.current,
                total:result.total,
                pageSize:result.pageSize,
                list:result.list,
            }
        })
    })
    .catch(e=>{
        res.json({
            code:1,
            message:'获取商品列表失败'
        })
    })
})
//获取商品详情
router.get('/homeDetail',(req,res)=>{
    ProductModel
    .findOne({status:0,_id:req.query.productId},'-__v -createAt -updateAt -category')
    .then(product=>{
        res.json({
            code:0,
            data:product
        })
    })
    .catch(e=>{
        res.json({
            code:1,
            message:'获取商品详情失败'
        })
    })
})

//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.send({
      code:10
    });
	}
})
//处理商品图片
router.post("/uploadImage",upload.single('file'),(req,res)=>{
        const filePath='http://127.0.0.1:3000/resource/'+req.file.filename;
        res.send(filePath)
})
//处理商品详情
router.post("/uploadEditorImage",upload.single('upload'),(req,res)=>{
        const filePath='http://127.0.0.1:3000/resource/'+req.file.filename;
        res.send({
            "success": true,
            "msg": "上传成功", 
            "file_path":filePath,
        })
})
//添加商品
router.post("/",(req,res)=>{
  let body=req.body
  new ProductModel({
      name:body.name,
      price:body.price,
      stock:body.stock,
      images:body.images.fileList,
      detail:body.detail.valuse,
      description:body.description,
      category:body.category
  })
  .save()
  .then((newCate)=>{
      if(newCate){
        res.json({
            code:0,
            message:"新增商品成功"
        })
      }
  })
  .catch((e)=>{//新增失败
      res.json({
          code:1,
          message:"添加分类失败,服务器端错误"
      })
  })
})

//更新商品
router.put("/",(req,res)=>{
  let body=req.body
  let options={
      name:body.name,
      price:body.price,
      stock:body.stock,
      images:body.images,
      detail:body.detail,
      description:body.description,
      category:body.category
  }
  ProductModel
  .update({_id:body.id},options)
  .then(sew=>{
    res.json({
        code:0,
        message:"更新商品成功"
    })
  })
  .catch((e)=>{
    res.json({
        code:1,
        message:"更新分类失败,服务器端错误"
    })
  })
})

//获取商品
router.get("/",(req,res)=>{
    let page = req.query.page || 1;
    ProductModel
    .getPaginationProducts(page,{})
    .then((result)=>{
        res.json({
            code:0,
            data:{
                current:result.current,
                total:result.total,
                pageSize:result.pageSize,
                list:result.list                    
            }
        })  
    })
    .catch(e=>{
        res.json({
            code:1,
            message:"获取商品失败,服务器端错误"
        })      
    })      
});

//更新排序
router.put("/updateOrder",(req,res)=>{
  let body = req.body;
  ProductModel
  .update({_id:body.id},{order:body.order})
  .then((product)=>{
    if(product){
      ProductModel
      .getPaginationProducts(body.page,{})
      .then((result)=>{
        res.json({
          code:0,
          data:{
            current:result.current,
            total:result.total,
            pageSize:result.pageSize,
            list:result.list          
          }
        })  
      })          
    }else{
      res.json({
        code:1,
        message:"更新排序失败,数据操作失败"
      })          
    }
  })
})

//更新状态
router.put("/updateStatus",(req,res)=>{
  let body = req.body;
  ProductModel
  .update({_id:body.id},{status:body.status})
  .then((product)=>{
    if(product){
      res.json({
        code:0,
        message:'更新状态成功'
      })          
    }else{
      ProductModel
      .getPaginationProducts(body.page,{})
      .then((result)=>{
        res.json({
          code:1,
          message:'更新状态失败',
          data:{
            current:result.current,
            total:result.total,
            pageSize:result.pageSize,
            list:result.list          
          }
        })  
      })              
    }
  })
})


//获取商品信息
router.get("/detail",(req,res)=>{
    let id = req.query.id;
    ProductModel
    .findById(id,"-__v -order -status -createdAt -updatedAt")
    .populate({path:'category',select:'_id pid'})
    .then((product)=>{
        res.json({
            code:0,
            data:product
        })  
    })
    .catch(e=>{
        res.json({
            code:1,
            message:"获取商品信息失败,服务器端错误"
        })      
    })      
});

module.exports = router;