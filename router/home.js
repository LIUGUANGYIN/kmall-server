const Router=require('express').Router;
const UserModel = require('../models/model.js');
const pagination = require('../util/pagination.js');
const CommentModel = require('../models/comment.js');
const hmac=require('../util/hmac.js')

const router=Router();
//显示用户后台页面
router.get('/',(req,res)=>{
    res.render('home/index',{
            userInfo:req.userInfo
    });
});

//显示评论列表
router.get('/comment',(req,res)=>{
    CommentModel.getPaginationComments(req,{user:req.userInfo._id})
        .then(data=>{
           res.render('home/comment_list',{
            userInfo:req.userInfo,
            comments:data.docs,
            page:data.page,
            list:data.list,
            pages:data.pages,
            url:'/home/comment'
        });
    })
           
  })

//删除评论
router.get('/delete/:id',(req,res)=>{
    let id=req.params.id;
    CommentModel.remove({_id:id},(err,sew)=>{
        if(!err){
          res.render('home/success',{
                userInfo:req.userInfo,
                message:'删除评论成功',
                url:'/home/comment'
            })  
        }else{
            res.render('home/error',{
                userInfo:req.userInfo,
                message:'删除评论失败,数据库操作失败'
            })     
        }
    })
})

//显示修改密码
router.get('/password',(req,res)=>{
        res.render('home/password')
})

//处理修改密码请求
router.post("/password",(req,res)=>{
        let body = req.body;
        UserModel.update({password:hmac(body.password)},{password:hmac(body.repassword)},(err,rew)=>{
        if(!err){
            res.render('home/success',{
                userInfo:req.userInfo,
                message:'密码修改成功',
                url:'/home/password'
            })
        }else{
            res.render('home/error',{
                userInfo:req.userInfo,
                message:'密码修改失败,数据库操作失败'
            })
        }
    })
})
module.exports=router;