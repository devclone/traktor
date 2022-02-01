const bodyParser = require('body-parser');
const express = require('express');
let cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use(bodyParser.json());
app.use(require('../middleware'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/../sites');

app.use(express.static(__dirname + '/../sites/landingPage/public'));

app.use('/', require('../sites'));

app.listen(9901, ()=>{
	const { globalShortcut, app, BrowserWindow } = require('electron');

	function createWindow () {
		const win = new BrowserWindow({
			width: 1200,
			height: 600,
		});
		
		var reload = ()=>{
			win.reload();
		};
		globalShortcut.register('F5', reload);
		globalShortcut.register('CommandOrControl+R', reload);
		win.loadURL('http://localhost:9901/');
	}
	
	app.whenReady().then(() => {
		createWindow();
	});
	console.log('Traktor schnurrt wie ein kleines Kätzchen');
});