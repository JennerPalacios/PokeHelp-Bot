//
//		CHECK THE LINE BELOW...DO THESE MAKE NO SENSE? ARE THEY RANDOM CHARACTERS?
//
// 		🔴 📵 🗨 📗 🗒 📜 📋 📝 📆 📲 👤 👥 🤖 📥 📤 ✅ ⚠ ⛔ 🚫 ❌ 🔨 🙂 😮 😁 😄 😆 😂 😅 😛 😍 😉 🤔 👍 👎 ❤
//
//		THEN YOU NEED TO ADJUST YOUR SETTINGS!!! "Encoding" » "Encode in UTF-8"
//		... BECAUSE THESE ARE ACTUAL IN-TEXT EMOJIS (WHICH DISCORD ALSO USES)
//
const Discord=require('discord.js');
const bot=new Discord.Client();
const config=require('./config/config.json');
const sql = require("sqlite");
const fs = require("fs");
const request = require("request");
sql.open("./database/data.sqlite");

/*
Copyright (c) 2018 Jenner Palacios

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


//
// COMMON VARIABLES, ARRAYS, AND OBJECTS
//
var embedMSG="", skip="", msg1="", msg2="", command="", args="",
	guild="", user="", channel="", mentioned="", channeled="",
	createOutput="", createTag="", fetchOutput="";


//
// SPOOFNINJA SETTINGS
//
var spoofFlag="off";
var spoofChan="";
var spoofWHID="";
//
//
//


// AVOID ADVERTISEMENT | OTHER SERVER NAMES
const advTxt=["seapokemap","sea-pokemap","pokehuntr","gymhuntr","pokefetch"];
	
// AVOID SPOOFTALKS
const spoofTxt=["spoof","spooof","spooph","spoooph","sp00f","sp000f","spo0f","sp0of",
	"s.p.o.o.f","s.p.o.0.f","s.p.0.o.f","s.p.0.0.f","s-p-o-o-f","joystick","s p o o f","s p o 0 f","s p 0 0 f","s p 0 0 f"];
	
// FRIENDLY CHAT - ADD SPACE IF EXACT MATCH, OR NO SPACE FOR IN-BETWEEN CHARACTERS
const censorTxt=["fuck","bastard","pussy","dick","cock","dildo","ballsack","boner","shit",
	"bitch","twat","whore","cunt","biatch","fag","queer","nigga","jizz","buttplug",
	"butt "," anal "," ass "];

// DATE&TIME VALUES
const DTdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DTmonths=["January","February","March","April","May","June","July","August","September","October","November","December"];

var pokeCity=[
	"Pewter","Cerulean","Vermilion","Celadon","Fuchsia","Saffron","Viridian","Violet","Goldenrod","Ecruteak",
	"Clanwood","Olivine","Blackthorn","Rustboro","Mauville","Petalburg","Fortree","Mossdeep","Sootopolis",
	"Oreburgh","Eterna","Veilstone","Pastoria","Hearthome","Canalave","Snowpoint","Sunyshore","Straiton",
	"Nacrene","Castelia","Nimbasa","Driftveil","Mistralton","Icirrus","Opelucid","Humilau"
];
var pokeBadge=[
	"Boulder","Cascade","Thunder","Rainbow","Soul","Marsh","Volcano","Earth","Zephyr","Hive","Plain","Fog",
	"Storm","Mineral","Glacier","Rising","Stone","Knuckle","Dynamo","Heat","Balance","Feather","Mind","Rain",
	"Coal","Forest","Cobble","Fen","Relic","Mine","Icicle","Beacon","Trio","Basic","Insect","Bolt","Quake","Jet","Freeze","Legend","Toxic","Wave"
];

var pokeRegion=[
	"Kanto","Johto","Hoenn","Sinnoh","Unova","Kalos","Alola"
];

var pokeCuttie=[
	"Pikachu","Pichu","Bulbasaur","Charmander","Squirtle","Caterpie","Weedle","Pidgey","Rattata","Vulpix",
	"Bellsprout","Eevee","Chikorita","Marill","Wobbuffet","Teddiursa","Treecko","Torchic","Skitty","Plusle","Minun"
];

function random(list){
	return list[Math.floor(Math.random()*list.length)];
}
// END OF: COMMON VARIABLES, ARRAYS, AND OBJECTS



//
//	TIME STAMP FUNCTION
//
function timeStamp(type){
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	if(!type || type===1){
		return "`"+mo+"/"+da+"/"+yr.toString().slice(2)+"` **@** `"+hr+":"+min+"` "
	}
	if(type===2) {
		return "["+yr+"/"+mo+"/"+da+" @ "+hr+":"+min+":"+sec+"] "
	}
	if(type===3) {
		return "`"+yr+"/"+mo+"/"+da+"` **@** `"+hr+":"+min+":"+sec+"`"
	}
}



//
// BOT SIGNED IN AND IS READY
//
bot.on('ready', () => {
	config.botVersion="2.0";
	console.info(timeStamp(2)+"-- DISCORD HELPBOT: "+bot.user.username+", ADMIN MODULE IS READY --");
	request("https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/version.txt",
		function(error,response,body){
			if(error){console.info(error)}
			if(body){
				let gitHubVer=body.slice(0,-1); let timeLog=timeStamp(2);
				let verChecker="up-to-date"; if(gitHubVer!==config.botVersion){ verChecker="OUTDATED!" }
				console.info(
					timeLog+"GitHub Discord Bot [PokéHelp] version: "+gitHubVer+"\n"
					+timeLog+"Local Discord Bot ["+bot.user.username+"] version: "+config.botVersion+" -> "+verChecker+"\n"
					+timeLog+"Discord API [discord.js] version: "+Discord.version+"\n"
					+timeLog+"Node API [node.js] version: "+process.version
				)
			}
		}
	)
});



// ##########################################################################
// ############################# SERVER LISTNER #############################
// ##########################################################################

//
// BAN EVENT
//
bot.on("guildBanAdd", (guild,user) => {
	if(config.modLogChannel.banEvents==="yes") {
		setTimeout(function(){
			guild.fetchAuditLogs({limit: 1,type: 22})
			.then(auditLog => {
				let masterName=auditLog.entries.map(u=>u.executor.username),masterID=auditLog.entries.map(u=>u.executor.id),
					minionName=auditLog.entries.map(u=>u.target.username),minionID=auditLog.entries.map(u=>u.target.id),
					reason=auditLog.entries.map(u=>u.reason);reason="."+String(reason)+".";
					if(reason===".."){reason="It was **not** __defined__"}else{reason=reason.slice(1,-1)}
				embedMSG={
					'color': 0xFF0000,
					'title': '🔨 "'+minionName+'" WAS BANNED',
					'thumbnail': {'url': config.images.banned},
					'description': '**UserID**: `'+minionID+'`\n**UserTag**: <@'+minionID+'>\n'
						+'**Reason**: '+reason+'\n**By**: <@'+masterID+'>\n\n**On**: '+timeStamp(1)
				};
				console.log(timeStamp(2)+"[ADMIN] [BANNED-EVENT] \""+minionName+"\" ("+minionID+") was banned from: "+guild.name+", due to: "+reason);
				return bot.channels.get(config.modLogChannel.channelID).send({embed: embedMSG}).catch(console.error);
			})
			.catch(console.error)
		}, 3000)
	}
});
// END OF: BAN EVENT



//
// JOIN EVENT
//
bot.on("guildMemberAdd", member => {
	guild=member.guild; user=member.user;
	console.log(timeStamp(2)+"[ADMIN] [JOIN] \""+user.username+"\" ("+user.id+") has joined server: "+guild.name);
	let welcomeList=[
		member+" is looking for their next **"+random(pokeBadge)+" Badge**",
		"Quick! A wild "+member+" has just **spawned**!", 
		member+" is looking for their **"+random(pokeCuttie)+"**, anyone seen it?",
		"Prepare for trouble, "+member+", and make it double...",
		member+" wants to be their very **best**, like no one ever was!",
		"Trainer "+member+" needs a **"+random(pokeCuttie)+"** to complete their **PokeDex**!",
		member+", from the **"+random(pokeRegion)+" Region**, is looking for a friendly match!",
		"Anyone with a **"+random(pokeBadge)+" Badge**? "+member+" is looking for battle!",
		member+" needs help finding the **"+random(pokeCity)+" City Gym**, help them out plz!",
		"A wild "+member+" **CP**:`489` (__82%__ 12/10/15) has just **spawned**!", 
	];
	
	let joinMSG=welcomeList[Math.floor(Math.random()*welcomeList.length)]
	
	console.log(timeStamp(2)+"[ADMIN] [JOIN] \""+user.username+"\" ("+user.id+") has joined server: "+guild.name);
	if(config.serverEvents.joinEvents==="yes"){
		if(config.serverEvents.joinRandom==="yes"){
			return bot.channels.get(config.serverEvents.channelID).send(timeStamp(1)+joinMSG);
		}
		return bot.channels.get(config.serverEvents.channelID).send(timeStamp(1)+member.user.username+" has joined server!")
	}
});
// END OF: JOIN EVENT



//
// QUIT EVENT
//
bot.on("guildMemberRemove", member => {
	guild=member.guild; user=member.user;
	console.log(timeStamp(2)+"[ADMIN] [QUIT] \""+user.username+"\" ("+user.id+") has left server: "+guild.name);
});
// END OF: QUIT EVENT




//
// DATABASE TIMER FOR TEMPORARY ROLES
//
setInterval(function(){
	let timeNow=new Date().getTime(); let dbTime=""; let daysLeft="";
	sql.all(`SELECT * FROM temporary_roles`).then(rows => {
		if (!rows) {
			return console.info(timeStamp(2)+"[ADMIN] No one is in the DataBase");
		}
		else {
			for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
				dbTime=rows[rowNumber].endDate; daysLeft=(dbTime*1)-(timeNow*1);
				if(daysLeft<1){
					member=bot.guilds.get(config.serverID).members.get(rows[rowNumber].userID); 
					if(!member){ member.user.username="<@"+rows[rowNumber].userID+">"; member.id=""; }
					console.log(timeStamp(2)+"[ADMIN] [TEMPORARY-ROLE] \""+member.user.username+"\" ("+member.id+") have lost their role: "+rows[rowNumber].temporaryRole+"... time EXPIRED");
					bot.channels.get(config.mainChannel.channelID).send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their role: **"
						+rows[rowNumber].temporaryRole+"** - their **temporary** access has __EXPIRED__ 😭 ").catch(console.error);
					bot.users.get(member.id).send("⚠ <@"+rows[rowNumber].userID+">, you have **lost** your role: **"
						+rows[rowNumber].temporaryRole+"** - your **temporary** access has __EXPIRED__ 😭 \n"
						+"Please contact <@"+config.ownerID+"> if you wish to renew your **temporary role**.").catch(console.error);
					
					// CHECK IF ROLE EXIST, AND CHECK IF USER STILL IN SERVER
					let rName=bot.guilds.get(config.serverID).roles.find('name', rows[rowNumber].temporaryRole); 
					if(!rName){ return console.log("[ERROR] [ADMIN] [TEMPORARY-ROLE] Role ID: "+rows[rowNumber].temporaryRole+" was not found in server!") }
					let daMember=bot.guilds.get(config.serverID).members.get(rows[rowNumber].userID);
					if(!daMember){ return console.log("[ERROR] [ADMIN] [TEMPORARY-ROLE] Member ID: "+rows[rowNumber].userID+" was not found in server!") }
					
					// REMOVE ROLE FROM USER
					if(daMember.roles.has(rName.id)){daMember.removeRole(rName).catch(console.error)}
					// REMOVE DATABASE ENTRY
				sql.get(`DELETE FROM temporary_roles WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}"`).catch(console.error);
					return;
				}
			}
		}
	}).catch(()=>{
		sql.run("CREATE TABLE IF NOT EXISTS temporary_roles (userID TEXT, temporaryRole TEXT, startDate TEXT, endDate TEXT, addedBy TEXT)").catch(console.error);
		return console.info(timeStamp(2)+"[ADMIN] Database CREATED");
	});
},3600000);
// 86400000 = 24hrs
// 43200000 = 12hrs
// 21600000 = 6hrs
// 10800000 = 3hrs 
// 3600000 = 1hr


//
// END
//


// ##########################################################################
// ############################## TEXT MESSAGE ##############################
// ##########################################################################
bot.on('message', message => {
	//STOP SCRIPT IF DM/PM
	if(message.channel.type==="dm"){ return }
	
	// GET CHANNEL INFO
	guild=message.guild; channel=message.channel; user=message.member; msg1=message.content; msg2=msg1.toLowerCase();
	
	// GET TAGGED USER
	mentioned="";
	if(message.mentions.members.first()){mentioned=message.mentions.members.first();}
	if(message.mentions.channels.first()){channeled=message.mentions.channels.first();}
	
	// REMOVE LETTER CASE (MAKE ALL LOWERCASE)
	command=msg2.split(" ")[0]; command=command.slice(config.cmdPrefix.length);
	
	// GET ARGUMENTS
	args=msg1.split(" ").slice(1); skip="no";
	
	// GET ROLES FROM CONFIG
	let AdminR=guild.roles.find("name", config.adminRoleName); if(!AdminR){ AdminR={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+config.adminRoleName); }
	let ModR=guild.roles.find("name", config.modRoleName); if(!ModR){ ModR={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+config.modRoleName); }
	
	
//
// SPOOF NINJA COMPATIBILITY - AUTO BAN - MORE TO COME
//
	if(spoofChan && message.channel.id===spoofChan) {
		if(message.content){
			if(message.content.startsWith("!spoof")){
				if(message.member.roles.has(ModR.id) || message.member.roles.has(AdminR.id) || message.member.id===config.ownerID){
					if(message.content.includes("autoban")){
						if(message.content.includes("on")){
							spoofFlag="on";
							return message.channel.send("✅ `SpoofNinja`'s AutoBan `onJoinEvents()` is now **Enabled**")
						}
						if(message.content.includes("off")){
							spoofFlag="off";
							return message.channel.send("⚠ `SpoofNinja`'s AutoBan `onJoinEvents()` is now **Disabled**")
						}
						if(message.content.includes("check")){
							if(spoofFlag==="on"){
								return message.channel.send("✅ `SpoofNinja`'s AutoBan `onJoinEvents()` is **Enabled**")
							}
							if(spoofFlag==="off"){
								return message.channel.send("⚠ `SpoofNinja`'s AutoBan `onJoinEvents()` is **Disabled**")
							}
						}
					}
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!spoof autoban <on/off>` to enable/disable\n"
							+"`!spoof autoban check` » check current setting \n"
					};
					return message.channel.send({embed: embedMSG});
				}
			}
		}
		if(message.embeds.length!==0 && spoofFlag==="on" && spoofWHID){
			if(message.embeds[0]){
				if(message.embeds[0].message.webhookID===spoofWHID){
					let spoofNinja=message.embeds[0].description;
					if(spoofNinja){
						if(spoofNinja.split("\n")){
							spoofNinja=spoofNinja.split("\n")
							if(spoofNinja.length>4){
								let joinEvent=spoofNinja.some(txt=>txt.includes("joined"))
								if(joinEvent===true){
									let catchID=spoofNinja[2].split(" ");
									catchID=catchID[1].slice(2,-1);
									embedMSG={
										'color': 0xFF0000,
										'title': '⚠ ⛔ YOU HAVE BEEN BANNED ⛔ ⚠',
										'thumbnail': {'url': "https://raw.githubusercontent.com/JennerPalacios/SimpleDiscordBot/master/img/Poke-banned.png"},
										'description': '**From Server**: San Diego Hills\n**Reason**: Rule #1 violation; '
											+'**you** were found in **spoofing** server(s). We have zero tolerance for **spoofers**, and **any** connection to '
											+' discord spoofing servers...\n.\n**By**: Bot[`AutoDetect`]\n**On**: '+timeStamp(2)
									};
									message.guild.member(catchID).send({embed: embedMSG}).then(()=>{
										try {
											message.guild.member(catchID).ban({dats: 7, reason: "AutoBan: Rule #1 violation, user was found in spoofing server(s)"})
										}
										catch(err){
											message.channel.send("Error: \n"+err);
										}
									}).catch(console.error);
								}
							}
						}
					}
				}
			}
		}
	}
//
// END OF: SPOOFNINJA COMPATIBILITY
//


// ##########################################################################
// ############################## SPAM CONTROL ##############################
// ##########################################################################
	
// ############################## NO OTHER INVITES EXCEPT ONES POSTED BY BOT OR STAFF ##############################
	let invLinks=msg2.match(/discord.gg/g);
	if(invLinks){
		if(user.id===config.botID || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){ skip="yes" }
		
		if(skip==="no"){
			message.delete();
			embedMSG={
				'color': 0xFF0000,
				'title': '⚠ WARNING: No Invites ⚠',
				'thumbnail': {'url': config.images.warning},
				'description': 'You are being **WARNED** about an __invite__ code or link... '
					+'Advertising of other servers is **NOT** allowed in our server.\n**OffenseDate**: '+timeStamp(1)
			};
			console.log(timeStamp(2)+"[ADMIN] [INVITE-TXT] \""+user.user.username+"\" ("+user.id+") said: "+message.content);
			user.send({embed: embedMSG}).catch(console.error);
			return user.send("Please **Read/Review Our Rules** at: <#"+config.rulesChannel.channelID+"> ... in order to avoid Mute/Kick/Ban");
		}
	}
	
	
	
// ############################## ADVERTISEMENT CHECKER ##############################
	if(advTxt.some(word => msg2.includes(word))){
		
		// STOP SCRIPT IF USER IS ADMIN|OWNER|MOD|STAFF
		if(user.id===config.botID || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){ skip="yes" }
		
		if(skip==="no"){
			message.delete();
			embedMSG={
				'color': 0xFF0000,
				'title': '⚠ WARNING: No Advertising ⚠',
				'thumbnail': {'url': config.images.warning},
				'description': 'You are being **WARNED** about a word/link... '
					+'Advertising is **NOT** allowed in our server.\n**OffenseDate**: '+timeStamp(1)
			};
			console.log(timeStamp(2)+"[ADMIN] [ADV-TEXT] \""+user.user.username+"\" ("+user.id+") said: "+message.content);
			user.send({embed: embedMSG}).catch(console.error);
			return user.send("Please **Read/Review Our Rules** at: <#"+config.rulesChannel.channelID+"> ... in order to avoid Mute/Kick/Ban");
		}
	}
	
	
	
// ############################## SPOOF-TALK CHECKER ##############################
	if(spoofTxt.some(word => msg2.includes(word))){
		if(user){
			// STOP SCRIPT IF USER IS ADMIN|OWNER|MOD|STAFF
			if(message.author.id===config.botID || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){ skip="yes" }
			
			if(skip==="no"){
				message.delete();
				embedMSG={
					'color': 0xFF0000,
					'title': '⚠ WARNING: No SpoOf Talks ⚠',
					'thumbnail': {'url': config.images.warning},
					'description': 'You are being **WARNED** about a word... '
						+'**Spoof**-talk is **NOT** allowed in our server.\n**OffenseDate**: '+timeStamp(1)
				};
				console.log(timeStamp(2)+"[ADMIN] [SPOOF-TEXT] \""+user.user.username+"\" ("+user.id+") said: "+message.content);
				user.send({embed: embedMSG}).catch(console.error);
				return user.send("Please **Read/Review Our Rules** at: <#"+config.rulesChannel.channelID+"> ... in order to avoid Mute/Kick/Ban");
			}
		}
	}
	
	
	
// ############################## CENSORSHIP | FRIENDLY CHAT ##############################
	if(censorTxt.some(word => msg2.includes(word))){
		
		// STOP SCRIPT IF USER IS ADMIN|OWNER|MOD|STAFF
		if(user.id===config.botID || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){skip="yes"}
		
		if(skip==="no"){
			message.delete();
			embedMSG={
				'color': 0xFF0000,
				'title': '⚠ WARNING: Watch Your Language ⚠',
				'thumbnail': {'url': config.images.warning},
				'description': 'You are being **WARNED** about a **inappropriate** word... '
					+'Please watch your language; kids play this game too, you know\n**OffenseDate**: '+timeStamp(1)
			};
			console.log(timeStamp(2)+"[ADMIN] [CENSOR-TXT] \""+user.user.username+"\" ("+user.id+") said: "+message.content);
			user.send({embed: embedMSG}).catch(console.error);
			return user.send("Please **Read/Review Our Rules** at: <#"+config.rulesChannel.channelID+"> ... in order to avoid Mute/Kick/Ban");
		}
	}


// ############################################################################
// ############################## COMMANDS BEGIN ##############################
// ############################################################################

	// MAKE SURE ITS A COMMAND
	if(!message.content.startsWith(config.cmdPrefix)){ return }
	
	//
	// SPAM CONTROL FOR COMMANDS
	//
	if(command){
		
		// CONSOLE ALL COMMANDS TYPED
		// console.info(timeStamp(2)+"[ADMIN] \""+user.user.username+"\" ("+user.id+") used command: [!"+command+" "+args+"] in server: \""+g.name+"\", channel: #"+channel.name);
		
		// STOP SCRIPT IF USER IS ADMIN|OWNER|MOD|STAFF
		if(user.id===config.botID || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){ 
			skip="yes"; 
			// console.info(timeStamp(2)+"[ADMIN] [SPAM CONTROL] COMMANDS-SPAM-CONTROL Stopped for ADMIN|OWNER|MOD|STAFF"); 
		}
		
		if(skip==="no"){
			// CHECK DATABASE IF USER EXIST AND/OR TYPED A COMMAND
			sql.get(`SELECT * FROM cmd_spamCTRL WHERE userID="${user.id}"`).then(row => {
				
				// USER NOT FOUND IN DATABASE
				if (!row) {
					sql.run("INSERT INTO cmd_spamCTRL (userID, cmdCount) VALUES (?, ?)", [user.id, 1]);
					return console.info(timeStamp(2)+"[ADMIN] [SPAM CONTROL] I've added \""+user.user.username+"\" ("+user.id+") to my DataBase, they were not in it!");
				}
				
				// USER FOUND IN DATABASE
				else {
					sql.get(`SELECT * FROM cmd_spamCTRL WHERE userID="${user.id}"`).then(row => {
						
						// GET CMD COUNT, AND ADD 1
						let cmdCurCount=row.cmdCount; cmdCurCount++;
						sql.run("UPDATE cmd_spamCTRL SET cmdCount="+cmdCurCount+" WHERE userID="+user.id).catch(console.error);
						// console.info(timeStamp(2)+"[ADMIN] [SPAM CONTROL] Added +1 to user: "+user.user.username+" ("+user.id+")'s cmdCount");
						
						// GET CMD COUNT AGAIN FOR FEEDBACK AND TIMER
						sql.get(`SELECT * FROM cmd_spamCTRL WHERE userID="${user.id}"`).then(row => {
							
							// IF TYPED 4 COMMANDS, KICK FOR SPAM
							if(row.cmdCount==="4"){
								user.send("⚠ **NOTICE:** you have been **KICKED** due to: **command SPAM/ABUSE**, next time it will be a **BAN**");
								channel.send("⚠ **NOTICE:** "+user.user+" has been **KICKED** due to: **command SPAM/ABUSE**, next time it will be a **BAN**");
								embedMSG={
									'color': 0xFF0000,
									'title': '"'+user.user.username+'" HAS BEEN KICKED',
									'thumbnail': {'url': config.images.kicked},
									'description': '**UserID**: '+user.user.id+'\n**UserTag**: '+user.user.username+'\n'
										+'**Reason**: Command Spamming\n**Command**: !'+message.content+'\n\n**By**: AutoDetect \n**On**: '+timeStamp(1)
								};
								bot.channels.get(config.modLogChannel.channelID).send({embed: embedMSG}).catch(console.error);
								guild.member(user.user.id).kick();
							}
							
							// IF TYPED 3 COMMANDS WARN THEM
							if(row.cmdCount==="3"){
								console.info(timeStamp(2)+"[ADMIN] [SPAM CONTROL] WARNING: "+user.user.username+" ("+user.id+") have used 3 consecutive commands, they could be KICKED...");
								user.send("⚠ **WARNING:** you have used 3 consecutive commands, please allow **15 seconds** between each command! **1 more and you will be __KICKED__**");
								channel.send("⚠ **WARNING:** "+user.user+", you have used 3 consecutive commands, please allow **15 seconds** between each command! **1 more and you will be __KICKED__**");
							}
							
							// RESET COUNT AFTER 15000 MILISECONDS (15 SECS DUH!)
							setTimeout(function(){sql.run("UPDATE cmd_spamCTRL SET cmdCount=0 WHERE userID="+user.id).catch(console.error);},15000);
						});
					});
				}
			}).catch(() => {
				console.error;
				sql.run("CREATE TABLE IF NOT EXISTS cmd_spamCTRL (userID TEXT, cmdCount TEXT)").then(() => {
					sql.run("INSERT INTO cmd_spamCTRL (userID, cmdCount) VALUES (?, ?)", [user.id, 1]);
					console.info(timeStamp(2)+"[ADMIN] [SPAM CONTROL] Table was not found in DataBased, I've created it.");
					console.info(timeStamp(2)+"[ADMIN] [SPAM CONTROL] I've added \""+user.user.username+"\" ("+user.id+") to my DataBase, they were not in it!");
				});
			});
		}
	}
	
	
	
// ############################## STATS ##############################
	if(command==="stats"){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			let onlineM=guild.members.filter(user=>user.presence.status==="online").size;
			let idleM=guild.members.filter(user=>user.presence.status==="idle").size;
			let busyM=guild.members.filter(user=>user.presence.status==="dnd").size;
			let offlineM=guild.members.filter(user=>user.presence.status==="offline").size;
			let totalM=onlineM+idleM+busyM;
			
			embedMSG={
				'color': 0x00FF00,
				'title': '📊 SERVER STATS 📈',
				'description': ''
					+'🗨 **Online** members: **'+onlineM+'**\n'
					+'📵 **Idle** members: **'+idleM+'**\n'
					+'🔴 **Busy** members: **'+busyM+'**\n'
					+'🚫 **Invisible/Offline** members: **'+offlineM+'**\n'
					+'❤ **Total Online** members: **'+totalM+'**\n'
					+'📋 **Total** members __Today__: **'+guild.members.size+'**\n'
					+'📜 **Registered** members: **'+guild.memberCount+'**'
			};
			return channel.send({embed: embedMSG}).catch(console.error);
		}
	}
	

	
	
// ############################## INFO ##############################
	if(command==="info"){
		skip="yes";
		if(args[0]==="bot"){skip="no"}
		if(mentioned){if(mentioned.id===config.botID){skip="no"}}
		if(skip==="no"){
			request("https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/version.txt",
				function(error,response,body){
					if(error){console.info(error)}
					if(body){
						let gitHubVer=body.slice(0,-1);
						embedMSG={
							'color': 0x00FF00,
							'title': '📊 PokéHelp[bot] \\\u00BB rawInfo 📈',
							'thumbnail': {'url': 'https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/PokeHelpBot.png'},
							'url': 'https://github.com/JennerPalacios/PokeHelp-Bot/',
							'fields': [
								{'name': '🤵 Developer:', 'value': 'JennerPalacios`#5366`', 'inline': true},
								{'name': '🕵 DevUserID:', 'value': '`237597448032354304`', 'inline': true},
								{'name': '🛃 DevServer:', 'value': 'Invite: `fJvqFGP`', 'inline': true},
								{'name': '💵 DevPayPal:', 'value': '`paypal.me/JennerPalacios`', 'inline': true},
								{'name': '🤖 BotVersion:', 'value': 'v'+config.botVersion,'inline': true},
								{'name': '🌐 GitHubVersion:', 'value': 'v'+gitHubVer,'inline': true},
								{'name': '⚙ Discord.js:', 'value': 'v'+Discord.version,'inline': true},
								{'name': '📝 Node.js:', 'value': process.version,'inline': true}
							]
						};
						channel.send({embed: embedMSG}).catch(console.error)
					}
				}
			);
			return
		}
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(args[0]==="server"){
				let gDate=guild.createdAt; let gCreatedDate=DTdays[gDate.getDay()].slice(0,3)+" "+DTmonths[gDate.getMonth()]+" "+gDate.getDate()+", "+gDate.getFullYear();
				let userBots=message.guild.members.filter(b => b.user.bot);
				embedMSG={
					'color': 0x00FF00,
					'title': '📊 '+guild.name+' \\\u00BB ServerInfo 📈',
					'thumbnail': {'url': guild.iconURL},
					'fields': [
						{'name': '👤 ServerOwner:', 'value': '<@'+guild.owner.id+'>', 'inline': true},
						{'name': '📆 DateCreated:','value': gCreatedDate,'inline': true},
						{'name': '📝 RolesCount:','value': guild.roles.size,'inline': true},
						{'name': '👥 MemberCount:','value': guild.memberCount,'inline': true},
						{'name': '🤖 UserBots:','value': userBots.size,'inline': true},
						{'name': '🗒 Channels:','value': guild.channels.size,'inline': true}
					]
				};
				return channel.send({embed: embedMSG}).catch(console.error);
			}
			if(mentioned){
				let gMember=guild.members.get(mentioned.id);
				
				// COMMON VARIABLES
				let joinedAt=""; let joinedDT=""; let joinedDate=""; let mRolesName=""; let userRoleCount=""; let roleNames="";
				let daysJoined=""; let createdAt=""; let createdDate=""; let skipDTcheck="no";
				
				// MEMBER NICKNAME
				if(!gMember.nickname){gMember.nickname="No \"/Nick\" yet"}
				
				// JOINED DATE()
				joinedAt=gMember.joinedTimestamp; joinedDT=new Date(); joinedDT.setTime(joinedAt);
				joinedDate=DTdays[joinedDT.getDay()].slice(0,3)+" "+DTmonths[joinedDT.getMonth()]+" "+joinedDT.getDate()+", "+joinedDT.getFullYear();
				daysJoined=new Date().getTime() - joinedAt; daysJoined=daysJoined/1000/60/60/24; daysJoined=daysJoined.toFixed(0);
				if(daysJoined>365 && daysJoined<731 && skipDTcheck==="no"){daysJoined=daysJoined-365;daysJoined="1 year, "+daysJoined; skipDTcheck="yes"}
				if(daysJoined>730 && daysJoined<1096 && skipDTcheck==="no"){daysJoined=daysJoined-730;daysJoined="2 years, "+daysJoined; skipDTcheck="yes"}
				if(daysJoined>1095 && daysJoined<1461 && skipDTcheck==="no"){daysJoined=daysJoined-1095;daysJoined="3 years, "+daysJoined; skipDTcheck="yes"}
				if(daysJoined>1460 && daysJoined<1826 && skipDTcheck==="no"){daysJoined=daysJoined-1460;daysJoined="4 years, "+daysJoined; skipDTcheck="yes"}
				
				
				// ACCOUNT CREATED DATE()
				createdAt=mentioned.createdAt.getTime(); createdDT=new Date(); createdDT.setTime(createdAt); skipDTcheck="no";
				createdDate=DTdays[createdDT.getDay()].slice(0,3)+" "+DTmonths[createdDT.getMonth()]+" "+createdDT.getDate()+", "+createdDT.getFullYear();
				daysCreated=new Date().getTime() - createdAt; daysCreated=daysCreated/1000/60/60/24; daysCreated=daysCreated.toFixed(0);
				if(daysCreated>365 && daysCreated<731 && skipDTcheck==="no"){daysCreated=daysCreated-365;daysCreated="1 year, "+daysCreated; skipDTcheck="yes"}
				if(daysCreated>730 && daysCreated<1096 && skipDTcheck==="no"){daysCreated=daysCreated-730;daysCreated="2 years, "+daysCreated; skipDTcheck="yes"}
				if(daysCreated>1095 && daysCreated<1461 && skipDTcheck==="no"){daysCreated=daysCreated-1095;daysCreated="3 years, "+daysCreated; skipDTcheck="yes"}
				if(daysCreated>1460 && daysCreated<1826 && skipDTcheck==="no"){daysCreated=daysCreated-1460;daysCreated="4 years, "+daysCreated; skipDTcheck="yes"}
				
				// MEMBER ROLES
				mRolesName=gMember.roles.map(r => r.name); mRolesName=mRolesName.slice(1); userRoleCount=mRolesName.length; if(!mRolesName){userRoleCount=0} roleNames="NONE "; 
				if(userRoleCount!==0){ roleNames=mRolesName }
				
				embedMSG={
					'color': 0x00FF00,
					'title': '👤 '+mentioned.username+'\'s \\\u00BB UserInfo',
					'thumbnail': {'url': 'https://cdn.discordapp.com/avatars/'+mentioned.id+'/'+mentioned.avatar+'.png'},
					'fields': [
						{'name': '⚠ Warning:', 'value': 'The member is inactive! The info I found is limited!', 'inline': false},
						{'name': '👥 Nick/AKA', 'value': '`'+gMember.nickname+'`', 'inline': true},
						{'name': '🕵 UserID', 'value': '`'+mentioned.id+'`', 'inline': true},
						{'name': '📝 Roles ('+userRoleCount+')', 'value': '`'+roleNames+'`', 'inline': false},
						{'name': '📆 JoinedServer', 'value': '`'+joinedDate+'`\n(`'+daysJoined+' days ago`)', 'inline': true},
						{'name': '📆 AccountCreated', 'value': '`'+createdDate+'`\n(`'+daysCreated+' days ago`)', 'inline': true}
					]
				};
				
				// LAST SEEN INFO - ONLY AVAILABLE IF MEMBER TYPED SOMETHING IN THE LAST 60 SECONDS - PER DISCORD DEFAULTS
				if(mentioned.lastMessage!==null){
					// LAST SEEN DATE
					let seenDT=new Date(); seenDT.setTime(mentioned.lastMessage.createdTimestamp); 
					let seenHr=seenDT.getHours(); if(seenHr<10){seenHr="0"+seenHr} let seenMin=seenDT.getMinutes(); if(seenMin<10){seenMin="0"+seenMin}
					let seenDate=seenDT.getDate()+"/"+DTmonths[seenDT.getMonth()].slice(0,3)+"/"+seenDT.getFullYear()+" @ "+seenHr+":"+seenMin+"hrs";
					
					embedMSG={
						'color': 0x00FF00,
						'title': '👤 '+mentioned.username+'\'s \\\u00BB UserInfo',
						'thumbnail': {'url': 'https://cdn.discordapp.com/avatars/'+mentioned.id+'/'+mentioned.avatar+'.png'},
						'fields': [
							{'name': '👥 Nick/AKA', 'value': '`'+gMember.nickname+'`', 'inline': true},
							{'name': '🕵 UserID', 'value': '`'+mentioned.id+'`', 'inline': true},
							{'name': '📝 Roles ('+userRoleCount+'):', 'value': '`'+roleNames+'`', 'inline': false},
							{'name': '📆 JoinedServer:', 'value': '`'+joinedDate+'`\n(`'+daysJoined+' days ago`)', 'inline': true},
							{'name': '📆 AccountCreated', 'value': '`'+createdDate+'`\n(`'+daysCreated+' days ago`)', 'inline': true},
							{'name': '👁‍ LastSeenChannel:', 'value': '`#'+mentioned.lastMessage.channel.name+'`', 'inline': true},
							{'name': '⏲ LastSeenDate:', 'value': '`'+seenDate+'`', 'inline': true},
							{'name': '🗨 LastMessageSent:', 'value': '`'+mentioned.lastMessage.content+'`', 'inline': true}
						]
					};
				}
				return channel.send({embed: embedMSG}).catch(console.error);
			}
			embedMSG={
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "`!info server`\n"
					+"`!info <@mention>`"
			};
			return channel.send({embed: embedMSG});
		}
	}
	
	
	
// ############################## DELETE ##############################
	if(command==="del"){ 
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!del <number_amount>`"
				};
				return channel.send({embed: embedMSG});
			}
			if(args[0]){
				let amt=parseFloat(args[0])+1;
				if(amt>100){
					return message.reply("I can only delete **99** messages at a time");
				}
				channel.bulkDelete(amt).catch(err=>{
					message.reply("I've found some messages older than **14** days, you'll have to delete them manually!");
					return console.info(err.message)
					});
			}
		}
	}
	
	
	
// ############################## ROLES ##############################
	if(command.startsWith("role")){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			// message.delete();
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!roles count`\n"
						+"`!role search <role_name>`\n"
						+"`!role remove <@mention> <role_name>`\n"
						+"`!role <@mention> <role_name>`"
				};
				return channel.send({embed: embedMSG});
			}
			if(args[0]==="count"){
				return channel.send("There are **"+guild.roles.size+"** roles on this server");
			}
			if(args[0]==="search"){
				let daRolesN=guild.roles.map(r => r.name); // actual role name (case sensitive)
				let rolesNameLC=guild.roles.map(r => r.name.toLowerCase()); // lower case for search
				
				let meantThis="";
				
				// ROLES WITH SPACES - NEW
				let daRoles="";if(!args[2]){daRoles=args[1]}else{daRoles="";for(var x=1;x<args.length;x++){daRoles+=args[x]+" ";}daRoles=daRoles.slice(0,-1);}
				
				let rName=guild.roles.find('name', daRoles); 
				if(!rName){
					let startWord=args[1].slice(0,3).toLowerCase();
					
					for (var i=0;i<rolesNameLC.length;i++){
						if(rolesNameLC[i].startsWith(startWord)){
							meantThis += daRolesN[i] +", ";
						}
					}
					if(!meantThis){
						startWord=args[1].slice(0,2).toLowerCase(); meantThis="";
						for (var i=0;i<rolesNameLC.length;i++){
							if(rolesNameLC[i].startsWith(startWord)){
								meantThis += daRolesN[i] +", ";
							}
						}
					}
					if(!meantThis){
						startWord=args[1].slice(0,1).toLowerCase(); meantThis="";
						for (var i=0;i<rolesNameLC.length;i++){
							if(rolesNameLC[i].startsWith(startWord)){
								meantThis += daRolesN[i] +", ";
							}
						}
					}
					if(meantThis){
						return message.reply("I couldn't find such role, but I found these **roles**: "+meantThis.slice(0,-2));
					}
					return message.reply("I couldn't find such role, please try again! syntax: `!roles search <ROLE-NAME>`");
				}
				else {
					return message.reply("found it! who would you like to assign this role to? IE: `!role @mention "+daRoles+"`");
				}
			}
			if(args[0]==="remove"){
				let daRolesN=guild.roles.map(r => r.name); let meantThis="";
				
				// ROLES WITH SPACES - NEW
				let daRoles="";if(!args[3]){daRoles=args[2]}else{daRoles="";for(var x=2;x<args.length;x++){daRoles+=args[x]+" ";}daRoles=daRoles.slice(0,-1);}
				
				if(!mentioned){
					return message.reply("please `@mention` a person you want me to remove `!role` from...");
				}
				if(!args[2]){
					return message.reply("what role do you want me to remove from "+mentioned+" 🤔 ?");
				}
				
				// CHECK ROLE EXIST
				let rName=guild.roles.find('name', daRoles); 
				if(!rName){
					return message.reply("I couldn't find such role, please try searching for it first: `!roles search <ROLE-NAME>`");
				}
				
				// CHECK MEMBER HAS ROLE
				if(!guild.members.get(mentioned.id).roles.has(rName.id)){
					return message.reply("member doesn't have this role...");
				}
				else {
					mentioned=message.mentions.members.first();
					mentioned.removeRole(rName).catch(console.error);
					return channel.send("⚠ "+mentioned+" have **lost** their role of: **"+daRoles+"** 😅 ");
				}
			}
			if(args[0] && !mentioned){
				return message.reply("please `@mention` a person you want me to give/remove `!role` to...");
			}
			else {
				let daRoles="";if(!args[2]){daRoles=args[1]}else{daRoles="";for(var x=1;x<args.length;x++){daRoles+=args[x]+" ";}daRoles=daRoles.slice(0,-1);}
				mentioned=message.mentions.members.first();
				
				let rName=guild.roles.find('name', daRoles); 
				if(!rName){
					return message.reply("I couldn't find such role, please try searching for it first: `!roles search <ROLE-NAME>`");
				}
				mentioned.addRole(rName).catch(console.error);
				return channel.send("👍 "+mentioned+" has been given the role of: **"+daRoles+"**, enjoy! 🎉");
			}
		}
	}
	
	
	
// ############################## TEMPORARY ROLES ##############################
	if(command.startsWith("temprole") || command.startsWith("trole")){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			// message.delete();
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!trole check <@mention>`\n"
						+"`!trole remove <@mention> <role_name>`\n"
						+"`!trole <@mention> <number_days> <role_name>`"
				};
				return channel.send({embed: embedMSG});
			}
			if(args[0] && !mentioned){
				return message.reply("please `@mention` a person you want me to give/remove `!temprole` to...");
			}
			if(!args[1] && mentioned){
				return message.reply("imcomplete data, please try: \n `!temprole @mention <DAYS> <ROLE-NAME>`,\n or `!temprole remove @mention`\n or `!temprole check @mention`");
			}
			else {
				let dateMultiplier=86400000; mentioned=message.mentions.members.first(); 
				
				// CREATE DATABASE TABLE 
				sql.run("CREATE TABLE IF NOT EXISTS temporary_roles (userID TEXT, temporaryRole TEXT, startDate TEXT, endDate TEXT, addedBy TEXT)").catch(console.error);
				
				// CHECK DATABASE FOR ROLES
				if(args[0]==="check"){
					mentioned=message.mentions.members.first();
					sql.all(`SELECT * FROM temporary_roles WHERE userID="${mentioned.id}"`).then(rows => {
						if (!rows[0]) {
							return channel.send("⚠ "+mentioned+" is **NOT** in my `DataBase`, "+user);
						}
						else {
							let daRolesFindings="✅ "+mentioned+"'s TemporaryRole(s):\n";
							for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
								let startDateVal=new Date(); startDateVal.setTime(rows[rowNumber].startDate);
								startDateVal=(startDateVal.getMonth()+1)+"/"+startDateVal.getDate()+"/"+startDateVal.getFullYear();
								let endDateVal=new Date(); endDateVal.setTime(rows[rowNumber].endDate);
								finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
								daRolesFindings+="**"+rows[rowNumber].temporaryRole+"**, ends:`"+finalDate+"`, addedBy: <@"+rows[rowNumber].addedBy+"> on:`"+startDateVal+"`\n";
							}
							return channel.send(daRolesFindings)
						}
					}).catch(console.error); return
				}
				
				// REMOVE MEMBER FROM DATABASE
				if(args[0]==="remove"){
					mentioned=message.mentions.members.first();
					// ROLES WITH SPACES - NEW
					let daRoles="";if(!args[3]){daRoles=args[2]}else{daRoles="";for(var x=2;x<args.length;x++){daRoles+=args[x]+" ";}daRoles=daRoles.slice(0,-1);}
					
					sql.get(`SELECT * FROM temporary_roles WHERE userID="${mentioned.id}" AND temporaryRole="${daRoles}"`).then(row => {
						if(!row){
							return message.reply("⚠ [ERROR] "+mentioned+" is __NOT__ in my `DataBase`");
						}
						else {
							let theirRole=guild.roles.find('name', row.temporaryRole);
							if(mentioned.roles.has(theirRole.id)){mentioned.removeRole(theirRole).catch(console.error);}
							sql.get(`DELETE FROM temporary_roles WHERE userID="${mentioned.id}" AND temporaryRole="${daRoles}"`).then(row => {
								return channel.send("⚠ "+mentioned+" have **lost** their role of: **"+theirRole.name+"** and has been removed from my `DataBase`");
							});
						}
					}).catch(console.error); return
				}
				
				// CHECK AMOUNT OF DAYS WERE ADDED
				if(!args[1]){
					return message.reply("for how **many** days do you want "+mentioned+" to have this role?");
				}
				
				if(!args[2]){
					return message.reply("what role do you want to assign to "+mentioned+"?");
				}
				
				// ROLES WITH SPACES - NEW
				let daRoles="";if(!args[3]){daRoles=args[2]}else{daRoles="";for(var x=2;x<args.length;x++){daRoles+=args[x]+" ";}daRoles=daRoles.slice(0,-1);}
				
				if(!parseFloat(args[1])){
					return message.reply("Error: second value has to be **X** number of days, IE:\n`!"+command+" @"+mentioned.user.username+" 90 "+daRoles+"`");
				}
				
				// CHECK ROLE EXIST
				let rName=guild.roles.find('name', daRoles);
				if(!rName){
					return message.reply("I couldn't find such role, please try searching for it first: `!roles search <ROLE-NAME>`");
				}
				
				// ADD MEMBER TO DATASE, AND ADD THE ROLE TO MEMBER
				sql.get(`SELECT * FROM temporary_roles WHERE userID="${mentioned.id}" AND temporaryRole="${daRoles}"`).then(row => {
					mentioned=message.mentions.members.first(); 
					if (!row) {
						let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
						let finalDate=((args[1])*(dateMultiplier)); finalDate=((curDate)+(finalDate));
						finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
						
						// return channel.send(" curDate: `"+curDate+"`\n finalDate: `"+finalDate+"`\n dateMultiplier: `"+dateMultiplier+"`\n finalDateDisplay: "+finalDateDisplay);
						sql.run("INSERT INTO temporary_roles (userID, temporaryRole, startDate, endDate, addedBy) VALUES (?, ?, ?, ?, ?)", 
							[mentioned.id, daRoles, curDate, finalDate, user.id]);
						let theirRole=guild.roles.find('name', daRoles);
						mentioned.addRole(theirRole).catch(console.error);
						console.log(timeStamp(2)+"[ADMIN] [TEMPORARY-ROLE] \""+mentioned.user.username+"\" ("+mentioned.id+") was given role: \""+daRoles+"\", by: "+user.user.username+" ("+user.id+")");
						return channel.send("🎉 "+mentioned+" has been given a **temporary** role of: **"+daRoles+"**, enjoy! They will lose this role on: `"+finalDateDisplay+"`");
					}
					else {
						return message.reply("this user already has this **temporary** role... try using `!temprole remove @"+mentioned.user.username+" "+daRoles+"` if you want to **change** their date.");
					}
				}).catch(console.error);
			}
		}
	}
	
	
	
// ############################## WARNING ##############################
	if(command==="warn"){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!warn <@mention> [reason]`"
				};
				return channel.send({embed: embedMSG});
			}
			if(!mentioned){
				message.delete();
				return message.reply("please `@mention` a person you want me to `!warn`");
			}
			else {
				message.delete();
				
				// IMPROVED WAY TO GRAB REASONS:
					let msgReasons;if(message.content.indexOf(" ")===-1){return}
					else{msgReasons=message.content.slice(message.content.indexOf(" "));msgReasons=msgReasons.trim();
					if(msgReasons.indexOf(" ")===-1){msgReasons="Check yourself!"}
					else{msgReasons=msgReasons.trim();msgReasons=msgReasons.slice(msgReasons.indexOf(" "));msgReasons=msgReasons.trim();}}
				
				embedMSG={
					'color': 0xFF0000,
					'title': '⚠ THIS IS A WARNING ⚠',
					'thumbnail': {'url': config.images.warning},
					'description': '**From Server**: '+config.serverName+'\n**Reason**: '+msgReasons+'\n\n**By**: '+user.user+'\n**On**: '+timeStamp(1)
				};
				bot.users.get(mentioned.id).send({embed: embedMSG}).catch(console.error);
				embedMSG={
					'color': 0xFF0000,
					'title': '⚠ "'+mentioned.username+'" WAS WARNED',
					'thumbnail': {'url': config.images.warning},
					'description': '**UserID**: '+mentioned.id+'\n**UserTag**: '+mentioned+'\n'
						+'**Reason**: '+msgReasons+'\n\n**By**: '+user.user+'\n**On**: '+timeStamp(1)
				};
				channel.send("⚠ "+mentioned+", you are being **WARNED** about: **"+msgReasons+'**');
				return bot.channels.get(config.modLogChannel.channelID).send({embed: embedMSG}).catch(console.error);
			}
		}
	}
	
	
	
// ############################## MUTE ##############################
	if(command==="mute"){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!mute <@mention> [reason]`"
				};
				return channel.send({embed: embedMSG});
			}
			if(!mentioned){
				message.delete();
				return message.reply("please `@mention` a person you want me to `!mute`");
			}
			else {
				message.delete();
				
				// IMPROVED WAY TO GRAB REASONS:
					let msgReasons;if(message.content.indexOf(" ")===-1){return}
					else{msgReasons=message.content.slice(message.content.indexOf(" "));msgReasons=msgReasons.trim();
					if(msgReasons.indexOf(" ")===-1){msgReasons="Check yourself!"}
					else{msgReasons=msgReasons.trim();msgReasons=msgReasons.slice(msgReasons.indexOf(" "));msgReasons=msgReasons.trim();}}
				
				mentioned=message.mentions.members.first();
				channel.overwritePermissions(mentioned, {SEND_MESSAGES: false})
				.then(() => {
					embedMSG={
						'color': 0xFF0000,
						'title': '🤐 "'+mentioned.username+'" WAS MUTED',
						'thumbnail': {'url': config.images.muted},
						'description': '**UserID**: '+mentioned.id+'\n**UserTag**: '+mentioned+'\n'
							+'**Channel**: <#'+channel.id+'>\n**Reason**: '+msgReasons+'\n\n**By**: '+user.user+'\n**On**: '+timeStamp(1)
					};
					bot.channels.get(config.modLogChannel.channelID).send({embed: embedMSG}).catch(console.error);
					console.log(timeStamp(2)+"[ADMIN] [MUTE] \""+mentioned.username+"\" ("+mentioned.id+") was MUTED in guild: "+guild.name+", channel: #"+channel.name+" due to: "+msgReasons);
					return channel.send("⚠ "+mentioned+" has been 🤐 **MUTED** 🤐 for: **"+msgReasons+'**');
				}).catch(console.error);
			}
		}
	}
	
	
	
// ############################## UNMUTE ##############################
	if(command==="unmute"){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!unmute <@mention>`"
				};
				return channel.send({embed: embedMSG});
			}
			if(!mentioned){
				message.delete();
				return message.reply("please `@mention` a person you want me to `!unmute`");
			}
			else {
				message.delete();
				mentioned=message.mentions.members.first();
				channel.permissionOverwrites.get(mentioned.id).delete().catch(console.error);
				return channel.send(mentioned+" can now **type/send** messages again 👍 ... but **don't** abuse it!");
			}
		}
	}
	
	
	
// ############################## KICK ##############################
	if(command==="kick"){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!kick <@mention> [reason]`"
				};
				return channel.send({embed: embedMSG});
			}
			if(!mentioned){
				message.delete();
				return message.reply("please `@mention` a person you want me to `!kick`");
			}
			else {
				message.delete();
				
				// IMPROVED WAY TO GRAB REASONS:
					let msgReasons;if(message.content.indexOf(" ")===-1){return}
					else{msgReasons=message.content.slice(message.content.indexOf(" "));msgReasons=msgReasons.trim();
					if(msgReasons.indexOf(" ")===-1){msgReasons="Check yourself!"}
					else{msgReasons=msgReasons.trim();msgReasons=msgReasons.slice(msgReasons.indexOf(" "));msgReasons=msgReasons.trim();}}
				
				mentioned=message.mentions.members.first();
				console.log(timeStamp(2)+"[ADMIN] [KICK] \""+mentioned.username+"\" ("+mentioned.id+") was KICKED from guild: "+guild.name+", channel: #"+channel.name+" due to: "+msgReasons);
				channel.send("⚠ "+mentioned+" has been 👞 __**kicked**__ from server for: **"+msgReasons+"**").catch(console.error);
				embedMSG={
					'color': 0xFF0000,
					'title': 'YOU HAVE BEEN KICKED',
					'thumbnail': {'url': config.images.kicked},
					'description': '**From Server**: '+config.serverName+'\n**Reason**: '+msgReasons+'\n\n**By**: '+user.user+'\n**On**: '+timeStamp(1)
				};
				bot.users.get(mentioned.id).send({embed: embedMSG}).then(()=>{
					embedMSG={
						'color': 0xFF0000,
						'title': '👞 "'+mentioned.username+'" WAS KICKED',
						'thumbnail': {'url': config.images.kicked},
						'description': '**UserID**: '+mentioned.id+'\n**UserTag**: '+mentioned+'\n'
							+'**Reason**: '+msgReasons+'\n\n**By**: '+user.user+'\n**On**: '+timeStamp(1)
					};
					bot.channels.get(config.modLogChannel.channelID).send({embed: embedMSG}).catch(console.error);
					return guild.member(mentioned.id).kick().catch(console.error);
				}).catch(console.error);
			}
		}
	}
	
	
	
// ############################## BAN ##############################
	if(command==="ban"){
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!ban <@mention> [reason]`"
				};
				return channel.send({embed: embedMSG});
			}
			if(!mentioned){
				message.delete();
				return message.reply("please `@mention` a person you want me to `!ban`");
			}
			else {
				
				// IMPROVED WAY TO GRAB REASONS:
					let msgReasons;if(message.content.indexOf(" ")===-1){return}
					else{msgReasons=message.content.slice(message.content.indexOf(" "));msgReasons=msgReasons.trim();
					if(msgReasons.indexOf(" ")===-1){msgReasons="Check yourself!"}
					else{msgReasons=msgReasons.trim();msgReasons=msgReasons.slice(msgReasons.indexOf(" "));msgReasons=msgReasons.trim();}}
				
				console.log(timeStamp(2)+"[ADMIN] [BAN] \""+mentioned.username+"\" ("+mentioned.id+") was BANNED from guild: "+guild.name+", channel: #"+channel.name+" due to: "+msgReasons);
				channel.send("⛔ "+mentioned+" has been __**banned**__ 🔨 from server for: **"+msgReasons+"**").catch(console.error);
				embedMSG={
					'color': 0xFF0000,
					'title': 'YOU HAVE BEEN BANNED',
					'thumbnail': {'url': config.images.banned},
					'description': '**From Server**: '+config.serverName+'\n**Reason**: '+msgReasons+'\n\n**By**: '+user.user+'\n**On**: '+timeStamp(1)
				};
				bot.users.get(mentioned.id).send({embed: embedMSG}).then(()=>{
					return guild.member(mentioned.id).ban({days: 7, reason: msgReasons}).catch(console.error);
				}).catch(console.error);
			}
		}
	}
	
	
	
// ############################## CREATE ##############################
	if(command==="create"){
		if(m.roles.has(ModR.id) || m.roles.has(AdminR.id) || m.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!create ouput <#channel>`\n"
						+"`!create webhook [#channel/channel_id]`\n"
						+"`more coming soon`\n"
				};
				return channel.send({embed: embedMSG});
			}
			if(args[0]==="webhook"){
				return channel.send("WIP, if you wan to use it, adjust `tagAdmin`, `adminChan`,  and `imageUrl` in `adminBot.js` Line 1087");
				/*
				let tagAdmin="237260406144499712";
				let adminChan="412734854476595220";
				let imageUrl="https://raw.githubusercontent.com/overshadowed/PokeAlarm/master/icons/Sponsors/admins.png";
				
				if(!args[1]){
					let daChan=c.name;
					
					c.createWebhook("#"+c.name+"["+Math.floor(Math.random()*9999)+"]",imageUrl,"bot created").then(webhook=>{
						c.send("✅ Webhook created for this channel, "+m+"...\nInformation sent to **Admin** channel");
						
						bot.channels.get(adminChan).send("✅ Webhook was created in channel: `#"+daChan+"`, <@"+tagAdmin+">\n"
							+"__WH__**Name**: `"+webhook.name+"`\n__WH__**Url**:\n"
							+"```\nhttps://discordapp.com/api/webhooks/"+webhook.id+"/"+webhook.token+"```")
					}).catch(()=>{ c.send("⛔ Error: I can't create more webhooks, I've reached the limit!") });
					return;
				}
				if(parseFloat(args[1])){
					let channeled=bot.channels.get(args[1]);
					bot.channels.get(channeled.id).createWebhook("#"+channeled.name+"["+Math.floor(Math.random()*9999)+"]",imageUrl,"bot created").then(webhook=>{
						c.send("✅ Webhook created for channel: `#"+channeled.name+"`, "+m+"...\nInformation sent to **Admin** ( <#403739565606830091> ) channel");
						
						bot.channels.get(adminChan).send("✅ Webhook was created in channel: `#"+channeled.name+"`, <@"+tagAdmin+">\n"
							+"__WH__**Name**: `"+webhook.name+"`\n__WH__**Url**:\n"
							+"```\nhttps://discordapp.com/api/webhooks/"+webhook.id+"/"+webhook.token+"```")
					}).catch(()=>{ c.send("⛔ Error: I can't create more webhooks, I've reached the limit!") });
					return;
				}
				if(message.mentions.channels.first()){
					let channeled=message.mentions.channels.first();
					
					bot.channels.get(channeled.id).createWebhook("#"+channeled.name+"["+Math.floor(Math.random()*9999)+"]",imageUrl,"bot created").then(webhook=>{
						c.send("✅ Webhook created for channel: `#"+channeled.name+"`, "+m+"...\nInformation sent to **Admin** ( <#403739565606830091> ) channel");
						
						bot.channels.get(adminChan).send("✅ Webhook was created in channel: `#"+channeled.name+"`, <@"+tagAdmin+">\n"
							+"__WH__**Name**: `"+webhook.name+"`\n__WH__**Url**:\n"
							+"```\nhttps://discordapp.com/api/webhooks/"+webhook.id+"/"+webhook.token+"```")
					}).catch(()=>{ c.send("⛔ Error: I can't create more webhooks, I've reached the limit!") }); //
					return;
				}
				else {
					c.send("⛔ Invalid syntax! Try:\n"
						+"`!create webhook` on a channel, or\n"
						+"`!create webhook <CHANNEL_ID>` for remote channel, or\n"
						+"`!create webhook <#CHANNEL>` for remote channel, same server")
				}
				*/
			}
		}
	}
	
	
	
// ############################## FETCH DATA ##############################
	if(command==="fetch"){
		if(user.roles.has(AdminR.id) || user.id===config.ownerID){
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!fetch output <#channel>`\n"
						+"`!fetch webhooks`\n"
						+"`!fetch roles`\n"
						+"`!fetch users`"
				};
				return channel.send({embed: embedMSG});
			}
			if(args[0]==="output"){
				if(!args[1]){
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!fetch output <#channel>`\n"
							+"assign channel where this command can be used"
					};
					return channel.send({embed: embedMSG});
				}
				if(channeled){
					fetchOutput=channeled.id;
					return channel.send("✅ Output channel for `!fetch` is now set to: <#"+fetchOutput+">");
				}
				if(parseFloat(args[1])){
					fetchOutput=args[1];
					return channel.send("✅ Output channel for `!fetch` is now set to: <#"+args[1]+">");
				}
			}
			
			if(!fetchOutput){
				embedMSG={
					"color": 0xFF0000,
					"title": "⚠ No channel Output ℹ",
					"description": "`!fetch output <#channel>`\n"
						+"▲ You need to setup an output/private channel"
				};
				return channel.send({embed: embedMSG});
			}
			
			// FETCH ALL WEBHOOKS AND CHANNELS
			if(args[0]==="webhooks"){
				let whData=""; let whCount="0";
				guild.fetchWebhooks().then(wh => wh.map(whInfo => {
					var daChan=bot.channels.get(whInfo.channelID); whCount++;
					fs.writeFile('./allWebhooks.json', whData, function(err){if(err)throw err;});
					whData+="Channel: #"+daChan.name+"\n"
						+"	Url: https://discordapp.com/api/webhooks/"+whInfo.id+"/"+whInfo.token+"\n\n"
					
				}))
				.then(()=>{
					embedMSG={
						'color': 0x00FF00,
						'description': '📥 **Grabbing ALL**(`'+whCount+'`)** Webhooks** 📥\nAnd **saving** them to a file... \nplease wait...'
					};
					channel.send({embed: embedMSG}).then(()=>{
						channel.send("✅ File was uploaded to `secret` channel: <#"+fetchOutput+">")
						.then(()=>{
							bot.channels.get(fetchOutput).send({files: ["./allWebhooks.json"]}).catch(console.error)
						})
						.catch(console.error)
					}).catch(console.error)
				}).catch(console.error)
			}
			
			// FETCH ALL ROLES IDs AND NAMES
			if(args[0]==="roles"){
				let roleNames=""; let roleIDs=""; let roleData=""; let roleCount="0";
				
				roleNames=guild.roles.map(r => r.name);roleNames=roleNames.slice(1);
				roleIDs=guild.roles.map(r => r.id);roleIDs=roleIDs.slice(1);
				if(!roleNames){return} roleCount=roleNames.length;
				for(var x="0";x<roleCount;x++){
					roleData+="	roleName: "+roleNames[x]+"\n		roleID: "+roleIDs[x]+"\n\n";
				}
				fs.writeFile('./allRoles.json', "{\n"+roleData+"}", function(err){if(err)throw err;});
				embedMSG={
					'color': 0x00FF00,
					'description': '📥 **Grabbing ALL**(`'+roleCount+'`)** Roles** 📥\nAnd **saving** them to a file... \nplease wait...'
				};
				channel.send({embed: embedMSG}).then(()=>{
					channel.send("✅ File was uploaded to `secret` channel: <#"+fetchOutput+">")
					.then(()=>{
						bot.channels.get(fetchOutput).send({files: ["./allRoles.json"]}).catch(console.error)
					}).catch(console.error)
				}).catch(console.error)
			}
			
			// FETCH ALL MEMBERS
			if(args[0]==="users"){
				let allUsers=""; let allUsersID=""; let allUsersNames=""; let allNickNames=""; let userCount="0"; let usersData="";
				allUsers=guild.members.map(m=>m.user.id+"|"+m.user.username+"|"+m.user.nickname);
				allUsersID=guild.members.map(m=>m.user.id); allUsersNames=guild.members.map(m=>m.user.username);
				allNickNames=guild.members.map(m=>m.user.nickname);if(!allUsers){return} userCount=allUsers.length;
				for(var x="0";x<userCount;x++){
					usersData+="	["+x+"]UserID: "+allUsersID[x]+"\n		UserName: "+allUsersNames[x]+"\n		NickName: "+allNickNames[x]+"\n\n";
				}
				fs.writeFile('./allUsers.json', "{\n"+usersData+"}", function(err){if(err)throw err;});
				embedMSG={
					'color': 0x00FF00,
					'description': '📥 **Grabbing ALL**(`'+userCount+'`)** Users** 📥\nAnd **saving** them to a file... \nplease wait...'
				};
				channel.send({embed: embedMSG}).then(()=>{
					channel.send("✅ File was uploaded to `secret` channel: <#"+fetchOutput+">")
					.then(()=>{
						bot.channels.get(fetchOutput).send({files: ["./allUsers.json"]}).catch(console.error)
					}).catch(console.error)
				}).catch(console.error);
			}
		}
	}
	
	
	
	if(command==="pogo"){
		if(args[0]==="ver"){
			request("https://pgorelease.nianticlabs.com/plfe/version", function(error,response,body){
				return channel.send("Pokémon Go **API** version: **"+body.slice(2)+"**");
			})
		}
		if(args[0]==="status" && args[1]==="ptc"){
			request("https://www.jooas.com/status/pokemon-trainer-club", function(error,response,body){
				let HTMLdata=body;
				PokeStart=HTMLdata.indexOf("<h3>Status</h3>");
				HTMLdata=HTMLdata.slice(PokeStart);
				PokeEnds=HTMLdata.indexOf("</div>");
				HTMLdata=HTMLdata.slice(0,PokeEnds);
				HTMLdata=HTMLdata.split("\n");
				HTMLdata=HTMLdata[4]; HTMLdata=HTMLdata.replace(/<\/?[^>]+(>|$)/g, "");
				return channel.send("Pokémon Go **PTC** status: **"+HTMLdata+"**");
			});
			return
		}
		if(args[0]==="status"){
			request("https://www.jooas.com/status/pokemon-go", function(error,response,body){
				let HTMLdata=body;
				PokeStart=HTMLdata.indexOf("<h3>Status</h3>");
				HTMLdata=HTMLdata.slice(PokeStart);
				PokeEnds=HTMLdata.indexOf("</div>");
				HTMLdata=HTMLdata.slice(0,PokeEnds);
				HTMLdata=HTMLdata.split("\n");
				HTMLdata=HTMLdata[4]; HTMLdata=HTMLdata.replace(/<\/?[^>]+(>|$)/g, "");
				return channel.send("Pokémon Go **SERVER** status: **"+HTMLdata+"**");
			})
			return
		}
		embedMSG={
			"color": 0xFF0000,
			"title": "ℹ Available Syntax and Arguments ℹ",
			"description": "`!pogo ver`\n"
				+"`!pogo status`\n"
				+"`!pogo status ptc`\n"
		};
		return channel.send({embed: embedMSG});
		
	}
	
	
	
// ############################## BOT VERSION ##############################
	if(command.startsWith("ver")){
		request("https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/version.txt",
			function(error,response,body){
				if(error){console.info(error)}
				if(body){
					let gitHubVer=body.slice(0,-1);
					let verChecker="✅"; if(gitHubVer!==config.botVersion){ verChecker="⚠" }
					channel.send(
						"GitHub **Discord** Bot [`PokéHelp`] __version__: **"+gitHubVer+"**\n"
						+"Local **Discord** Bot [`PokéHelp`] __version__: **"+config.botVersion+"** "+verChecker+"\n"
						+"**Discord** API [`discord.js`] __version__: **"+Discord.version+"**\n"
						+"**Node** API [`node.js`] __version__: **"+process.version+"**"
					)
				}
			}
		)
	}
	
	
//
//
/*																		  */
/*	// // // // // // // // // // // // // // // // // // // // // // //  */
/*	//																  //  */
/*	// ADMIN COMMANDS => CHANGING SETTINGS OR CONFIG THROUGH COMMANDS //  */
/*	//																  //  */
/*	// // // // // // // // // // // // // // // // // // // // // // //  */
/*																		  */
//
//
	
	if(command.startsWith("set")){
		if(user.id===config.ownerID || user.roles.has(AdminR.id)){
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="serverevents"){
				if(args[1]==="on"){config.serverEvents.enabled="yes"}
				if(args[1]==="off"){config.serverEvents.enabled="no"}
				
				// ROLE EVENTS
				if(args[1]==="roles" && args[2]==="on"){config.serverEvents.roleEvents="yes"}
				if(args[1]==="roles" && args[2]==="off"){config.serverEvents.roleEvents="no"}
				if(args[1]==="join" && args[2]==="on"){config.serverEvents.joinEvents="yes"}
				if(args[1]==="join" && args[2]==="off"){config.serverEvents.joinEvents="no"}
				if(args[1]==="join" && args[2]==="random" && args[3]==="on"){config.serverEvents.joinRandom="yes"}
				if(args[1]==="join" && args[2]==="random" && args[3]==="off"){config.serverEvents.joinRandom="no"}
				
				if(args[1]==="channel"){config.serverEvents.channelID=channeled.id}
			}
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="modlog"){
				if(args[1]==="on"){config.modLogChannel.enabled="yes"}
				if(args[1]==="off"){config.modLogChannel.enabled="no"}
				if(args[1]==="mute" && args[2]==="on"){config.modLogChannel.muteEvents="yes"}
				if(args[1]==="mute" && args[2]==="off"){config.modLogChannel.muteEvents="no"}
				if(args[1]==="kick" && args[2]==="on"){config.modLogChannel.kickEvents="yes"}
				if(args[1]==="kick" && args[2]==="off"){config.modLogChannel.kickEvents="no"}
				if(args[1]==="ban" && args[2]==="on"){config.modLogChannel.banEvents="yes"}
				if(args[1]==="ban" && args[2]==="off"){config.modLogChannel.banEvents="no"}
				if(args[1]==="channel"){config.modLogChannel.channelID=channeled.id}
			}
		}
	}


	// RESTART THIS MODULE
	if(command==="restart" && user.id===config.ownerID && args[0]==="admin"){
		channel.send("♻ Restarting **Admin** (`adminBot.js`) module... please wait `3` to `5` seconds...").then(()=>{ process.exit(1) }).catch(console.error);
	}
	
});



//
// CONNECT BOT TO DISCORD
//
bot.login(config.token);


//
// DISCONNECTED
//
bot.on('disconnected', function (){
	console.info(timeStamp(2)+'-- Disconnected --');console.log(console.error);
	process.exit(1);
});
