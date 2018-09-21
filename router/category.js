const Router=require('express').Router;
const CategoryModel=require('../models/category.js');
const pagination=require('../util/pagination.js');
const router=Router();

//处理添加请求
router.post("/add",(req,res)=>{
    let body = req.body;
    CategoryModel
    .findOne({name:body.name,pid:body.pid})
    .then((cate)=>{
        if(cate){//已经存在
            res.json({
                code:1,
                message:"添加分类失败,分类已存在"
            })
        }else{
            new CategoryModel({
                name:body.name,
                pid:body.pid
            })
            .save()
            .then((newCate)=>{
                if(newCate){
                    if(body.pid==0){//如果添加的是新的一级分类，就把新分类返回
                        CategoryModel.find({pid:0},"_id name")
                        .then((categories)=>{
                            res.json({
                                code:0,
                                data:categories 
                            })
                        })

                    }else{
                        res.json({
                            code:0
                        })
                    }
                }

            })
            .catch((e)=>{//新增失败
                res.json({
                    code:1,
                    message:"添加分类失败,服务器端错误"
                })
            })
        }
    })
})

//获取分类
router.get("/",(req,res)=>{
    let pid = req.query.pid;
    let page = req.query.page;
    
    if(page){
        CategoryModel
        .getPaginationCategories(page,{pid:pid})
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
        CategoryModel.find({pid:pid},"_id name pid order")
        .then((categories)=>{
            res.json({
                code:0,
                data:categories
            })  
        })
        .catch(e=>{
            res.json({
                code:1,
                message:"获取分类失败,服务器端错误"
            })      
        })      
    }

});
//更新姓名
router.put('/updateName',(req,res)=>{
    let body=req.body;
    CategoryModel
    .findOne({name:body.name,pid:body.pid})
    .then((cate)=>{
        if(cate){
            res.json({
                code:1,
                message:'分类已存在'
            })
        }else{
            CategoryModel
            .update({_id:body.id},{name:body.name})
            .then((cate)=>{
                if(cate){
                    CategoryModel
                    .getPaginationCategories(body.page,{pid:body.pid})
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
                        message:"添加分类失败,服务器端错误"
                    })
                }
            })
            .catch(e=>{
                res.json({
                    code:1,
                    message:"更新姓名失败,服务器端错误"
                })
            }) 
        }
    })
})

//更改排序
router.put('/updateorder',(req,res)=>{
    let body=req.body;
    CategoryModel
    .update({_id:body.id},{order:body.order})
    .then((cate)=>{
        if(cate){
            CategoryModel
            .getPaginationCategories(body.page,{pid:body.pid})
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
                message:"更新排序失败,服务器端错误"
            })
        }
    })
    .catch(e=>{
        res.json({
            code:1,
            message:"获取排序失败,服务器端错误"
        })      
    })
})

/*
router.get("/",(req,res)=>{ 
    CategoryModel.find({pid:0})
    .then((data)=>{
        if(data){
            res.json({
                code:0,
                data:data
            }) 
        }else{
            res.json({
                code:1
            })
        }
   
    })
})
*/





//权限控制
router.use((req,res,next)=>{
    if(req.userInfo.isAdmin){
        next()
    }else{
        res.send('<h1>请用管理员账号登录</h1>');
    }
})

//显示新增页面
router.get("/add",(req,res)=>{
    res.render('admin/category_add',{
        userInfo:req.userInfo
    });
})


router.get('/edit/:id',(req,res)=>{
    let id=req.params.id;   
    CategoryModel.findById({_id:id})
    .then((category)=>{
        res.render('admin/category_edit',{
            userInfo:req.userInfo,
            category:category
        });
    })
      
})
router.post('/edit/:id',(req,res)=>{
    let id=req.params.id;
    let body=req.body;

    /*
    CategoryModel.findOne({name:body.name})
    .then((category)=>{
        if(category && body.order==category.order){
            res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'编辑分类失败,数据已有'
            }) 
        }else{
            CategoryModel.update({_id:id},{name:body.name,order:body.order},(err,category)=>{
                if(!err){
                    res.render('admin/success',{
                        userInfo:req.userInfo,
                        message:'编辑分类成功',
                        url:'/category'
                    })                        
                }else{
                    res.render('admin/error',{
                        userInfo:req.userInfo,
                        message:'编辑分类失败,数据库操作失败'
                    })      
                }
            })
        }
    })
    */
    CategoryModel.findById(id)
    .then((category)=>{
        if(category.name==body.name && category.order==body.order){
            res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'请修改后提交'
            })
        }else{
            CategoryModel.findOne({name:body.name,_id:{$ne:id}})
            .then((category)=>{
                if(category){
                    res.render('admin/error',{
                            userInfo:req.userInfo,
                            message:'编辑分类失败,数据已有'
                    }) 
                }else{
                    CategoryModel.update({_id:id},{name:body.name,order:body.order},(err,category)=>{
                        if(!err){
                            res.render('admin/success',{
                                userInfo:req.userInfo,
                                message:'编辑分类成功',
                                url:'/category'
                            })                        
                        }else{
                            res.render('admin/error',{
                                userInfo:req.userInfo,
                                message:'编辑分类失败,数据库操作失败'
                            })      
                        }
                    })
                }
            })
        }
    })   
})
router.get('/delete/:id',(req,res)=>{
    let id=req.params.id;
    CategoryModel.remove({_id:id},(err,sew)=>{
        if(!err){
          res.render('admin/success',{
                userInfo:req.userInfo,
                message:'删除分类成功',
                url:'/category'
            })  
        }else{
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'删除分类失败,数据库操作失败'
            })     
        }
    })
})
module.exports=router;