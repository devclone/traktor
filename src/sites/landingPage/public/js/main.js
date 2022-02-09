// eslint-disable-next-line no-undef
const { TaskTimer } = tasktimer;
/* eslint-disable no-undef */
const wax = new waxjs.WaxJS({
	rpcEndpoint: 'https://wax.pink.gg', 
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
	else(e =>{
		console.log('energy no' +e	);
	//	document.getElementById('error').innerHTML =`Id ${ element.asset_id}, ERROR RECOVER ENERGY ${refillEnergy}`; 
	});
}



// ----------  WORKER START ------------
async function getPlots(cropconf, resources, crop){
	let customHTML = '';

	const cropName = cropconf.rows.find(elem => elem.template_id === crop.template_id);
	customHTML += `<div>
			<div>${cropName.name}</div>
			<div>${crop.times_claimed}/42</div>
			<div>${fromSec(crop.next_availability - Date.now()/1000)}</div>
		</div>`;

	let config = {
		actions: [{
			account: 'farmersworld',
			name: 'cropclaim',
			authorization: [{
				actor: wax.userAccount,
				permission: 'active',
			}],
			data: {
				owner: wax.userAccount,
				crop_id: crop.asset_id
			},
		}]
	};

	let plots = await runner(config);

	if (plots == true){
		console.log('CROP WORKED');
	}
	else{
		document.getElementById('error').innerHTML = `Id ${ crop.asset_id}, HARVEST FAILED! ${plots}`;
	}
	await refillEnergy(resources, crop);
		
	
	document.getElementById('plots').innerHTML = customHTML;
}


async function getMember(memberConf, resources, member){

	let	customHTML = '';

	const memberName = memberConf.rows.find(e => e.template_id === member.template_id);
	console.log(memberName);
	customHTML += `
					<div>${memberName.name}</div>
					<div>${fromSec(member.next_availability - Date.now()/1000)}</div>
				</div><br>`;
    
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
				asset_id: member.asset_id
			},
		}]
	};
	let claimMember = runnner(conf);
	if(claimMember == true){
		console.log(`Id ${ member.asset_id}, HARVEST WORKED`);
	}
	else{
		console.log(`Id ${ member.asset_id}, PROBLEM HARVEST ${claimMember}`); 
	}

	await refillEnergy(resources, member);

		

	document.getElementById('member').innerHTML = customHTML;
}

async function getTools(toolconf, resources, tool){
	let customHTML = '';
	const toolName = toolconf.rows.find(elem => elem.template_id === tool.template_id);
	console.log(toolName.durability_consumed);
	customHTML += `
					<div><b>${toolName.template_name}</b></div>
					<div>${tool.current_durability}/${tool.durability}</div>
					<div>${fromSec(tool.next_availability - Date.now()/1000)}</div>
				</div><br>`;
	document.getElementById('tools').innerHTML = customHTML;
	if(tool.current_durability > toolName.durability_consumed){
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
					asset_id: tool.asset_id
				},
			}]
		};
		let harvest = await runner(config);
		if (harvest == true){
			console.log(`Id ${ tool.asset_id}, HARVEST WORKED`);
		}
		else{ console.log(`Id ${ tool.asset_id}, ERROR HARVEST ${harvest}`); }
	}else{ 
		// REPAIR THE TOOL
		let needGold = (tool.durability - tool.current_durability) / 5;
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
						asset_id: tool.asset_id
					},
				}]
			};
			let repair = await runner(conf);
			if (repair == true){
				console.log(`Id ${ tool.asset_id}, REPAIR WORKED`);
			}
			else{ 
				document.getElementById('error').innerHTML = `Id ${ tool.asset_id}, ERROR REPAIR ${harvest}`; 
			}
		}
	}
	await refillEnergy(resources, tool);
		

	
	return customHTML;
}

// ---------- WORKER END -------------

async function getData(resources){
	// Get current Data

	let food;
	console.log(resources);
	food = resources.balances[2];
	let customHTML = '';
	customHTML += `<h4><img src="/js/FWW.png"> ${resources.balances[0]} <img src="/js/FWG.png"> ${resources.balances[1]} <img src="/js/FWF.png"> ${food} Energy: ${resources.energy}</h4>`;
 
	document.getElementById('main').innerHTML = customHTML;

}


// run
async function _run(){
	await login();
	
	const resources = await askDB('farmersworld', 'accounts', wax.userAccount);

	let initTimer = new TaskTimer(1000);

	await getData(resources);
	// -------------- TOOLS TIMER --------------------
	const tools = await askDB_byId('farmersworld', 'tools', wax.userAccount, '2', 'name');
	let toolConf = await askDB_all('farmersworld', 'toolconfs', 100);
	const timerTools = new TaskTimer(1000);
	for (let i = 0; i < tools.length; i++) {	
		const toolName = toolConf.rows.find(elem => elem.template_id === tools[i].template_id);
		timerTools.add({
			id: tools[i],
			tickInterval: toolName.charged_time,
			async callback(task){
				document.getElementById('tools').innerHTML = await getTools(toolConf, resources, tools[i]);
				await getData(resources);
			}
		});

	}


	// -------------- Member Timer ------------
	let	memberConf = await askDB_all('farmersworld', 'mbsconf', 100);

	const members = await askDB_byId('farmersworld', 'mbs', wax.userAccount, '2', 'name');
	
	const timerMember = new TaskTimer(1000);
	for (let i = 0; i < members.length; i++) {
		timerMember.add({
			id: members[i],
			tickInterval: memberConf[0].charged_time,
			async callback(task){
				await	getMember(memberConf, resources, members[i]);
				await getData(resources);
			}
		});
	}

	// ----------- Plots Timer -----------
	
	const	plotsConf = await askDB_all('farmersworld', 'cropconf', 100);
	const crops = await askDB_byId('farmersworld', 'crops', wax.userAccount, '2', 'name');
	const timerCrops = new TaskTimer(1000);
	for (let i = 0; i < crops.length; i++) {
		timerCrops.add({
			id: crops[i],
			tickInterval: crops[0].charged_time,
			async callback(task){
				await	getPlots(plotsConf, resources, crops[i]);
				await getData(resources);
			}
		});
	}


	/// Check for Running and wait for finish // NOT FINISHED
	initTimer.add([{
		id: '0',
		tickInterval: 5,
		totalRuns: 0,
		async callback(task){
			for (let i = 0; i < tools.length; i++) {
				console.log(fromSec(tools[i].next_availability - Date.now()/1000));
				if(tools[i].next_availability - Date.now()/1000 < 0){
					document.getElementById('tools').innerHTML = await getTools(toolConf, resources, tools[i]);
					await getData(resources);
					await timerTools.start();
					await initTimer.stop();
				}				
			}
		},
	},{
		id:'1',
		tickInterval: 5,
		totalRuns: 0,
		async callback(){
			for (let i = 0; i < members.length; i++) {
				if(fromSec(members[i].next_availability - Date.now()/1000) < 0){
					await getMember(memberConf, resources, members[i]);
					await getData(resources);
					await timerMember.start();
				}	
			}
		}
	},{
		id: '2',
		tickInterval: 5,
		totalRuns: 0,
		async callback(){
			for (let i = 0; i < crops.length; i++) {
				if(fromSec(crops[i].next_availability - Date.now()/1000) < 0){
					await getPlots(plotsConf, resources, crops[i]);
					await getData(resources);
					await timerCrops.start();
				}	
			}
		}
	}]);	
	initTimer.start();
}

_run();


/* TODO
Für Jedes Object einen timer erstellen. Wenn der Vorbei ist updaten.




----- REQUIRED alle TOOLS und plots und Member müssen laufen -----
*/

