// eslint-disable-next-line no-undef
const { TaskTimer } = tasktimer;

/* eslint-disable no-undef */
const wax = new waxjs.WaxJS({
	rpcEndpoint: 'https://api.wax.alohaeos.com/', 
	tryAutoLogin: false,
	waxSigningURL: 'https://all-access.wax.io',
	waxAutoSigningURL: 'https://api-idm.wax.io/v1/accounts/auto-accept/'
});
// --------------- ASK DB Start ------------------------
async function askDB(code, tableName, bound, limit=1){
	result = await wax.api.rpc.get_table_rows({
		json: true,      
		code: code,
		scope: code,
		table: tableName,
		lower_bound: bound,
		upper_bound: bound,
		limit: limit,
		reverse: false,
		show_payer: false 
	});
	return result.rows[0];
}
async function askDB_all(code, tableName, limit=100){
	let result;
	try {
		result = await wax.api.rpc.get_table_rows({
			json: true,
			code: code,
			scope: code,
			table: tableName,
			lower_bound: '',
			upper_bound: '',
			limit: limit,
			reverse: false,
			show_payer: false
		});
	} catch(e) {
		/*Nothing*/
	}
	return result;
}

async function askDB_byId(code, tableName, bound, index, key_type){
	let result;
	try {
		result = await wax.api.rpc.get_table_rows({
			json: true,
			code: code,
			scope: code,
			table: tableName,
			index_position: index,
			key_type: key_type,
			lower_bound: bound,
			upper_bound: bound,
			reverse: false,
		});
	}catch(e){
		/*Nothing*/
	}
	return result.rows;
}


/// --------------- ASK DB END ------------------------

// ------ HELPER FUNCTIONS START -----------
function fromSec(timeInSeconds) {
	let pad = function(num, size) { return ('000' + num).slice(size * -1); },
		time = parseFloat(timeInSeconds).toFixed(3),
		hours = Math.floor(time / 60 / 60),
		minutes = Math.floor(time / 60) % 60,
		seconds = Math.floor(time - minutes * 60),
		milliseconds = time.slice(-3);
	return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
	
}
// ------ HELPER FUNCTIONS END ------------

async function login(){
	try {
		await wax.login();
	
	}catch(e){
		console.log(err);
	}
}

// execute the renewal
async function runner(config){
	try{
		const worker = await wax.api.transact(config,{
			blocksBehind: 3,
			expireSeconds: 30
		});
		await new Promise(resolve => setTimeout(resolve, 1000));
		return true;
	}catch(e){
		console.log('ERROR:' + e);
		return e;
	}	
}

async function refillEnergy(balance, element){
	let recover = balance.max_energy - balance.energy;
	let config2 = {
		actions: [{
			account: 'farmersworld',
			name: 'recover',
			authorization: [{
				actor: wax.userAccount,
				permission: 'active',
			}],
			data: {
				owner: wax.userAccount,
				energy_recovered: recover
			},
		}]
	};
	let refillEnergy = await runner(config2);
	if (refillEnergy == true){
		console.log(`Id ${ element.asset_id}, ENERGY RECOVERD`);
	}
	else{
		document.getElementById('error').innerHTML =`Id ${ element.asset_id}, ERROR RECOVER ENERGY ${refillEnergy}`; 
	}
}


async function run(){
	let toolConf = await askDB_all('farmersworld', 'toolconfs', 100);
	let	plotsConf = await askDB_all('farmersworld', 'cropconf', 100);
	let	memberConf = await askDB_all('farmersworld', 'mbsconf', 100);

  for(){
	let tool = new TaskTimer(1000);

	tools.add({

	});
}
}

