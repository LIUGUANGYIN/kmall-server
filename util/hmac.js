const crypto=require('crypto');
module.exports = (str)=>{
	const hmac = crypto.createHmac('sha256', 'sdjfkdsjfkdsfj2');
	hmac.update(str);
	return hmac.digest('hex');
}