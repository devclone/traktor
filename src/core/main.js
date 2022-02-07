const bodyParser = require('body-parser');
const express = require('express');
const detect = require('detect-port');
let cors = require('cors');
let global = require('../api/global');
const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use(bodyParser.json());
app.use(require('../middleware'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/../sites');

app.use(express.static(__dirname + '/../sites/landingPage/public'));

app.use('/', require('../sites/landingPage'));

detect(9901, (err, _port) => {
	if (err) {
		console.log(err);
	}	
	console.log(_port);
	global.port = _port;
	app.listen(_port, ()=>{
		const { app, BrowserWindow } = require('electron');
		function createWindow () {
			const win = new BrowserWindow({
				width: 400,
				height: 400
			});
		
			win.loadURL('http://localhost:'+ _port + '/view');
		}
		app.whenReady().then(() => {
			createWindow();
		});
		
		console.log('Traktor schnurrt wie ein kleines Kätzchen');
	});
});