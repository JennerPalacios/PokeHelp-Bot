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
const fs = require("fs");
const request = require("request");
const sql = require("sqlite");
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
	guild="", user="", channel="", mentioned="", channeled="";

// DATE&TIME VALUES
const DTdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DTmonths=["January","February","March","April","May","June","July","August","September","October","November","December"];
// END OF: COMMON VARIABLES, ARRAYS, AND OBJECTS


//
// DATABASE TIMER FOR TEMPORARY SELF TAGS
//
setInterval(function(){
	let timeNow=new Date().getTime(); let dbTime=""; let daysLeft="";
	sql.run("CREATE TABLE IF NOT EXISTS selfTemp_roles (userID TEXT, temporaryRole TEXT, startDate TEXT, endDate TEXT)").catch(console.error);
	sql.all(`SELECT * FROM selfTemp_roles`).then(rows => {
		if (!rows) {
			return console.info(timeStamp(2)+"[ADMIN] No one is in the DataBase");
		}
		else {
			for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
				dbTime=rows[rowNumber].endDate; daysLeft=(dbTime*1)-(timeNow*1);
				if(daysLeft<1){
					member=bot.guilds.get(config.serverID).members.get(rows[rowNumber].userID); 
					if(!member){ member.user.username="<@"+rows[rowNumber].userID+">"; member.id=""; }
					console.log(timeStamp(2)+"[ADMIN] [TEMPORARY-TAG] \""+member.user.username+"\" ("+member.id+") have lost their role: "+rows[rowNumber].temporaryRole+"... time EXPIRED");
					bot.channels.get(config.mainChannel.channelID).send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their temporary role/**tag**: **"
						+rows[rowNumber].temporaryRole+"** 😭").catch(console.error);
					bot.users.get(member.id).send("⚠ <@"+rows[rowNumber].userID+">, you have **lost** your temporary role/**tag**: **"
						+rows[rowNumber].temporaryRole+"** 😭").catch(console.error);
					
					// CHECK IF ROLE EXIST, AND CHECK IF USER STILL IN SERVER
					let rName=bot.guilds.get(config.serverID).roles.find('name', rows[rowNumber].temporaryRole); 
					if(!rName){ return console.log("[ERROR] [ADMIN] [TEMPORARY-TAG] Role ID: "+rows[rowNumber].temporaryRole+" was not found in server!") }
					let daMember=bot.guilds.get(config.serverID).members.get(rows[rowNumber].userID);
					if(!daMember){ return console.log("[ERROR] [ADMIN] [TEMPORARY-TAG] Member ID: "+rows[rowNumber].userID+" was not found in server!") }
					
					// REMOVE ROLE FROM USER
					if(daMember.roles.has(rName.id)){daMember.removeRole(rName).catch(console.error)}
					// REMOVE DATABASE ENTRY
				sql.get(`DELETE FROM selfTemp_roles WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}"`).catch(console.error);
					return;
				}
			}
		}
	}).catch(()=>{
		sql.run("CREATE TABLE IF NOT EXISTS selfTemp_roles (userID TEXT, temporaryRole TEXT, startDate TEXT, endDate TEXT)").catch(console.error);
		return console.info(timeStamp(2)+"[ADMIN] Database CREATED");
	});
},3600000);
// 86400000 = 24hrs
// 43200000 = 12hrs
// 21600000 = 6hrs
// 10800000 = 3hrs 
// 3600000 = 1hr



//
// TIME STAMP FUNCTION
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
// END OF: TIME STAMP FUNCTION



//
// BOT SIGNED IN AND IS READY
//
bot.on('ready', () => {
	console.info(timeStamp(2)+"-- DISCORD HELPBOT: "+bot.user.username+", USERS MODULE IS READY --");
});



// ##########################################################################
// ############################## TEXT MESSAGE ##############################
// ##########################################################################
bot.on('message', message => {
	
	// STOP SCRIPT IF TEXT IS PRIVATE MESSAGE
	if(message.channel.type==="dm"){ return }
	
	// 
	// UNOWN DETECTION
	//
	/*
	
	PLEASE MAKE SURE YOU ADJUST THESE SETTINGS AND LINES FOR YOUR SERVER, IF YOU HAPPEN TO HAVE A UNOWN CHANNEL
	FOLLOW THE STRUCTURE FROM YOUR POKEALARM SETTINGS, WHAT'S ON THE TITLE, WHAT SEPARATES WHAT INFO, ETchannel...
	
	*/
	if(config.unownAlerts.enabled==="yes" && message.channel.id===config.unownAlerts.inputChannelID) {
		
		let etitle = message.embeds[0].title;
			etitle = etitle.split(" ");
		let eurl = message.embeds[0].url;
		let edescription = message.embeds[0].description; edescription=edescription.slice(0, -27);
		let eimg = message.embeds[0].thumbnail.url;
		
		let txt="Hey @everyone quick! \nA wild **Unown** has just __spawned__! <(^.^<)\n"
			+"**Letter**: "+ etitle[2] +"\n" + edescription + "\n**GoogleMaps**: " + eurl;
		bot.channels.get(config.unownAlerts.outputChannelID).send(txt).catch(console.error)
	}
	//
	// END OF UNOWN DETECTION
	//
	
	
	
// ############################## AUTO LEVEL ROLES ##############################
	if(config.selfLvlRoles.enabled==="yes"){
		if(parseFloat(config.selfLvlRoles.channelID) && message.channel.id===config.selfLvlRoles.channelID){
			// LEVEL ROLE NAME PREFIX (INCLUDE SPACE OR ":" OR "-")
			let lvlRolesPrefix=config.selfLvlRoles.rolePrefix;
			
			// AVAILABLE LEVEL ROLES
			let lvlRoles=["25-29","30","31","32","33","34","35","36","37","38","39","40"];
			
			// VARIABLES
			let newRole=""; let oldRole="";
			
			// ERROR MESSAGE
			let levelNotFound="\n⚠ Level **NOT** found! Please make sure you type **ONLY** your level, and nothing else, along with your screenshot.\n"
					+" » Exact levels on file: `"+lvlRoles+"`\n**[WARNING]**: __DO NOT__ abuse this function (assigning your own **Level**-role)... "
					+"screenshots and levels **are still** being __verified__ by staff and moderators; abusers will **lose** their rights to this function, the channel, and level assignment";
			
			// IGNORE PICTURES, MESSAGES FROM BOT, AND COMMAND MESSAGES
			if(message.content && message.member.id!==config.botID && !message.content.startsWith(config.cmdPrefix)){
				
				// REMOVE ANY PREVIOUS LEVEL ROLE
				for(var availbleRole=0;availbleRole<lvlRoles.length;availbleRole++){
					// CHECK FOR ALL LEVEL ROLES SEE IF USER HAS ANY
					oldRole=message.guild.roles.find("name", lvlRolesPrefix+lvlRoles[availbleRole]);
					
					// OLD ROLE FOUND
					if(oldRole && message.member.roles.has(oldRole.id)){
						
						// ATTEMPT TO REMOVE OLD ROLE
						message.member.removeRole(oldRole).then(()=>{
							
							// OLD ROLE REMOVED, NOW ADD NEW ROLE
							newRole=message.guild.roles.find("name", lvlRolesPrefix+message.content);
							if(newRole){message.member.addRole(newRole)}
						}).catch(console.error);
					}
				}
				
				// OLD ROLE WAS NOT FOUND, CHECK IF LEVEL ROLE EXIST WHILE MAKING SURE USER'S INPUT IS JUST DIGIT/NUMBER
				for(var userInput=0;userInput<lvlRoles.length;userInput++){
					if(message.content===lvlRoles[userInput]){
						newRole=message.guild.roles.find("name", lvlRolesPrefix+message.content);
					}
				}
				
				// NEW ROLE IS VALID, ROLE WAS FOUND, ATTEMPT TO ADD IT
				if(newRole){
					message.member.addRole(newRole).catch(console.error);
					return message.channel.send("🎉 Congratulations to: "+message.member+"! They are now **Level: "+message.content+"** 🎉 ")
				}
				
				// PICTURE IS FINE, BUT TEXT MESSAGE IS NOT A NUMBER - COULD BE CHAT - OR ISNOT ONE OF THE VALID NUMBERS... WARN THEM!
				return message.reply(levelNotFound)
			}
		}
	}
	
	
	
	// GET CHANNEL INFO
	guild=message.guild; channel=message.channel; user=message.member; msg1=message.content; msg2=msg1.toLowerCase();
	
	// GET TAGGED USER
	if(message.mentions.members.first()){mentioned=message.mentions.members.first();}
	if(message.mentions.channels.first()){channeled=message.mentions.channels.first();}
	
	// REMOVE LETTER CASE (MAKE ALL LOWERCASE)
	command=msg2.split(" ")[0]; command=command.slice(config.cmdPrefix.length);
	
	// GET ARGUMENTS
	args=msg1.split(" ").slice(1); skip="no";
	
	// GET ROLES FROM CONFIG
	let AdminR=guild.roles.find("name", config.adminRoleName); if(!AdminR){ AdminR={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+config.adminRoleName); }
	let ModR=guild.roles.find("name", config.modRoleName); if(!ModR){ ModR={"id":"111111111111111111"}; console.info("[ERROR] [CONFIG] I could not find role: "+config.modRoleName); }
	
	// MAKE SURE ITS A COMMAND
	if(!message.content.startsWith(config.cmdPrefix)){ return }
	
	
// ######################### COMMANDS #############################
	if(command==="commands" || command==="help") {
		if(args[0]==="mods") {
			if(user.roles.has(ModR.id) || user.roles.has(AdminR.id)) {
				cmds="--- ** COMMANDS FOR MODS ** ---\n"
					+"`!stats` \\\u00BB to display server's member stats\n"
					+"`!info` \\\u00BB to display [user/server/bot] info\n"
					+"`!roles` \\\u00BB to assign/manage roles\n"
					+"`!temproles` \\\u00BB to assign/manage TEMPORARY roles\n"
					+"`!warn @mention REASON` \\\u00BB for custom reasons\n"
					+"`!mute @mention REASON` \\\u00BB to mute an user\n"
					+"`!unmute @mention` \\\u00BB to unmute an user\n"
					+"`!kick @mention REASON` \\\u00BB to kick an user\n"
					+"`!ban @mention REASON` \\\u00BB to ban an user\n";
					
					if(config.teamRoles.enabled==="yes"){
						cmds += "`!team <team>` \\\u00BB to assign team roles\n"
							+"`!lvl <##>` \\\u00BB to assign level roles to members\n"
					}
					
					cmds+="*... for Admin commands, type:*\n`!commands admin`";
				return channel.send(cmds).catch(console.error);
			}
			else {
				return message.reply("you are **NOT** allowed to use this command! \ntry using: `!commands` or `!commands devs` instead").catch(console.error); 
			}
		}
		if(args[0]==="admin") {
			if(user.id===config.ownerID || user.roles.has(AdminR.id)) {
				cmds="--- ** COMMANDS FOR ADMINS ** ---\n"
					+"`!settings` \\\u00BB manage bot settings such as:\n"
					+"`invite`, `map`, `raidsmap`, `patreon`, `paypal`, `rules`, `mainchat`, `botchan`, "
					+"`serverevents`, `modlog`, `selflvl`, `teams`";
				return channel.send(cmds).catch(console.error);
			}
			else {
				return message.reply("you are **NOT** allowed to use this command! \ntry using: `!commands` or `!commands devs` or `!commands mods` instead").catch(console.error); 
			}
		}
		
		if(args[0]==="devs") {
			cmds="--- ** COMMANDS FOR DEVs ** ---\n"
				+"`!coverage`/`!zones` \\\u00BB for a map of our **scanned area**\n"
				+"`!hash` \\\u00BB for **hashing** server status link\n"
				+"`!ptc` \\\u00BB for **PokemonTrainersClub** server status link\n"
				+"`!geofence` \\\u00BB for __Jenner__'s **GeoFence Generator**\n"
				+"`!geojson` \\\u00BB Geofence generator - load/save/modify geofence `.json`\n"
				+"`!json2editor` \\\u00BB for __Jenner__'s GeoFence **Formatter**: `.geojson`2`gMap/Editor`\n"
				+"`!json2pa` \\\u00BB for __Jenner__'s GeoFence **Formatter**: `.geojson`2`PokeAlarm`\n"
				+"`!filtergen` \\\u00BB for __Jenner__'s `PA/RM/Monocle` **filter generator**\n"
				+"`!simplebot` \\\u00BB for __Jenner__'s `RM/WebHook` **simple** discord **bot** - in `JavaScript`";
		}
		
		if(!args[0]) {
			cmds="";
			if(config.mapMain.enabled==="yes"){ cmds += "`!map` \\\u00BB for the link to our **Live Web Map**\n" }
			if(config.mapRaids.enabled==="yes"){ cmds += "`!raids` \\\u00BB for the link to our **Raids Web Map**\n" }
			if(config.mapHoods.enabled==="yes"){ cmds += "`!hoods` \\\u00BB for a map with **Neighborhoods**\n" }
			if(config.mapCoverage.enabled==="yes"){ cmds += "`!coverage`/`!zones` \\\u00BB for a map of our **coverage/zones**\n" }
			if(config.discordInvite.enabled==="yes"){ cmds += "`!invite` \\\u00BB for our discord **invite** link\n" }
			if(config.patreon.enabled==="yes"){ cmds += "`!subscribe`/`!patreon` \\\u00BB for a link to our **Patreon** [to subscribe]\n" }
			if(config.paypal.enabled==="yes"){ cmds += "`!donate`/`!paypal` \\\u00BB for a link to our **PayPal** [for extra support]\n" }
			if(config.selfTempRoles.enabled==="yes"){ cmds += "`!tag <days> <role>` \\\u00BB to get temporary role\n" }
			if(config.teamRoles.enabled==="yes"){ cmds += "`!team <team_name>` \\\u00BB to define your team\n" }
			if(config.weather.enabled==="yes"){ cmds += "`!weather <zipcode>` \\\u00BB to check the weather\n" }
			if(config.gif.enabled==="yes"){ cmds += "`!gif <tag_name>` \\\u00BB for random gif/animation\n" }
				cmds += "*... for more commands, type:*\n"
				+"`!commands devs`, `!commands mods`";
		}
		
		
		// USERS CAN ONLY USE THIS COMMAND IN BOT-CMD-CHANNEL
		if(channel.id!==config.botCmdsChannel.channelID){
			if(config.mainChannel.voidHelpCmd==="yes"){
				if(config.botCmdsChannel.warning==="yes"){
					message.reply("this command can **only** be used at <#"+config.botCmdsChannel.channelID+">");
				}
				return
			}
		}
		return channel.send(cmds).catch(console.error);
	}
	
	
	
// ######################### RULES #############################
	if(command==="rules" && config.rulesChannel.enabled==="yes") {
		message.delete();
		if(!mentioned) {
			return channel.send("Please __READ__ our **RULES** at \\\u00BB <#"+config.rulesChannel.channelID+">").catch(console.error);
		} 
		else {
			return channel.send("Hey "+mentioned+", Please __READ__ our **RULES** at \\\u00BB <#"+config.rulesChannel.channelID+"> <(^.^<)").catch(console.error);
		}
		return
	}
	
	
	
// ######################### SUBSCRIPTION #############################
	if(command==="patreon" || command==="subscribe") {
		if(config.patreon.enabled==="yes"){
			let embedMSG={
				'color': 0xFF0000,
				'title': '\u00BB\u00BB Click HERE to Subscribe \u00AB\u00AB',
				'url': config.patreon.url,
				'thumbnail': {'url': config.patreon.img},
				'description': '(>^.^)> .! Thank you !. <(^.^<)\nYour support is greatly appreciated'
			};
			return channel.send({embed: embedMSG}).catch(console.error);
		}
		return
	}
	
	
	
// ######################### DONATE #############################
	if(command==="paypal" || command==="donate") {
		if(config.paypal.enabled==="yes"){
			let embedMSG={
				'color': 0xFF0000,
				'title': '\u00BB\u00BB Click HERE to Donate \u00AB \u00AB',
				'url': config.paypal.url,
				'thumbnail': {'url': config.paypal.img},
				'description': '(>^.^)> .! Thank you !. <(^.^<)\nYour support is greatly appreciated'
			};
			return channel.send({embed: embedMSG}).catch(console.error);
		}
		return
	}
	
	
	
// ######################### TEAM ROLES #############################
	if(command==="team") {
		message.delete();
		if(config.teamRoles.enabled==="yes"){
			
			let imgSrc="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeTeamsTrans/"
			let imgAmt=["_01.png","_02.png","_03.png","_04.png"];
			let teamColor="", daTeamRole="", teamLeadRoles=[];
			let teamSuffix=["🔥","⚡","❄"];			
			
			if(!args[0]){
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!team valor @mention`\n"
						+"`!team instinct @mention`\n"
						+"`!team mystic @mention`"
				};
				return channel.send({embed: embedMSG});
			}
			
			// TEAM VALOR
			if(args[0].startsWith("valor")){
				teamColor=0xFF0000; let teamName="Valor";
				if(config.teamRoles.valor.leadRoleIDs[0]){teamLeadRoles=teamLeadRoles.concat(config.teamRoles.valor.leadRoleIDs)}
				daTeamRole=guild.roles.find("name", teamName);if(!daTeamRole){ return console.info("Team role does not exist") }
				
				// CHECK IF TEAM CHANNEL PRESENT
				if(config.teamRoles.valor.channelID){
					
					// TEAM CHANNEL PRESENT, CHECK IF COMMAND WAS TYPED IN TEAM CHANNEL
					if(channel.id===config.teamRoles.valor.channelID){
						
						// COMMAND TYPED IN CHANNEL, CHECK IF TEAM LEADS ARE DEFINED
						if(config.teamRoles.valor.leadIDs[0]){
							
							// TEAM LEADS FOUND, CHECK IF TEAM LEADS TYPED THE COMMAND
							if(config.teamRoles.valor.leadIDs.some(id=>id.includes(user.id)) || teamLeadRoles.some(id=>user.roles.has(id)) || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
								
								// TEAM LEAD TYPED COMMAND, CHECK IF USER WAS MENTIONED
								if(mentioned){
									mentioned=message.mentions.members.first();
									mentioned.addRole(daTeamRole)
										.then(()=>{
											mentioned.setNickname(mentioned.user.username+teamSuffix[0])
											.catch(err=>{
												channel.send("⚠ Error:\n"+err.message);
												return console.info(err.message)
											})
										})
										.catch(err=>{
											channel.send("⚠ Error:\n"+err.message);
											return console.info(err.message)
										});
									
									let embedMSG={
										'color': teamColor,
										'title': 'Welcome "'+mentioned.user.username+'"!!!',
										'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
										'description': mentioned+' has joined team **'+teamName+'**!\n'
											+'**On**: '+timeStamp(1)+'\n**VerifiedBy**: '+user
									};
									return channel.send({embed: embedMSG}).catch(console.error)
								}
							}
						}
					}
				}
				
				// NO TEAM CHANNEL PRESENT, DEFAULT TO #TEAMS CHANNEL
				if(channel.id===config.teamRoles.channelID){
					
					// CHECK IF TEAM LEADS ARE DEFINED
					if(config.teamRoles.valor.leadIDs[0]){
						
						// TEAM LEADS FOUND, CHECK IF TEAM LEADS TYPED THE COMMAND
						if(config.teamRoles.valor.leadIDs.some(id=>id.includes(user.id)) || teamLeadRoles.some(id=>user.roles.has(id)) || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
							
							// TEAM LEAD TYPED COMMAND, CHECK IF USER WAS MENTIONED
							if(mentioned){
								mentioned=message.mentions.members.first();
								mentioned.addRole(daTeamRole)
									.catch(err=>{
										channel.send("⚠ Error:\n"+err.message);
										return console.info(err.message)
									});
								let embedMSG={
									'color': teamColor,
									'title': 'Welcome "'+mentioned.user.username+'"!!!',
									'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
									'description': mentioned+' has joined team **'+teamName+'**!\n'
										+'**On**: '+timeStamp(1)+'\n**VerifiedBy**: '+user
								};
								return channel.send({embed: embedMSG}).catch(console.error);
							}
						}
					}
					
					// NO TEAM LEAD PRESENT, SELF TEAM ROLE ENABLED
					user.addRole(daTeamRole).catch(console.error);
					let embedMSG={
						'color': teamColor,
						'title': 'Welcome "'+user.user.username+'"!!!',
						'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
						'description': user+' has joined team **'+teamName+'**!\n'
							+'**On**: '+timeStamp(1)
					};
					return channel.send({embed: embedMSG}).catch(console.error);
				}
			}
			
			// TEAM INSTINCT
			if(args[0].startsWith("instinct")){
				teamColor=0xF1C40F; let teamName="Instinct";
				if(config.teamRoles.instinct.leadRoleIDs[0]){teamLeadRoles=teamLeadRoles.concat(config.teamRoles.instinct.leadRoleIDs)}
				daTeamRole=guild.roles.find("name", teamName);if(!daTeamRole){ return console.info("Team role does not exist") }
				
				// CHECK IF TEAM CHANNEL PRESENT
				if(config.teamRoles.instinct.channelID){
					
					// TEAM CHANNEL PRESENT, CHECK IF COMMAND WAS TYPED IN TEAM CHANNEL
					if(channel.id===config.teamRoles.instinct.channelID){
						
						// COMMAND TYPED IN CHANNEL, CHECK IF TEAM LEADS ARE DEFINED
						if(config.teamRoles.instinct.leadIDs[0]){
							
							// TEAM LEADS FOUND, CHECK IF TEAM LEADS TYPED THE COMMAND
							if(config.teamRoles.instinct.leadIDs.some(id=>id.includes(user.id)) || teamLeadRoles.some(id=>user.roles.has(id)) || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
								
								// TEAM LEAD TYPED COMMAND, CHECK IF USER WAS MENTIONED
								if(mentioned){
									mentioned=message.mentions.members.first();
									mentioned.addRole(daTeamRole)
										.then(()=>{
											mentioned.setNickname(mentioned.user.username+teamSuffix[1])
											.catch(err=>{
												channel.send("⚠ Error:\n"+err.message);
												return console.info(err.message)
											})
										})
										.catch(err=>{
											channel.send("⚠ Error:\n"+err.message);
											return console.info(err.message)
										});
									
									let embedMSG={
										'color': teamColor,
										'title': 'Welcome "'+mentioned.user.username+'"!!!',
										'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
										'description': mentioned+' has joined team **'+teamName+'**!\n'
											+'**On**: '+timeStamp(1)+'\n**VerifiedBy**: '+user
									};
									return channel.send({embed: embedMSG}).catch(console.error)
								}
							}
						}
					}
				}
				
				// NO TEAM CHANNEL PRESENT, DEFAULT TO #TEAMS CHANNEL
				if(channel.id===config.teamRoles.channelID){
					
					// CHECK IF TEAM LEADS ARE DEFINED
					if(config.teamRoles.instinct.leadIDs[0]){
						
						// TEAM LEADS FOUND, CHECK IF TEAM LEADS TYPED THE COMMAND
						if(config.teamRoles.instinct.leadIDs.some(id=>id.includes(user.id)) || teamLeadRoles.some(id=>user.roles.has(id)) || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
							
							// TEAM LEAD TYPED COMMAND, CHECK IF USER WAS MENTIONED
							if(mentioned){
								mentioned=message.mentions.members.first();
								mentioned.addRole(daTeamRole)
									.catch(err=>{
										channel.send("⚠ Error:\n"+err.message);
										return console.info(err.message)
									});
								let embedMSG={
									'color': teamColor,
									'title': 'Welcome "'+mentioned.user.username+'"!!!',
									'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
									'description': mentioned+' has joined team **'+teamName+'**!\n'
										+'**On**: '+timeStamp(1)+'\n**VerifiedBy**: '+user
								};
								return channel.send({embed: embedMSG}).catch(console.error);
							}
						}
					}
					
					// NO TEAM LEAD PRESENT, SELF TEAM ROLE ENABLED
					user.addRole(daTeamRole).catch(console.error);
					let embedMSG={
						'color': teamColor,
						'title': 'Welcome "'+user.user.username+'"!!!',
						'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
						'description': user+' has joined team **'+teamName+'**!\n'
							+'**On**: '+timeStamp(1)
					};
					return channel.send({embed: embedMSG}).catch(console.error);
				}
			}
			
			// TEAM MYSTIC
			if(args[0].startsWith("mystic")){
				teamColor=0x2A74F8; let teamName="Mystic";
				if(config.teamRoles.mystic.leadRoleIDs[0]){teamLeadRoles=teamLeadRoles.concat(config.teamRoles.mystic.leadRoleIDs)}
				daTeamRole=guild.roles.find("name", teamName);if(!daTeamRole){ return console.info("Team role does not exist") }
				
				// CHECK IF TEAM CHANNEL PRESENT
				if(config.teamRoles.mystic.channelID){
					
					// TEAM CHANNEL PRESENT, CHECK IF COMMAND WAS TYPED IN TEAM CHANNEL
					if(channel.id===config.teamRoles.mystic.channelID){
						
						// COMMAND TYPED IN CHANNEL, CHECK IF TEAM LEADS ARE DEFINED
						if(config.teamRoles.mystic.leadIDs[0]){
							
							// TEAM LEADS FOUND, CHECK IF TEAM LEADS TYPED THE COMMAND
							if(config.teamRoles.mystic.leadIDs.some(id=>id.includes(user.id)) || teamLeadRoles.some(id=>user.roles.has(id)) || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
								
								// TEAM LEAD TYPED COMMAND, CHECK IF USER WAS MENTIONED
								if(mentioned){
									mentioned=message.mentions.members.first();
									mentioned.addRole(daTeamRole)
										.then(()=>{
											mentioned.setNickname(mentioned.user.username+teamSuffix[2])
											.catch(err=>{
												channel.send("⚠ Error:\n"+err.message);
												return console.info(err.message)
											})
										})
										.catch(err=>{
											channel.send("⚠ Error:\n"+err.message);
											return console.info(err.message)
										});
									
									let embedMSG={
										'color': teamColor,
										'title': 'Welcome "'+mentioned.user.username+'"!!!',
										'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
										'description': mentioned+' has joined team **'+teamName+'**!\n'
											+'**On**: '+timeStamp(1)+'\n**VerifiedBy**: '+user
									};
									return channel.send({embed: embedMSG}).catch(console.error)
								}
							}
						}
					}
				}
				
				// NO TEAM CHANNEL PRESENT, DEFAULT TO #TEAMS CHANNEL
				if(channel.id===config.teamRoles.channelID){
					
					// CHECK IF TEAM LEADS ARE DEFINED
					if(config.teamRoles.mystic.leadIDs[0]){
						
						// TEAM LEADS FOUND, CHECK IF TEAM LEADS TYPED THE COMMAND
						if(config.teamRoles.mystic.leadIDs.some(id=>id.includes(user.id)) || teamLeadRoles.some(id=>user.roles.has(id)) || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
							
							// TEAM LEAD TYPED COMMAND, CHECK IF USER WAS MENTIONED
							if(mentioned){
								mentioned=message.mentions.members.first();
								mentioned.addRole(daTeamRole)
									.catch(err=>{
										channel.send("⚠ Error:\n"+err.message);
										return console.info(err.message)
									});
								let embedMSG={
									'color': teamColor,
									'title': 'Welcome "'+mentioned.user.username+'"!!!',
									'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
									'description': mentioned+' has joined team **'+teamName+'**!\n'
										+'**On**: '+timeStamp(1)+'\n**VerifiedBy**: '+user
								};
								return channel.send({embed: embedMSG}).catch(console.error);
							}
						}
					}
					
					// NO TEAM LEAD PRESENT, SELF TEAM ROLE ENABLED
					user.addRole(daTeamRole).catch(console.error);
					let embedMSG={
						'color': teamColor,
						'title': 'Welcome "'+user.user.username+'"!!!',
						'thumbnail': {'url': imgSrc+teamName+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
						'description': user+' has joined team **'+teamName+'**!\n'
							+'**On**: '+timeStamp(1)
					};
					return channel.send({embed: embedMSG}).catch(console.error);
				}
			}
			
			// REMOVE TEAM ROLE
			if(args[0].startsWith("r")){
				if(mentioned){
					mentioned=message.mentions.members.first();
					let daTeamRoles=["Valor","valor","Instinct","instinct","Mystic","mystic"];
					for(var x="0";x<daTeamRoles.length;x++){
						rRole=guild.roles.find("name", daTeamRoles[x]);
						if(rRole){
							if(mentioned.roles.has(rRole.id)){
								mentioned.removeRole(rRole).catch(console.error);
							}
						}
					}
					return channel.send("✅ "+user+", I've removed `ALL` **team** roles from user: "+mentioned);
				}
			}
		}return
	}
	
	
	
// ############################## LEVEL ROLES COMMAND ##############################
	if(command==="lvl"){
		message.delete();
		let lvlRoleChans=[];
		if(config.teamRoles.channelID){lvlRoleChans.push(config.teamRoles.channelID)}
		if(config.teamRoles.valor.channelID){lvlRoleChans.push(config.teamRoles.valor.channelID)}
		if(config.teamRoles.instinct.channelID){lvlRoleChans.push(config.teamRoles.instinct.channelID)}
		if(config.teamRoles.mystic.channelID){lvlRoleChans.push(config.teamRoles.mystic.channelID)}
		
		let teamLeadRoles=[];
		if(config.teamRoles.valor.leadRoleIDs[0]){teamLeadRoles=teamLeadRoles.concat(config.teamRoles.valor.leadRoleIDs)}
		if(config.teamRoles.instinct.leadRoleIDs[0]){teamLeadRoles=teamLeadRoles.concat(config.teamRoles.instinct.leadRoleIDs)}
		if(config.teamRoles.mystic.leadRoleIDs[0]){teamLeadRoles=teamLeadRoles.concat(config.teamRoles.mystic.leadRoleIDs)}
		
		if(lvlRoleChans.some(chanID=>chanID===channel.id)){
			
			// LEVEL ROLE NAME PREFIX (INCLUDE SPACE OR ":" OR "-")
			let lvlRolesPrefix=config.selfLvlRoles.rolePrefix;
			
			// AVAILABLE LEVEL ROLES
			let lvlRoles=config.selfLvlRoles.lvlRoles;
			
			// VARIABLES
			let newRole=""; let oldRole="";
			
			// ONLY LEADS CAN ASSIGN ROLE
			if(teamLeadRoles.some(id=>user.roles.has(id)) || user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
				if(!parseFloat(args[0])){return channel.send("⚠ **Error**:\n"+user+", second value is not a number")}
				if(!mentioned){return channel.send("⚠ **Error**:\n"+user+", please mention a user!\n`!lvl ## @mention`")}
				
				// REMOVE ANY PREVIOUS LEVEL ROLE
				for(var availbleRole=0;availbleRole<lvlRoles.length;availbleRole++){
					// CHECK FOR ALL LEVEL ROLES SEE IF USER HAS ANY
					oldRole=guild.roles.find("name", lvlRolesPrefix+lvlRoles[availbleRole]);
					
					// OLD ROLE FOUND
					if(oldRole && guild.members.get(mentioned.id).roles.has(oldRole.id)){
						mentioned=message.mentions.members.first();
						// ATTEMPT TO REMOVE OLD ROLE
						mentioned.removeRole(oldRole).then(()=>{
							
							// OLD ROLE REMOVED, NOW ADD NEW ROLE
							newRole=guild.roles.find("name", lvlRolesPrefix+args[0]);
							if(newRole){mentioned.addRole(newRole)}
						}).catch(console.error);
					}
				}
				
				// OLD ROLE WAS NOT FOUND, CHECK IF LEVEL ROLE EXIST WHILE MAKING SURE USER'S INPUT IS JUST DIGIT/NUMBER
				for(var userInput=0;userInput<lvlRoles.length;userInput++){
					if(args[0]===lvlRoles[userInput]){
						newRole=guild.roles.find("name", lvlRolesPrefix+args[0]);
					}
				}
				
				// NEW ROLE IS VALID, ROLE WAS FOUND, ATTEMPT TO ADD IT
				if(newRole){
					mentioned=message.mentions.members.first();
					mentioned.addRole(newRole).catch(console.error);
					return channel.send("🎉 Congratulations to: "+mentioned+"! They are now **Level: "+args[0]+"** 🎉 ")
				}
				
				// PICTURE IS FINE, BUT TEXT MESSAGE IS NOT A NUMBER - COULD BE CHAT - OR ISNOT ONE OF THE VALID NUMBERS... WARN THEM!
				return channel.send("⚠ **Error**:\n"+user+", that's not a **valid** level!\n`"+lvlRoles+"`")
			}
		}return
	}
	
	
	
// ######################### WEATHER #############################
	if(command==="weather") {
		if(config.weather.enabled!=="yes"){ return }
		if(!config.weather.apiKey){
			return console.log(timeStamp(2)+"[ERROR]: Someone used !weather command, but no API key present in config");
		}
		let p, kelToFarMain, kelToFarMin, kelToFarMax, emojiWeather, embedIcon, pokeTypes, windDir="", updatedTime; 
		if(!parseFloat(args[0])){
			return channel.send("⛔ Invalid **zipcode** "+user+", it must be 5 numerical digits!");
		}
		let zipCode=parseFloat(args[0]);
		
		if(zipCode>=config.weather.zipCodeMax || zipCode<=config.weather.zipCodeMin){
			return channel.send("⛔ Invalid **zipcode** "+user+", I **only** accept local zipcodes! Can't check __New York__ or **Japan**!");
		}
		
		let url="http://api.openweathermap.org/data/2.5/weather?zip="+zipCode+"&APPID="+config.weather.apiKey;
		request(url, function(error,response,body){ p=JSON.parse(body); if(p.main===undefined){ return console.info("Location not found") }
			// TEMPERATURE KELVIN TO FAHRENHEIT
			kelToFarMain=parseFloat(p.main.temp); kelToFarMain=Math.round(((kelToFarMain * (9/5)) - 459.67).toString());
			kelToFarMin=parseFloat(p.main.temp_min); kelToFarMin=Math.round(((kelToFarMin * (9/5)) - 459.67).toString());
			kelToFarMax=parseFloat(p.main.temp_max); kelToFarMax=Math.round(((kelToFarMax * (9/5)) - 459.67).toString());

				
			// WEATHER EMOJI
			if(p.weather[0].icon==="01d" || p.weather[0].icon==="01n"){ emojiWeather="☀" }
			if(p.weather[0].icon==="02d" || p.weather[0].icon==="02n"){ emojiWeather="🌤" }
			if(p.weather[0].icon==="03d" || p.weather[0].icon==="03n"){ emojiWeather="🌥" }
			if(p.weather[0].icon==="04d" || p.weather[0].icon==="04n"){ emojiWeather="☁" }
			if(p.weather[0].icon==="09d" || p.weather[0].icon==="09n"){ emojiWeather="🌧" }
			if(p.weather[0].icon==="10d" || p.weather[0].icon==="10n"){ emojiWeather="🌦" }
			if(p.weather[0].icon==="11d" || p.weather[0].icon==="11n"){ emojiWeather="⛈" }
			if(p.weather[0].icon==="13d" || p.weather[0].icon==="13n"){ emojiWeather="🌨" }
			if(p.weather[0].icon==="50d" || p.weather[0].icon==="50n"){ emojiWeather="🌫" }
			
			// POKEMON TYPES EMOJI | EXAMPLE: <:type_water:412651344885710858>
			let type_water="<:type_water:412651344885710858>";
			let type_steel="<:type_steel:412651332852383744>";
			let type_rock="<:type_rock:412651320642764820>";
			let type_psychic="<:type_psychic:412651308139675670>";
			let type_poison="<:type_poison:412651293694361600>";
			let type_normal="<:type_normal:412651278888599553>";
			let type_ice="<:type_ice:412651258306887702>";
			let type_ground="<:type_ground:412651241819078658>";
			let type_grass="<:type_grass:412651227474821130>";
			let type_ghost="<:type_ghost:412651216678420480>";
			let type_flying="<:type_flying:412651204016078860>";
			let type_fire="<:type_fire:412651191814586378>";
			let type_fighting="<:type_fighting:412651180779634688>";
			let type_fairy="<:type_fairy:412651169400225802>";
			let type_electric="<:type_electric:412651156196818947>";
			let type_dragon="<:type_dragon:412651116065587200>";
			let type_dark="<:type_dark:412651082435788800>";
			let type_bug="<:type_bug:412651021240631316>";
			
			// BOOSTED POKEMON TYPES
			if(p.weather[0].icon==="01d" || p.weather[0].icon==="01n"){
				pokeTypes="\n"+type_grass+" Grass, "+type_ground+" Ground, "+type_fire+" Fire";
			}
			if(p.weather[0].icon==="02d" || p.weather[0].icon==="02n" || p.weather[0].icon==="03d" || p.weather[0].icon==="03n"){
				pokeTypes="\n"+type_normal+" Normal, "+type_rock+" Rock";
			}
			if(p.weather[0].icon==="04d" || p.weather[0].icon==="04n"){
				pokeTypes="\n"+type_fairy+" Fairy, "+type_fighting+" Fighting, "+type_poison+" Poison";
			}
			if(p.weather[0].icon==="09d" || p.weather[0].icon==="09n" || p.weather[0].icon==="10d" || p.weather[0].icon==="10n" || p.weather[0].icon==="11d" || p.weather[0].icon==="11n"){
				pokeTypes="\n"+type_water+" Water, "+type_electric+" Electric, "+type_bug+" Bug"; 
			}
			if(p.weather[0].icon==="13d" || p.weather[0].icon==="13n"){
				pokeTypes="\n"+type_ice+" Ice, "+type_steel+" Steel";
			}
			if(p.weather[0].icon==="50d" || p.weather[0].icon==="50n"){
				pokeTypes="\n"+type_dark+" Dark, "+type_ghost+" Ghost";
			}
			
			// EMBED ICON
			if(p.weather[0].icon==="01d"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/dayClear.png"; }
			if(p.weather[0].icon==="01n"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/nightClear.png"; }
				
			if(p.weather[0].icon==="02d" || p.weather[0].icon==="03d"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/dayClouds.png"; }
			if(p.weather[0].icon==="02n" || p.weather[0].icon==="03n"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/nightClouds.png"; }
				
			if(p.weather[0].icon==="04d"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/dayCloudy.png"; }
			if(p.weather[0].icon==="04n"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/nightCloudy.png"; }
				
			if(p.weather[0].icon==="09d" || p.weather[0].icon==="10d" || p.weather[0].icon==="11d"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/dayRain.png"; }
			if(p.weather[0].icon==="09n"|| p.weather[0].icon==="10n" || p.weather[0].icon==="11n"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/nightRain.png"; }
				
			if(p.weather[0].icon==="13d"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/daySnow.png"; }
			if(p.weather[0].icon==="13n"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/nightSnow.png"; }
				
			if(p.weather[0].icon==="50d"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/dayFog.png"; }
			if(p.weather[0].icon==="50n"){ embedIcon="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeWeatherTrans/nightFog.png"; }

			// WIND DIRECTION  from the **"+windDir+"**
			if(p.wind.deg){
				windDir=" from the **"
				if(p.wind.deg>=0 && p.wind.deg<=22){ windDir+="North" } if(p.wind.deg>=23 && p.wind.deg<=67){ windDir+="NE" }
				if(p.wind.deg>=68 && p.wind.deg<=112){ windDir+="East" } if(p.wind.deg>=113 && p.wind.deg<=157){ windDir+="SE" }
				if(p.wind.deg>=158 && p.wind.deg<=202){ windDir+="South" } if(p.wind.deg>=203 && p.wind.deg<=247){ windDir+="SW" }
				if(p.wind.deg>=248 && p.wind.deg<=292){ windDir+="West" } if(p.wind.deg>=293 && p.wind.deg<=337){ windDir+="NW" }
				if(p.wind.deg>=338 && p.wind.deg<=360){ windDir+="North" } windDir+="**"
			}

			// LAST UPDATED TIME
			let date=new Date(p.dt*1000); let hours=date.getHours(); let mer="AM"; if(hours > 12){ hours=hours - 12; let mer="PM";}
			let min=0 + date.getMinutes(); let sec=0 + date.getSeconds(); updatedTime=hours+":"+min+":"+sec+" "+mer;
			
			if(p.weather[0].main==="Clouds"){ p.weather[0].main="Partly Cloudy"; }
			embedMSG={
				'color': 0x00FF00,
				'title': emojiWeather+' '+p.name+': '+kelToFarMain+'°F '+emojiWeather,
				'thumbnail': {'url': embedIcon},
				'description': ""
					+"**"+p.weather[0].main+"**! `↑`**"+kelToFarMax+"°F**, `↓`**"+kelToFarMin+"°F**\n"
					+"__Humidity__ at **"+p.main.humidity+"%**,\n"
					+"__Wind__: **"+Math.round(Math.round(p.wind.speed * 2.997446 * 100) / 100)+"** mph "
					+windDir+"\n**Boosted Types**: "+pokeTypes,
				'footer': {	'text': '» Last update at: '+updatedTime }
			};
			channel.send({embed: embedMSG})
		});

	}
	
	
	// giphy 
	if(command==="gif"){
		if(config.gif.enabled==="yes"){
			if(!config.gif.apiKey){
				return console.log(timeStamp(2)+"[ERROR]: Someone used [!gif] command, but no API key present in config");
			}
			if(!args[0]){
				return message.reply("what would you like me to look for?");
			}
			let gifQuery;if(message.content.indexOf(" ")===-1){return}
			else{gifQuery=message.content.slice(message.content.indexOf(" "));gifQuery=gifQuery.trim();gifQuery=gifQuery.trim();}
			gifQuery=gifQuery.replace(/ /g,"-");
			let url="http://api.giphy.com/v1/gifs/random?api_key="+config.gif.apiKey+"&tag="+gifQuery;
			request(url,
				function(error,response,body){
					try{ p=JSON.parse(body) }
					catch(err){channel.send("Error while reading json (website)!\n`"+err+"`\n...maype API key expired or offline?");
						return console.info("Error reading json!\n"+err)
					}
					if(p.data.image_url===undefined){ console.info(p); return message.reply("I found nothing with that tag") }
					channel.send(p.data.image_url);
				}
			);
		}
	}
	
	
	
// ############################## USER TEMPORARY ROLES ##############################
	if(command.startsWith("tag")){
		if(message.mentions.members){mentioned=message.mentions.members.first()}
		// CREATE DATABASE TABLE 
		sql.run("CREATE TABLE IF NOT EXISTS selfTemp_roles (userID TEXT, temporaryRole TEXT, startDate TEXT, endDate TEXT)").catch(console.error);
		// message.delete();
		let dateMultiplier=86400000; 
		if(!args[0]){
			embedMSG={
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "`!tag check`\n"
					+"`!tag remove <role_name>`\n"
					+"`!tag <number_days> <role_name>`\n"
					+"» **Staff** can use `@mention`"
			};
			return channel.send({embed: embedMSG});
		}
		
		if(config.selfTempRoles.channelID && channel.id!==config.selfTempRoles.channelID){
			return message.reply("not the place to tag yourself! You should try: <#"+config.selfTempRoles.channelID+">")
		}
		
		// SELF CHECK/ADD/REMOVE
		if(!mentioned){
			// CHECK DATABASE FOR ROLES
			if(args[0]==="check"){
				sql.all(`SELECT * FROM selfTemp_roles WHERE userID="${user.id}"`).then(rows => {
					if (!rows[0]) {
						return channel.send("⚠ "+user+", you are **NOT** in my `DataBase`! ");
					}
					else {
						let daRolesFindings="✅ "+user+"'s TempTag(s):\n";
						for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
							let startDateVal=new Date(); startDateVal.setTime(rows[rowNumber].startDate);
							startDateVal=(startDateVal.getMonth()+1)+"/"+startDateVal.getDate()+"/"+startDateVal.getFullYear();
							let endDateVal=new Date(); endDateVal.setTime(rows[rowNumber].endDate);
							finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
							daRolesFindings+="**"+rows[rowNumber].temporaryRole+"**, ends:`"+finalDate+"`\n";
						}
						return channel.send(daRolesFindings)
					}
				}).catch(console.error); return
			}
			// REMOVE MEMBER FROM DATABASE
			if(args[0]==="remove"){
				// ROLES WITH SPACES - NEW
				let daRoles="";if(!args[2]){daRoles=args[1]}else{daRoles="";for(var x=1;x<args.length;x++){daRoles+=args[x]+" ";}daRoles=daRoles.slice(0,-1);}
				
				sql.get(`SELECT * FROM selfTemp_roles WHERE userID="${user.id}" AND temporaryRole="${daRoles}"`).then(row => {
					if(!row){
						return message.reply("⚠ [ERROR] "+user+", you are __NOT__ in my `DataBase`");
					}
					else {
						let theirRole=guild.roles.find('name', row.temporaryRole);
						if(user.roles.has(theirRole.id)){user.removeRole(theirRole).catch(console.error);}
						sql.get(`DELETE FROM selfTemp_roles WHERE userID="${user.id}" AND temporaryRole="${daRoles}"`).then(row => {
							return channel.send("⚠ "+user+", you have **lost** your temporary tag: **"+theirRole.name+"** 😅");
						});
					}
				}).catch(console.error); return
			}
			if(!parseFloat(args[0])){return message.reply("invalid syntax!\n ⚠ Second value needs to be a `number` of days!\n __EXAMPLE__ » `!tag 30 VIP`")}
			if(parseFloat(args[0])){
				if(!config.selfTempRoles.tempRoleIDs[0]){return message.reply("no tags defined in config yet")}
				let tagsAllowed=config.selfTempRoles.tempRoleIDs
				let daRoles="";if(!args[2]){daRoles=args[1]}else{daRoles="";for(var x=1;x<args.length;x++){daRoles+=args[x]+" ";}daRoles=daRoles.slice(0,-1);}
				
				// CHECK ROLE EXIST
				let rName=guild.roles.find('name', daRoles);
				if(!rName){
					return message.reply("I couldn't find such role in the server... check `pinned` messages or ask **staff** to add it!");
				}
				
				// CHECK TAG MATCHES ALLOWED TAGS
				if(!tagsAllowed.some(tagId=>tagId.includes(rName.id))){
					return message.reply("this **tag** is __NOT__ allowed... please make sure you read `pinned` messages to see which tags are **ALLOWED**!");
				}
				// ADD MEMBER TO DATASE, AND ADD THE ROLE TO MEMBER
				sql.get(`SELECT * FROM selfTemp_roles WHERE userID="${user.id}" AND temporaryRole="${daRoles}"`).then(row => {
					if (!row) {
						let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
						let finalDate=((args[0])*(dateMultiplier)); finalDate=((curDate)+(finalDate));
						finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
						
						sql.run("INSERT INTO selfTemp_roles (userID, temporaryRole, startDate, endDate) VALUES (?, ?, ?, ?)", 
							[user.id, daRoles, curDate, finalDate]);
						let theirRole=guild.roles.find('name', daRoles);
						user.addRole(theirRole).catch(console.error);
						console.log(timeStamp(2)+"[ADMIN] [TEMPORARY-TAG] \""+user.user.username+"\" ("+user.id+") was given tag: \""+daRoles+"\"");
						return channel.send("🎉 "+user+", you been given a **temporary** tag: **"+daRoles+"**, enjoy! You will lose this **tag** on: `"+finalDateDisplay+"`");
					}
					else {
						return message.reply("you already have this **temporary** tag... try using `!temprole remove "+daRoles+"` if you want to **change** the endDate.");
					}
				}).catch(console.error);
			}
		}
		
		if(message.mentions){mentioned=message.mentions.members.first()}
		// CHECK OTHERS - ADMINS
		if(mentioned){
			if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
				// CHECK DATABASE FOR ROLES
				if(args[0]==="check"){
					sql.all(`SELECT * FROM selfTemp_roles WHERE userID="${mentioned.id}"`).then(rows => {
						if (!rows[0]) {
							return channel.send("⚠ "+mentioned+" is **NOT** in my `DataBase`, "+user);
						}
						else {
							let daRolesFindings="✅ "+mentioned+"'s TempTag(s):\n";
							for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
								let startDateVal=new Date(); startDateVal.setTime(rows[rowNumber].startDate);
								startDateVal=(startDateVal.getMonth()+1)+"/"+startDateVal.getDate()+"/"+startDateVal.getFullYear();
								let endDateVal=new Date(); endDateVal.setTime(rows[rowNumber].endDate);
								finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
								daRolesFindings+="**"+rows[rowNumber].temporaryRole+"**, ends:`"+finalDate+"`, added:`"+startDateVal+"`\n";
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
					
					sql.get(`SELECT * FROM selfTemp_roles WHERE userID="${mentioned.id}" AND temporaryRole="${daRoles}"`).then(row => {
						if(!row){
							return message.reply("⚠ [ERROR] "+mentioned+" is __NOT__ in my `DataBase`");
						}
						else {
							let theirRole=guild.roles.find('name', row.temporaryRole);
							if(mentioned.roles.has(theirRole.id)){mentioned.removeRole(theirRole).catch(console.error);}
							sql.get(`DELETE FROM selfTemp_roles WHERE userID="${mentioned.id}" AND temporaryRole="${daRoles}"`).then(row => {
								return channel.send("⚠ "+mentioned+" have **lost** their temporary tag: **"+theirRole.name+"** 😅");
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
					return message.reply("[ERROR]: second value has to be **X** number of days, IE:\n`!"+command+" @"+mentioned.user.username+" 90 "+daRoles+"`");
				}
				
				// CHECK ROLE EXIST
				let rName=guild.roles.find('name', daRoles);
				if(!rName){
					return message.reply("I couldn't find such role, please try searching for it first: `!roles search <ROLE-NAME>`");
				}
				
				// ADD MEMBER TO DATASE, AND ADD THE ROLE TO MEMBER
				sql.get(`SELECT * FROM selfTemp_roles WHERE userID="${mentioned.id}" AND temporaryRole="${daRoles}"`).then(row => {
					mentioned=message.mentions.members.first(); 
					if (!row) {
						let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
						let finalDate=((args[1])*(dateMultiplier)); finalDate=((curDate)+(finalDate));
						finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
						
						sql.run("INSERT INTO selfTemp_roles (userID, temporaryRole, startDate, endDate) VALUES (?, ?, ?, ?)", 
							[mentioned.id, daRoles, curDate, finalDate]);
						let theirRole=guild.roles.find('name', daRoles);
						mentioned.addRole(theirRole).catch(console.error);
						console.log(timeStamp(2)+"[ADMIN] [TEMPORARY-TAG] \""+mentioned.user.username+"\" ("+mentioned.id+") was given tag: \""+daRoles+"\"");
						return channel.send("🎉 "+mentioned+" has been given a **temporary** role of: **"+daRoles+"**, enjoy! They will lose this role on: `"+finalDateDisplay+"`");
					}
					else {
						return message.reply("this user already has this **temporary** role... try using `!temprole remove @"+mentioned.user.username+" "+daRoles+"` if you want to **change** their role.");
					}
				}).catch(console.error);
			}
		}
	}
	
	
	
// ######################### SERVER STATUS #############################
	if(command==="hash") {
		return channel.send("Hashing Server Status: https://status.buddyauth.com/ ").catch(console.error);
	}
	if(command==="ptc") {
		return channel.send("PokemonTrainerClub Server Status: http://cmmcd.com/PokemonTrainerClub/ ").catch(console.error);
	}
	
// ######################### OTHER LINKS #############################
	if(command==="map" && config.mapMain.enabled==="yes") {
		return channel.send("Our official **webmap**: \n"+config.mapMain.url).catch(console.error)
	}
	if(command==="raids" || command==="raidmap" || command==="raid") {
		if(config.mapRaids.enabled==="yes"){
			return channel.send("Our official **raids webmap**: \n"+config.mapRaids.url).catch(console.error)
		}
	}
	if(command==="coverage" && config.mapCoverage.enabled==="yes") {
		return channel.send("Map of **coverage** area: \n"+config.mapCoverage.url+"\n"
			+"...and for Zones/Systems map: `!zones`").catch(console.error)
	}
	if(command==="zones" && config.mapZones.enabled==="yes") {
		return channel.send("Map of the **Zones** and Servers: \n "+config.mapZones.url+" \n"
			+"...and for Coverage map: `!coverage`").catch(console.error)
	}
	if(command==="hoods" || command==="neighborhoods") {
		if(config.mapHoods.enabled==="yes"){
			return channel.send("Our **Neighborhoods**:\n"+config.mapHoods.url).catch(console.error);
		}
	}
	if(command==="invite" && config.discordInvite.enabled==="yes") {
		return channel.send("``` https://discord.gg/"+config.discordInvite.code+" ```").catch(console.error)
	}
	
	
// ######################### JENNER DEV LINKS #############################
	if(command==="geofence") {
		return channel.send("__Jenner__'s **Geofence Generator**: \n https://jennerpalacios.github.io/geofenceFormatter/GeofenceGen ").catch(console.error);
	}
	if(command==="geoformat") {
		return channel.send("__Jenner__'s  Geofence **Formatter**: \n https://jennerpalacios.github.io/geofenceFormatter/geoFormatter ").catch(console.error);
	}
	if(command==="json2editor") {
		return channel.send("__Jenner__'s  **GeoJsOn** to **gMap**`editor` Formatter: \n https://jennerpalacios.github.io/geofenceFormatter/GeoJson2GMapEditor ").catch(console.error);
	}
	if(command==="json2pa") {
		return channel.send("__Jenner__'s  **GeoJsOn** to **PokeAlarm** Formatter: \n https://jennerpalacios.github.io/geofenceFormatter/GeoJson2PokeAlarm ").catch(console.error);
	}
	if(command==="geojson") {
		return channel.send("Load/Save/Modify **GeoJsOn**, Geofence: \n http://geojson.io/#map=14/47.6089/-122.3393 ").catch(console.error);
	}
	if(command==="filtergen") {
		return channel.send("__Jenner__'s **IvFilter Generator:** \n https://jennerpalacios.github.io/Poke-IV-Filter/ ").catch(console.error);
	}
	if(command==="rm") {
		return channel.send("Scanning Software: **RocketMaps**: \n https://rocketmap.readthedocs.io/en/develop/index.html ").catch(console.error);
	}
	if(command==="monocle") {
		return channel.send("Scanning Software: **Monocle**: \n https://github.com/Noctem/Monocle/wiki ").catch(console.error);
	}
	if(command==="pa") {
		return channel.send("Webhooks for RocketMaps **PokeAlarm**: \n https://github.com/RocketMap/PokeAlarm ").catch(console.error);
	}
	if(command==="simplebot") {
		return channel.send("RocketMaps **SimpleBot** (by me): https://github.com/JennerPalacios/RocketMaps-Simple-Bot ").catch(console.error);
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
			
			// CONFIGURATION FILE
			let configFile=JSON.parse(fs.readFileSync("./config/config.json", "utf8"));
			
			
			// AVAILABLE SETTINGS
			if(!args[0]){
				embedMSG={
					"color": 0x00FF00,
					"title": "📋 __--- AVAILABLE  SETTINGS ---__ 📋",
					"description": "*Type: `!settings <COMMAND>` for their available settings/options...*\n"
						+"**COMMANDS**:\n"
						+"`invite`, `map`, `raidsmap`, `patreon`, `paypal`, `rules`, `mainchat`, `botchan`, "
						+"`serverevents`, `modlog`, `selflvl`, `teams`"
				};
				return channel.send({embed: embedMSG});
			}
			
			
			
			// DISCORD INVITE LINK
			if(args[0]==="invite"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [discordInvite] settings 🗒",
						"description": "Enabled: `\""+config.discordInvite.enabled+"\"`\n"
							+"Code: `\""+config.discordInvite.code+"\"`"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.discordInvite.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.discordInvite.enabled="yes"; return channel.send("✅ I have **enabled** public discordInvite link")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.discordInvite.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.discordInvite.enabled="no"; return channel.send("⚠ I have **disabled** public discordInvite link")
				}
				if(args[1]==="code"){
					// SAVE CONFIGURATION TO FILE
					configFile.discordInvite.code=args[2];fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.discordInvite.code=args[2]; return channel.send("✅ I have **set** [`discordInvite`] to: `"+args[2]+"`")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set invite check`\n"
							+"`!set invite <on/off>`\n"
							+"`!set invite code <code>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// WEBMAP
			if(args[0]==="map"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [mapMain] settings 🗒",
						"description": "Enabled: `\""+config.mapMain.enabled+"\"`\n"
							+"Url: `\""+config.mapMain.url+"\"`"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.mapMain.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mapMain.enabled="yes"; return channel.send("✅ I have **enabled** the webmap link")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.mapMain.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mapMain.enabled="no"; return channel.send("⚠ I have **disabled** the webmap link")
				}
				if(args[1]==="url"){
					// SAVE CONFIGURATION TO FILE
					configFile.mapMain.url=args[2];fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mapMain.url=args[2]; return channel.send("✅ I have **set** [`mapMain.url`] to: `"+args[2]+"`")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set map check`\n"
							+"`!set map <on/off>`\n"
							+"`!set map url <url>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// RAIDSMAP
			if(args[0]==="raidsmap"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [mapRaids] settings 🗒",
						"description": "Enabled: `\""+config.mapRaids.enabled+"\"`\n"
							+"Url: `\""+config.mapRaids.url+"\"`"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.mapRaids.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mapRaids.enabled="yes"; return channel.send("✅ I have **enabled** the raids webmap link")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.mapRaids.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mapRaids.enabled="no"; return channel.send("⚠ I have **disabled** the raids webmap link")
				}
				if(args[1]==="url"){
					// SAVE CONFIGURATION TO FILE
					configFile.mapRaids.url=args[2];fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mapRaids.url=args[2]; return channel.send("✅ I have **set** [`mapRaids.url`] to: `"+args[2]+"`")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set raidsmap check`\n"
							+"`!set raidsmap <on/off>`\n"
							+"`!set raidsmap url <url>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// MAPS COVERAGE
			if(args[0]==="patreon"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [patreon] settings 🗒",
						"description": "Enabled: `\""+config.patreon.enabled+"\"`\n"
							+"Url: `\""+config.patreon.url+"\"`\n"
							+"Image: `\""+config.patreon.img+"\"`"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.patreon.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.patreon.enabled="yes"; return channel.send("✅ I have **enabled** the Patreon link")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.patreon.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.patreon.enabled="no"; return channel.send("⚠ I have **disabled** the Patreon link")
				}
				if(args[1]==="url"){
					// SAVE CONFIGURATION TO FILE
					configFile.patreon.url=args[2];fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.patreon.url=args[2]; return channel.send("✅ I have **set** [`patreon.url`] to: `"+args[2]+"`")
				}
				if(args[1]==="img"){
					// SAVE CONFIGURATION TO FILE
					configFile.patreon.img=args[2];fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.patreon.img=args[2]; return channel.send("✅ I have **set** [`patreon.img`] to: `"+args[2]+"`")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set patreon check`\n"
							+"`!set patreon <on/off>`\n"
							+"`!set patreon url <url>`\n"
							+"`!set patreon img <url>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// MAPS COVERAGE
			if(args[0]==="paypal"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [paypal] settings 🗒",
						"description": "Enabled: `\""+config.paypal.enabled+"\"`\n"
							+"Url: `\""+config.paypal.url+"\"`\n"
							+"Image: `\""+config.paypal.img+"\"`"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.paypal.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.paypal.enabled="yes"; return channel.send("✅ I have **enabled** the paypal link")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.paypal.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.paypal.enabled="no"; return channel.send("⚠ I have **disabled** the paypal link")
				}
				if(args[1]==="url"){
					// SAVE CONFIGURATION TO FILE
					configFile.paypal.url=args[2];fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.paypal.url=args[2]; return channel.send("✅ I have **set** [`paypal.url`] to: `"+args[2]+"`")
				}
				if(args[1]==="img"){
					// SAVE CONFIGURATION TO FILE
					configFile.paypal.img=args[2];fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.paypal.img=args[2]; return channel.send("✅ I have **set** [`paypal.img`] to: `"+args[2]+"`")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set paypal check`\n"
							+"`!set paypal <on/off>`\n"
							+"`!set paypal url <url>`\n"
							+"`!set paypal img <url>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="rules"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [rulesChannel] settings 🗒",
						"description": "Enabled: `\""+config.rulesChannel.enabled+"\"`\n"
							+"Channel: <#"+config.rulesChannel.channelID+">"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.rulesChannel.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.rulesChannel.enabled="yes"; return channel.send("✅ I have **enabled** rules channel: <#"+config.rulesChannel.channelID+">")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.rulesChannel.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.rulesChannel.enabled="no"; return channel.send("⚠ I have **disabled** rules channel")
				}
				if(args[1]==="channel"){
					// SAVE CONFIGURATION TO FILE
					configFile.rulesChannel.channelID=""+channeled.id+"";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.rulesChannel.channelID=channeled.id; return channel.send("✅ I have **set** rules[`channelID`] to: `"+channeled.id+"` ("+channeled+")")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set rules check`\n"
							+"`!set rules <on/off>`\n"
							+"`!set rules channel <#channel>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="mainchat"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [mainChannel] settings 🗒",
						"description": "Enabled: `\""+config.mainChannel.enabled+"\"`\n"
							+"VoidHelpCmds: `\""+config.mainChannel.voidHelpCmd+"\"`\n"
							+"Channel: <#"+config.mainChannel.channelID+">"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.mainChannel.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mainChannel.enabled="yes"; return channel.send("✅ I have **enabled** main-chat channel: <#"+config.mainChannel.channelID+">")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.mainChannel.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mainChannel.enabled="no"; return channel.send("⚠ I have **disabled** main-chat channel")
				}
				if(args[1]==="voidhelp" && args[2]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.mainChannel.voidHelpCmd="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mainChannel.voidHelpCmd="yes"; return channel.send("✅ I have **enabled** the use of `!commands/help` command, in main-chat channel: <#"+config.mainChannel.channelID+">")
				}
				if(args[1]==="voidhelp" && args[2]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.mainChannel.voidHelpCmd="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mainChannel.voidHelpCmd="no"; return channel.send("⚠ I have **disabled** the use of `!commands/help` command in main-chat channel")
				}
				if(args[1]==="channel"){
					// SAVE CONFIGURATION TO FILE
					configFile.mainChannel.channelID=""+channeled.id+"";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.mainChannel.channelID=channeled.id; return channel.send("✅ I have **set** main-chat [`channelID`] to: `"+channeled.id+"` ("+channeled+")")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set mainchat check`\n"
							+"`!set mainchat <on/off>` for avoid spam\n"
							+"`!set mainchat voidhelp <on/off>` » avoid help cmd\n"
							+"`!set mainchat channel <#channel>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="botchan"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [botCmdsChannel] settings 🗒",
						"description": "Enabled: `\""+config.botCmdsChannel.enabled+"\"`\n"
							+"WarningIfExclusive: `\""+config.botCmdsChannel.warning+"\"`\n"
							+"ForChannelOnly: <#"+config.botCmdsChannel.channelID+">"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.botCmdsChannel.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.botCmdsChannel.enabled="yes"; return channel.send("✅ I have **enabled** bot-commands channel: <#"+config.botCmdsChannel.channelID+"> for exclusive commands, such as `!commands/help`")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.botCmdsChannel.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.botCmdsChannel.enabled="no"; return channel.send("⚠ I have **disabled** bot-commands channel")
				}
				if(args[1]==="warning" && args[2]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.botCmdsChannel.warning="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.botCmdsChannel.warning="yes"; return channel.send("✅ I have **enabled** warnings when exclusive commands are used outside <#"+config.botCmdsChannel.channelID+">")
				}
				if(args[1]==="warning" && args[2]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.botCmdsChannel.warning="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.botCmdsChannel.warning="no"; return channel.send("⚠ I have **disabled** warnings for exclusive commands")
				}
				if(args[1]==="channel"){
					// SAVE CONFIGURATION TO FILE
					configFile.botCmdsChannel.channelID=""+channeled.id+"";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.botCmdsChannel.channelID=channeled.id; return channel.send("✅ I have **set** bot-commands [`channelID`] to: `"+channeled.id+"` ("+channeled+")")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set botchan check`\n"
							+"`!set botchan <on/off>` for spammy cmds\n"
							+"`!set botchan warning <on/off>` void in mainchat\n"
							+"`!set botchan channel <#channel>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="serverevents"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [serverEvents] settings 🗒",
						"description": "Enabled: `\""+config.serverEvents.enabled+"\"`\n"
							+"Channel: <#"+config.serverEvents.channelID+">\n"
							+"JoinEvents: `\""+config.serverEvents.joinEvents+"\"`\n"
							+"JoinRandomizer: `\""+config.serverEvents.joinRandom+"\"`\n"
							+"RoleEvents: `\""+config.serverEvents.roleEvents+"\"`"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.enabled="yes"; return channel.send("✅ I have **enabled** server events in channel: <#"+config.serverEvents.channelID+">")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.enabled="no"; return channel.send("⚠ I have **disabled** server events")
				}
				
				// ROLE EVENTS
				if(args[1]==="roles" && args[2]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.roleEvents="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.roleEvents="yes"; return channel.send("✅ I have **enabled** role events in channel: <#"+config.serverEvents.channelID+">")
				}
				if(args[1]==="roles" && args[2]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.roleEvents="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.roleEvents="no"; return channel.send("⚠ I have **disabled** role events")
				}
				
				//
				// JOIN EVENTS
				//
				if(args[1]==="join" && args[2]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.joinEvents="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.joinEvents="yes"; return channel.send("✅ I have **enabled** join events in channel <#"+config.serverEvents.channelID+">")
				}
				if(args[1]==="join" && args[2]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.joinEvents="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.joinEvents="no"; return channel.send("⚠ I have **disabled** join events")
				}
				if(args[1]==="join" && args[2]==="random" && args[3]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.joinRandom="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.joinRandom="yes"; return channel.send("✅ I have **enabled** join event **randomizer** in channel <#"+config.serverEvents.channelID+">")
				}
				if(args[1]==="join" && args[2]==="random" && args[3]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.joinRandom="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.joinRandom="no"; return channel.send("⚠ I have **disabled** join event **randomizer**")
				}
				
				if(args[1]==="channel"){
					// SAVE CONFIGURATION TO FILE
					configFile.serverEvents.channelID=""+channeled.id+"";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.serverEvents.channelID=channeled.id; return channel.send("✅ I have **set** ServerEvents[`channelID`] to: `"+channeled.id+"` ("+channeled+")")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set serverevents check`\n"
							+"`!set serverevents <on/off>`\n"
							+"`!set serverevents channel <#channel>`\n"
							+"`!set serverevents join <on/off>`\n"
							+"`!set serverevents join random <on/off>`\n"
							+"`!set serverevents roles <on/off>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="modlog"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [modLogChannel] settings 🗒",
						"description": "Enabled: `\""+config.modLogChannel.enabled+"\"`\n"
							+"Channel: <#"+config.modLogChannel.channelID+">\n"
							+"MuteEvents: `\""+config.modLogChannel.muteEvents+"\"`\n"
							+"KickEvents: `\""+config.modLogChannel.kickEvents+"\"`\n"
							+"BanEvents: `\""+config.modLogChannel.banEvents+"\"`"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.enabled="yes"; return channel.send("✅ I have **enabled** [mod-logs] channel: <#"+config.modLogChannel.channelID+">")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.enabled="no"; return channel.send("⚠ I have **disabled** [mod-logs] channel")
				}
				
				//
				// MUTE EVENTS
				//
				if(args[1]==="mute" && args[2]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.muteEvents="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.muteEvents="yes"; return channel.send("✅ I have **enabled** mute events in channel <#"+config.modLogChannel.channelID+">")
				}
				if(args[1]==="mute" && args[2]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.muteEvents="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.muteEvents="no"; return channel.send("⚠ I have **disabled** mute events")
				}
				
				//
				// KICK EVENTS
				//
				if(args[1]==="kick" && args[2]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.kickEvents="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.kickEvents="yes"; return channel.send("✅ I have **enabled** kick events in channel <#"+config.modLogChannel.channelID+">")
				}
				if(args[1]==="kick" && args[2]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.kickEvents="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.kickEvents="no"; return channel.send("⚠ I have **disabled** kick events")
				}
				
				//
				// BAN EVENTS
				//
				if(args[1]==="ban" && args[2]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.banEvents="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.banEvents="yes"; return channel.send("✅ I have **enabled** ban events in channel <#"+config.modLogChannel.channelID+">")
				}
				if(args[1]==="ban" && args[2]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.banEvents="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.banEvents="no"; return channel.send("⚠ I have **disabled** ban events")
				}
				
				if(args[1]==="channel"){
					// SAVE CONFIGURATION TO FILE
					configFile.modLogChannel.channelID=""+channeled.id+"";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.modLogChannel.channelID=channeled.id; return channel.send("✅ I have **set** ban-events[`channelID`] to: `"+channeled.id+"` ("+channeled+")")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set modlog check`\n"
							+"`!set modlog <on/off>`\n"
							+"`!set modlog channel <#channel>`\n"
							+"`!set modlog mute <on/off>`\n"
							+"`!set modlog kick <on/off>`\n"
							+"`!set modlog ban <on/off>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="selflvl"){
				if(args[1]==="check"){
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [selfLevelRoles] settings 🗒",
						"description": "Enabled: `\""+config.selfLvlRoles.enabled+"\"`\n"
							+"RolePrefix: `\""+config.selfLvlRoles.rolePrefix+"\"`\n"
							+"Channel: <#"+config.selfLvlRoles.channelID+">"
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.selfLvlRoles.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.selfLvlRoles.enabled="yes"; return channel.send("✅ I have **enabled** user-assigned levelRoles for channel: <#"+config.selfLvlRoles.channelID+">")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.selfLvlRoles.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.selfLvlRoles.enabled="no"; return channel.send("⚠ I have **disabled** user-assigned levelRoles")
				}
				if(args[1]==="channel"){
					// SAVE CONFIGURATION TO FILE
					configFile.selfLvlRoles.channelID=""+channeled.id+"";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.selfLvlRoles.channelID=channeled.id; return channel.send("✅ I have **set** levelRoles[`channelID`] to: `"+channeled.id+"` ("+channeled+")")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set selflvl check`\n"
							+"`!set selflvl <on/off>`\n"
							+"`!set selflvl channel <#channel>`"
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			// USER ASSIGNED LEVEL-ROLES
			if(args[0]==="teams"){
				let valorTeam="Valor: `self-assigned`"; let instinctTeam="Instinct: `self-assigned`"; let mysticTeam="Mystic: `self-assigned`";
				let valorLeads=""; let instinctLeads=""; let mysticLeads="";
				let valorLeadRoles=""; let instinctLeadRoles=""; let mysticLeadRoles="";
				if(args[1]==="check"){
					
					if(config.teamRoles.valor.leadIDs && config.teamRoles.valor.channelID){
						if(config.teamRoles.valor.leadRoleIDs){
							valorLeadRoles+="\n » or anyone with role(s): ";
							config.teamRoles.valor.leadRoleIDs.some(n=>{ valorLeadRoles+="<@&"+n+">, " });
						}
						config.teamRoles.valor.leadIDs.some(n=>{ valorLeads+="<@"+n+">, " });
						valorTeam="..-- Valor --..\n » valorChannel: <#"+config.teamRoles.valor.channelID+">"
							+"\n » valorLeads (`"+config.teamRoles.valor.leadIDs.length+"`): "+valorLeads.slice(0,-2)+valorLeadRoles.slice(0,-2);
					}
					if(config.teamRoles.instinct.leadIDs && config.teamRoles.instinct.channelID){
						if(config.teamRoles.instinct.leadRoleIDs){
							instinctLeadRoles+="\n » or anyone with role(s): ";
							config.teamRoles.instinct.leadRoleIDs.some(n=>{ instinctLeadRoles+="<@&"+n+">, " });
						}
						config.teamRoles.instinct.leadIDs.some(n=>{ instinctLeads+="<@"+n+">, " });
						instinctTeam="..-- Instinct --..\n » instinctChannel: <#"+config.teamRoles.instinct.channelID+">"
							+"\n » instinctLeads (`"+config.teamRoles.instinct.leadIDs.length+"`): "+instinctLeads.slice(0,-2)+instinctLeadRoles.slice(0,-2);
					}
					if(config.teamRoles.mystic.leadIDs && config.teamRoles.mystic.channelID){
						if(config.teamRoles.mystic.leadRoleIDs){
							mysticLeadRoles+="\n » or anyone with role(s): ";
							config.teamRoles.mystic.leadRoleIDs.some(n=>{ mysticLeadRoles+="<@&"+n+">, " });
						}
						config.teamRoles.mystic.leadIDs.some(n=>{ mysticLeads+="<@"+n+">, " });
						mysticTeam="..-- Mystic --..\n » mysticChannel: <#"+config.teamRoles.mystic.channelID+">"
							+"\n » mysticLeads (`"+config.teamRoles.mystic.leadIDs.length+"`): "+mysticLeads.slice(0,-2)+mysticLeadRoles.slice(0,-2);
					}
					embedMSG={
						"color": 0x00FF00,
						"title": "📝 [teamRoles] settings 🗒",
						"description": "Enabled: `\""+config.teamRoles.enabled+"\"`\n"
							+"Channel: <#"+config.teamRoles.channelID+">\n"
							+valorTeam+"\n"+instinctTeam+"\n"+mysticTeam
					};
					return channel.send({embed: embedMSG});
				}
				if(args[1]==="on"){
					// SAVE CONFIGURATION TO FILE
					configFile.teamRoles.enabled="yes";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.teamRoles.enabled="yes"; return channel.send("✅ I have **enabled** user-assigned teamRoles for channel: <#"+config.teamRoles.channelID+">")
				}
				if(args[1]==="off"){
					// SAVE CONFIGURATION TO FILE
					configFile.teamRoles.enabled="no";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.teamRoles.enabled="no"; return channel.send("⚠ I have **disabled** user-assigned teamRoles")
				}
				if(args[1]==="channel"){
					// SAVE CONFIGURATION TO FILE
					configFile.teamRoles.channelID=""+channeled.id+"";fs.writeFile("./config/config.json",JSON.stringify(configFile,null,4),"utf8",function(err){if(err)throw err;});
					
					// CHANGE SETTING WITHIN SCRIPT WITHOUT RESTARTING BOT OR SCRIPT
					config.teamRoles.channelID=channeled.id; return channel.send("✅ I have **set** teamRoles[`channelID`] to: `"+channeled.id+"` ("+channeled+")")
				}
				else{
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ Available Syntax and Arguments ℹ",
						"description": "`!set teams check`\n"
							+"`!set teams <on/off>`\n"
							+"`!set teams channel <#channel>`\n"
							+"... more settings in `config.json` file..."
					};
					return channel.send({embed: embedMSG});
				}
			}
			
			
			
			//
		}
	}
	
	
	
	// RESTART THIS MODULE
	if(command==="restart" && user.id===config.ownerID && args[0]==="user"){
		channel.send("♻ Restarting **User** (`userBot.js`) module... please wait `3` to `5` seconds...").then(()=>{ process.exit(1) }).catch(console.error);
	}
	
	//
	// END ADMIN COMMANDS
	//
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