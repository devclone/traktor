module.exports = (req, res, next) =>{
	if(req.ip === '127.0.0.1' || req.ip === '::1'){
		next();
	}else{
		res.send(403);
	}
};