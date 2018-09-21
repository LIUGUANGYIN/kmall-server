(function($){
	var $login=$('#login');
	var $register=$('#register');
	var $userInfo=$('#user-info');
	$("#go-register").on('click',function(){
		$login.hide();
		$register.show();
	})
	$("#go-login").on('click',function(){
		$register.hide();
		$login.show();
	})
	$("#sub-register").on('click',function(){
		var username=$register.find("[name='username']").val();
		var password=$register.find("[name='password']").val();
		var repassword=$register.find("[name='repassword']").val();
		var errMsg='';
		if(!/^[a-z][a-z|0-9|_]{2,9}$/i.test(username)){
			errMsg='用户名以字母开头包含数字字母和下划线，3-10个字符'
		}
		else if(!/^\w{3,10}$/i.test(password)){
			errMsg='密码为3-10个字符'
		}
		else if(password!=repassword){
			errMsg='两次密码不一样'
		}
		if(errMsg){
			$register.find('.err').html(errMsg)
			return;
		}else{
			$.ajax({
				url:'/user/register',
				type:'post',
				dataType:'json',
				data:{
					username:username,
					password:password
				}
			})
			.done(function(result){
				if(result.code===0){
					$('#go-login').trigger('click');
				}else{
					$register.find('.err').html(result.message);
				}
			})
			.fail(function(err){
				console.log('err');
			})
		}
	})
	$("#sub-login").on('click',function(){
		var username=$login.find("[name='username']").val();
		var password=$login.find("[name='password']").val();
		var errMsg='';
		var $err=$login.find('.err');
		if(!/^[a-z][a-z|0-9|_]{2,9}$/i.test(username)){
			errMsg='用户名以字母开头包含数字字母和下划线，3-10个字符'
		}
		else if(!/^\w{3,10}$/i.test(password)){
			errMsg='密码为3-10个字符'
		}
		if(errMsg){
			$err.html(errMsg)
			return;
		}else{
			$err.html('');
			console.log(username,password)
			$.ajax({
				url:'/user/login',
				data:{
					username:username,
					password:password
				 },
				type:'post',
				dataType:'json'	

			})
			
			.done(function(result){
				if(result.code===0){
					// $login.hide();
					// $userInfo.find('span').html('result.data.username')
					// $userInfo.show();
					

					window.location.reload();
				}else{
					$err.html(result.message)
				}
			})
			.fail(function(err){
				console.log('err');
			})
		}
	})
	//用户退出
	$('#logout').on('click',function(){
		$.ajax({
			url:"/user/logout",
			dataType:'json',
			type:'get'
		})
		.done(function(result){
			if(result.code == 0){
				window.location.reload();
			}
		})
		.fail(function(err){
			console.log(err)
		})
	});

//发送文章列表的请求
	/*$('#page').on('click','a',function(){
		var $this=$(this);
		var page=1;
		var currentPage=$('#page').find('.active a').html();
		if($this.attr('aria-label')=='Previous'){
			page=currentPage*1-1;
		}else if($this.attr('aria-label')=='Next'){
			page=currentPage*1+1;
		}else{
			page=$(this).html();
		}
		$.ajax({
			url:'/articles?page='+page,
			type:'get',
			dataType:'json'
		})
		.done(function(result){
			if(result.code==0){
				bulidArticleList(result.data.docs);
				buildPage(result.data.list,result.data.page)
			}
		})
		.fail(function(){

		})
	})*/
	var $articlePage = $('#article-page');
	$articlePage.on('get-data',function(e,result){
	 	buildArticleList(result.data.docs);
	 	buildPage($articlePage,result.data.list,result.data.page)
	})
	$articlePage.pagination();

	function bulidArticleList(articles){
	 	var html = '';
	 	for(var i = 0;i<articles.length;i++){
	 	var data = moment(articles[i].createdAt).format('YYYY年MM月DD日 h:mm:ss ');
	 	// var data ={ articles[i].createdAt | date('Y年m月d日 h:i:s',-8*60) }; 
	 	html +=`<div class="panel panel-default content-item">
			  <div class="panel-heading">
			    <h3 class="panel-title">
			    	<a href="/view/${ articles[i]._id }" class="link" target="_blank">${ articles[i].title }</a>
				</h3>
			  </div>
			  <div class="panel-body">
				${ articles[i].intro }
			  </div>
			  <div class="panel-footer">
				<span class="glyphicon glyphicon-user"></span>
				<span class="panel-footer-text text-muted">
					${ articles[i].user.username }
				</span>
				<span class="glyphicon glyphicon-th-list"></span>
				<span class="panel-footer-text text-muted">
					${ articles[i].category.name }
				</span>
				<span class="glyphicon glyphicon-time"></span>
				<span class="panel-footer-text text-muted">
					${data}
				</span>
				<span class="glyphicon glyphicon-eye-open"></span>
				<span class="panel-footer-text text-muted">
					<em>${ articles[i].click }</em>人已阅读
				</span>
			  </div>
			</div>`
		}
		$('#article-list').html(html);
	}
	/*function buildPage(list,page){
	 	var html = '';
	 	
 		html=  `<li>
			      <a href="javascript:;" aria-label="Previous">
			        <span aria-hidden="true">&laquo;</span>
			      </a>
			    </li>`
	    for( i in list){
			if(list[i]==page){
				html+=`<li class="active"><a href="javascript:;">${ list[i] }</a></li>`
			}else{
				html+=`<li><a href="javascript:;">${ list[i] }</a></li>`
			}
		}	    

	    html+=` <li>
			      <a href="javascript:;" aria-label="Next">
			        <span aria-hidden="true">&raquo;</span>
			      </a>
			    </li>`
	$('#page .pagination').html(html);
	}*/
	function buildPage($page,list,page){
		console.log(list,page)
	 	var html = `<li>
				      <a href="javascript:;" aria-label="Previous">
				        <span aria-hidden="true">&laquo;</span>
				      </a>
				    </li>`

	    for(i in list){
	    	if(list[i] == page){
	    		html += `<li class="active"><a href="javascript:;">${ list[i] }</a></li>`;
	    	}else{
	    		html += `<li><a href="javascript:;">${ list[i] }</a></li>`
	    	}
	    }

	 	html += `<li>
			      <a href="javascript:;" aria-label="Next">
			        <span aria-hidden="true">&raquo;</span>
			      </a>
			    </li>`
		
		$page.find('.pagination').html(html)	    
	}

//发布评论
	var $commentPage = $('#comment-page');

	$('#comment-btn').on('click',function(){
		var articleId = $('#article-id').val();
		var commentContent = $('#comment-content').val();

		if(commentContent.trim() == ''){
			$('.err').html('评论内容不能为空');
			return false;
		}else{
			$('.err').html('')
		}

		$.ajax({
			url:'/comment/add',
			type:'post',
			dataType:'json',
			data:{id:articleId,content:commentContent}
		})
		.done(function(result){
			// console.log(result);
			if(result.code == 0){
				//1.渲染评论列表
				buildCommentList(result.data.docs)
				//2.渲染分页
				buildPage($commentPage,result.data.list,result.data.page)

				$('#comment-content').val('')
			}
		})
		.fail(function(err){
			console.log(err)
		})
	});
	//构建评论列表
	function buildCommentList(comments){
		var html = '';
		for(var i = 0;i<comments.length;i++){
			var createdAt = moment(comments[i].createdAt).format('YYYY年MM月DD日 HH:mm:ss ');
			html += `
				<div class="panel panel-default">
				  <div class="panel-heading">
				  	${ comments[i].user.username } 发表于 ${createdAt}
				  </div>
				  <div class="panel-body">
				    ${ comments[i].content }
				  </div>
				</div>
			`
		}
		$('#comment-list').html(html);
	}

	
	$commentPage.on('get-data',function(e,result){
		buildCommentList(result.data.docs)
	 	buildPage($commentPage,result.data.list,result.data.page)
	})
	$commentPage.pagination();	


})(jQuery)