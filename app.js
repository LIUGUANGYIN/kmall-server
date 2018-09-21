const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const Cookies=require('cookies');
const session=require('express-session');
const MongoStore = require("connect-mongo")(session);

//启动数据库
mongoose.connect('mongodb://localhost:27017/kmall',{ useNewUrlParser: true });

let db = mongoose.connection;

db.on('error',()=>{
	throw err
});
db.once('open',()=>{
   console.log('open...')
}); 

const app = express();

//跨域设置
app.use((req,res,next)=>{
    res.append("Access-Control-Allow-Origin","http://localhost:3001");
    res.append("Access-Control-Allow-Credentials",true);
    res.append("Access-Control-Allow-Methods","GET, POST, PUT,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type, X-Requested-With,X-File-Name"); 
    next();
})
//配置静态资源
app.use(express.static('public'));

//OPTIONS请求处理
app.use((req,res,next)=>{
    if(req.method == 'OPTIONS'){
        res.send('OPTIONS OK');
    }else{
        next();
    }
})

app.use(session({
    //设置cookie名称
    name:'blid',
    //用它来对session cookie签名，防止篡改
    secret:'dsjfkdfd',
    //强制保存session即使它并没有变化
    resave: true,
    //强制将未初始化的session存储
    saveUninitialized: true, 
    //如果为true,则每次请求都更新cookie的过期时间
    rolling:true,
    //cookie过期时间 1天
    cookie:{maxAge:1000*60*60*24},    
    //设置session存储在数据库中
    store:new MongoStore({ mongooseConnection: mongoose.connection })   
}))

app.use((req,res,next)=>{
	req.userInfo  = req.session.userInfo || {};
	next();	
})

//添加处理post请求的中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//处理路由
app.use('/admin',require('./router/admin.js'));
app.use('/user',require('./router/user.js'));
app.use('/category',require('./router/category.js'));
app.use('/product',require('./router/product.js'));
app.use("/cart",require('./router/cart.js'));
app.use("/shipping",require('./router/shipping.js'));
app.use("/order",require('./router/order.js'));
app.use("/payment",require('./router/payment.js'));

app.use('/',require('./router/index.js'));
app.use('/article',require('./router/article.js'));
app.use('/comment',require('./router/comment.js'));
app.use('/resource',require('./router/resource.js'));
app.use('/home',require('./router/home.js'));


app.listen(3000,()=>{
	console.log('127.0.0.1:3000');
}) 