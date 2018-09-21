const Router=require('express').Router;
const multer=require('multer');
const UserModel = require('../models/model.js');
const CommentModel = require('../models/comment.js');
const pagination = require('../util/pagination.js');
const hmac=require('../util/hmac.js')
const fs=require('fs');
const path=require('path');

const upload=multer({dest:'public/uploads/'});

const router=Router();
/*
router.get('/init',(req,res)=>{
    new UserModel({
            username:'admin',
            password:hmac('admin'),
            isAdmin:true
        })
        .save((err,newuser)=>{
            if(!err){ 
                res.send('ok');
            }else{
                res.send('err');
            }
        })
})
*/
router.post("/login",(req,res)=>{
    let body=req.body;
    let result={
        code:0,
        message:''
    } 
    
    UserModel
    .findOne({username:body.username,password:hmac(body.password),isAdmin:true})
    .then((user)=>{
        if(user){
            req.session.userInfo={
                _id:user._id,
                username:user.username,
                isAdmin:user.isAdmin
            }
            result.data={
                username:user.username
            }
            res.json(result);
        }else{
            result.code=1,
            result.message='用户名和密码错误'
            res.json(result);
        }
    })
})

router.get('/count',(req,res)=>{
    res.json({
        code:0,
        data:{
            usernum:300,
            ordernum:301,
            productnum:302
        }
    })
})

router.get('/users',(req,res)=>{

    //获取所有用户的信息,分配给模板

    let options = {
        page: req.query.page,//需要显示的页码
        model:UserModel, //操作的数据模型
        query:{}, //查询条件
        projection:'', //投影，
        sort:{_id:-1} //排序
    }
    pagination(options)
    .then((result)=>{
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
})


//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.send('a');
	}
})


//显示管理员首页
router.get('/',(req,res)=>{
        res.render('admin/index',{
                userInfo:req.userInfo
        });
});

//显示用户列表


router.post('/uploadImages',upload.single('upload'),(req,res)=>{
        let path='/uploads/'+req.file.filename;
        res.json({
                uploaded:true,
                url:path
        })
})


//显示站点管理页面
router.get("/site",(req,res)=>{
        let filePath = path.normalize(__dirname + '/../site-info.json');
        fs.readFile(filePath,(err,data)=>{
                if(!err){
                        let site = JSON.parse(data);
                        res.render('admin/site',{
                                userInfo:req.userInfo,
                                site:site
                        });     
                }else{
                        console.log(err)
                }
        })

})
//处理修改网站配置请求
router.post("/site",(req,res)=>{
        let body=req.body;
        let site={
                name:body.name,
                auther:{ 
                        intro:body.auther.intro,
                        image:body.auther.image,
                        wechat:body.auther.wechat
                },
                ads:{
                        url:body.url,
                        path:body.path
                },
                icp:body.icp
        }

        site.carouseles=[];

        if(body.carouseleUrl.length>0 && typeof body.carouseleUrl){
                for(let i=0;i<body.carouseleUrl.length;i++){
                        site.carouseles.push({
                                carouseleUrl:body.carouseleUrl[i]
                        })
                        console.log(site.carouseles)
                }
        }else{
                site.carouseles.push({})
        }

        site.ads=[];
        if(body.adUrl.length>0 && typeof body.adUrl){
                for(let i=0;i<body.adUrl.length;i++){
                        site.ads.push({
                                adUrl:body.adUrl[i]
                        })
                }
        }else{

        }
})

//显示修改密码
router.get('/password',(req,res)=>{
        res.render('admin/password')
})

//处理修改密码请求
router.post("/password",(req,res)=>{
        let body = req.body;
        UserModel.update({password:hmac(body.password)},{password:hmac(body.repassword)},(err,rew)=>{
        if(!err){
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'密码修改成功',
                url:'/admin/password'
            })
        }else{
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'密码修改失败,数据库操作失败'
            })
        }
    })
})

module.exports=router;