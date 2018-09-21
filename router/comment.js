const Router = require('express').Router;
const CommentModel = require('../models/comment.js')

const router = Router();

//权限控制
router.use((req,res,next)=>{
    if(req.userInfo.isAdmin){
        next()
    }else{
        res.send('<h1>请用管理员账号登录</h1>');
    }
})

//显示评论列表
router.get('/',(req,res)=>{

        /*//获取所有用户的信息,分配给模板

        let options = {
                page: req.query.page,//需要显示的页码
                model:CommentModel, //操作的数据模型
                query:{}, //查询条件
                projection:'_id ', //投影，
                sort:{_id:-1} //排序
        }
        pagination(options)
        .then((data)=>{
                console.log(data.docs)
                res.render('admin/comment_list',{
                        userInfo:req.userInfo,
                        comments:data.docs,
                        page:data.page,
                        list:data.list,
                        pages:data.pages,
                        url:'/admin/comment'
                }); 
        })*/

    	CommentModel.getPaginationComments(req)
        .then(data=>{
           res.render('admin/comment_list',{
            userInfo:req.userInfo,
            comments:data.docs,
            page:data.page,
            list:data.list,
            pages:data.pages
        });
    })
           
  })

//删除评论
router.get('/delete/:id',(req,res)=>{
    let id=req.params.id;
    CommentModel.remove({_id:id},(err,sew)=>{
        if(!err){
          res.render('admin/success',{
                userInfo:req.userInfo,
                message:'删除评论成功',
                url:'/comment'
            })  
        }else{
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'删除评论失败,数据库操作失败'
            })     
        }
    })
})

//添加评论
router.post("/add",(req,res)=>{
	let body = req.body;
	new CommentModel({
		article:body.id,
		user:req.userInfo._id,
		content:body.content
	})
	.save()
	.then(comment=>{
		CommentModel.getPaginationComments(req,{article:body.id})
		.then(data=>{
			res.json({
				code:0,
				data:data
			});			
		})
	})
})

router.get('/list',(req,res)=>{
	let article = req.query.id;
	let query = {};
	if(article){
		query.article = article;
	}
	CommentModel.getPaginationComments(req,query)
	.then((data)=>{
		res.json({
			code:'0',
			data:data
		})
	})
})

module.exports = router;