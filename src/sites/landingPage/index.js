const global = require('../../api/global');
const express =require('express');

const route = express.Router();

route.get('/',(req, res)=>{
	res.render(__dirname + '/main.ejs', {
		page:{
			port: global.port,
		}
	});
});


route.get('/view', (req, res)=>{
	res.render(__dirname + '/startview.ejs', {
		page:{
			port: global.port,
		}
	});
});

module.exports = route;