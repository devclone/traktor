
const express = require('express');

const app = express();

app.get('/',(req,res)=>{
	res.send('yas');
});

app.listen(9901, ()=>{
	require('./electron/index');
	console.log('Traktor schnurrt wie ein kleines Kätzchen');
});