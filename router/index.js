const Router=require('express').Router;
const CategoryModel=require('../models/category.js')
const ArticleModel=require('../models/article.js');
const CommentModel=require('../models/comment.js');
const pagination=require('../util/pagination.js');
const getCommonData = require('../util/getCommonData.js');

const router=Router();


router.get('/',(req,res)=>{
	/*CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{
		let options = {
	        page: req.query.page,//需要显示的页码
	        model:ArticleModel, //操作的数据模型
	        query:{}, //查询条件
	        projection:'-__v', //投影，
	        sort:{_id:1},//排序
	        populate:[{path:'category',select:'name'},{path:'url',select:'username'}]
	    }

	    pagination(options)
	    .then((data)=>{
	    	ArticleModel.find()
	    	.then((articles)=>{
    		    res.render('main/index',{
		            userInfo:req.userInfo,
		            categories:categories,
		            articles:data.docs,
		            articless:articles,
		            page:data.page,
		            list:data.list,
		            pages:data.pages,
		            url:'/article'
		        });
	    	})
	      
	    })
	})*/
	ArticleModel.getPaginationArticles(req)
	.then(pageData=>{
		getCommonData()
		.then(data=>{
			res.render('main/index',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				url:'/articles'
			});			
		})
	})
});
//ajax请求获取文章列表的分页数据
router.get('/articles',(req,res)=>{
	/*let options = {
        page: req.query.page,//需要显示的页码
        model:ArticleModel, //操作的数据模型
        query:{}, //查询条件
        projection:'-__v', //投影
        sort:{_id:-1},//排序
        populate:[{path:'category',select:'name'},{path:'User',select:'username'}]
    }

    pagination(options)
    .then((data)=>{
        res.json({
        	code:0,
        	data:data
        })
    });*/
    let category = req.query.id;
	let query = {};
	if(category){
		query.category = category;
	}
	ArticleModel.getPaginationArticles(req,query)
	.then((data)=>{
		res.json({
			code:'0',
			data:data
		})
	})     
});
//显示列表页面
router.get('/list/:id',(req,res)=>{
		/*let id=req.params.id; 
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{
		let options = {
	        page: req.query.page,//需要显示的页码
	        model:ArticleModel, //操作的数据模型
	        query:{}, //查询条件
	        projection:'-__v', //投影，
	        sort:{_id:1},//排序
	        populate:[{path:'category',select:'name'},{path:'url',select:'username'}]
	    }

	    pagination(options)
	    .then((data)=>{
	    	ArticleModel.find({category:id})
	    	.then((articles)=>{
	    		res.render('main/list',{
		            userInfo:req.userInfo,
		            categories:categories,
		            articles:articles,
		            page:data.page,
		            list:data.list,
		            pages:data.pages,
		            url:'/article'
		        });
	    	})
	        
	    })
	})*/
	let id = req.params.id;
	ArticleModel.getPaginationArticles(req,{category:id})
	.then(pageData=>{
		getCommonData()
		.then(data=>{
			res.render('main/list',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				category:id,
				url:'/articles'
			});				
		})
	})
});

//显示详情页面 
router.get('/view/:id',(req,res)=>{
	let id=req.params.id;
	/*ArticleModel.find({_id:id})

	.then((article)=>{
		res.render('main/detail',{
            userInfo:req.userInfo,
            article:article,
        });
        console.log(article)
	})*/
	ArticleModel.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
	.populate('category','name')
	.then(article=>{
		getCommonData()
		.then(data=>{
			CommentModel.getPaginationComments(req,{article:id})
			.then(pageData=>{
				res.render('main/detail',{
					userInfo:req.userInfo,
					article:article,
					categories:data.categories,
					topArticles:data.topArticles,
					comments:pageData.docs,
					page:pageData.page,
					list:pageData.list,
					pages:pageData.pages,
					category:article.category._id.toString()
			    })		
			})
		})
	})
})



module.exports=router;