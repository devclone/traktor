/* eslint-disable no-undef */
const wax = new waxjs.WaxJS({
	rpcEndpoint: 'https://api.wax.alohaeos.com/', 
	tryAutoLogin: true,
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
		return await wax.login();
	}catch(e){
		/*Nothing*/
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

// ----------  WORKER START ------------
async function getPlots(){
//	const plots = await getTableRows_byIndex('farmersworld', 'crops', wax.userAccount, '2', 'name');

 
	// name  mbsclaim
	/*Nothing FOR NOW*/
}


async function getMember(memberConf){
	const member = await askDB_byId('farmersworld', 'mbs', wax.userAccount, '2', 'name');

	let	customHTML = '<h3> Member </h3>';
	member.forEach(async element =>{
		const memberName = memberConf.rows.find(e => e.template_id === element.template_id);
		
		customHTML += `
					<div${memberName.type};">${member.template_name}</div>;
					<div>${element.current_durability}/${element.durability}</div>
					<div>${fromSec(element.next_availability - Date.now()/1000)}</div>
				</div><br>`;
    
		if(element.next_availability - Date.now()/1000 < 0){
			let conf = {
				actions: [{
					account: 'farmersworld',
					name: 'mbsclaim',
					authorization: [{
						actor: wax.userAccount,
						permission: 'active',
					}],
					data: {
						owner: wax.userAccount,
						asset_id: element.asset_id
					},
				}]
			};
			let claimMember = runnner(conf);
			if(claimMember == true){
				console.log(`Id ${ element.asset_id}, HARVEST WORKED`);
			}
			else{
				console.log(`Id ${ element.asset_id}, PROBLEM HARVEST ${claimMember}`); 
			}
		}
	});
	document.getElementById('member').innerHTML = customHTML;
}

async function getTools(toolconf, gold, resources){
	console.log(toolconf);
	let customHTML = '';
	const tools = await askDB_byId('farmersworld', 'tools', wax.userAccount, '2', 'name');
	tools.sort(function(a, b) {
		return a.template_id - b.template_id;
	});
	tools.forEach(async element => {
		const toolName = toolconf.rows.find(elem => elem.template_id === element.template_id);
		console.log(toolName.durability_consumed);
		customHTML += `
					<div><b>${toolName.template_name}</b></div>
					<div>${element.current_durability}/${element.durability}</div>
					<div>${fromSec(element.next_availability - Date.now()/1000)}</div>
				</div><br>`;
		document.getElementById('tools').innerHTML = customHTML;
		if(toolName.energy_consumed > resources.energy) {
			if (element.next_availability - Date.now()/1000 < 0){
				if(element.current_durability > toolName.durability_consumed){
					let config = {
						actions: [{
							account: 'farmersworld',
							name: 'claim',
							authorization: [{
								actor: wax.userAccount,
								permission: 'active',
							}],
							data: {
								owner: wax.userAccount,
								asset_id: element.asset_id
							},
						}]
					};
					let harvest = await runner(config);
					if (harvest == true){
						console.log(`Id ${ element.asset_id}, HARVEST WORKED`);
					}
					else{ console.log(`Id ${ element.asset_id}, ERROR HARVEST ${harvest}`); }
				}else{ 
				// REPAIR THE TOOL
					let needGold = (element.durability - element.current_durability) / 5;
					if(needGold > gold){
						customHTML2 += `
          <div> PROBLEM NEED MORE : ${gold}</div>
          `;
						document.getElementById('tools').innerHTML = customHTML2;
					}else{
						let conf = {
							actions: [{
								account: 'farmersworld',
								name: 'repair',
								authorization: [{
									actor: wax.userAccount,
									permission: 'active',
								}],
								data: {
									asset_owner: wax.userAccount,
									asset_id: element.asset_id
								},
							}]
						};
						let repair = await runner(conf);
						if (repair == true){
							console.log(`Id ${ element.asset_id}, REPAIR WORKED`);
						}
						else{ console.log(`Id ${ element.asset_id}, ERROR REPAIR ${harvest}`); }
					}
				}
			}
		}else{ 
			// Refill Energy !!!!!!!!!
		}
	});
	return customHTML;
}

// ---------- WORKER END -------------

async function farmersWorld(toolConf, plotsConf, memberConf){
	// Get current Data
	const resources = await askDB('farmersworld', 'accounts', wax.userAccount);

	let gold;
	let wood;
	let food;
	resources.balances.forEach((i)=>{
		i.includes('GOLD') ? gold = i.split(' ')[0] : gold = 0;
		i.includes('WOOD') ? wood = i.split(' ')[0] : wood = 0;
		i.includes('FOOD') ? food = i.split(' ')[0] : food = 0;
	});

	let customHTML = '';
	customHTML += `<h4>Wood: ${wood} Gold: ${gold} Food: ${food} Energy: ${resources.energy}</h4>`;
 
	document.getElementById('main').innerHTML = customHTML;

	document.getElementById('tools').innerHTML = await getTools(toolConf, gold, resources);
	await getMember(memberConf);
}


// run
async function _run(){
	const user = await login();
	let toolConf = await askDB_all('farmersworld', 'toolconfs', 100);
	let	plotsConf = await askDB_all('farmersworld', 'cropconf', 100);
	let	memberConf = await askDB_all('farmersworld', 'mbsconf', 100);
	await farmersWorld(toolConf, plotsConf, memberConf);
}


_run();