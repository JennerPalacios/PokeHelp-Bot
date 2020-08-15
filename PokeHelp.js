/*
Copyright (c) 2019 Jenner Palacios

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
// DISCORD JS
//
const Discord=require("discord.js");
const bot=new Discord.Client({fetchAllMembers: true}); bot.commands=new Discord.Collection();


//
// DEPENDENCIES AND SETTINGS
//
const fs=require("fs"), request=require("request"), 
	botConfig=require("./config/botConfig.json"), globalSettings=require("./config/globalSettings.json"),
	serverPokeSettings=require("./data/serverPokeSettings.json"),
	chuckNorris=require("./data/chuckNorris.json"),
	pokemon=require("./data/pokemon.json"), pokemonMoves=require("./data/pokemonMoves.json"),
	pokemonTypes=require("./data/pokemonTypes.json");
var serverSettings=JSON.parse(fs.readFileSync("./config/serverSettings.json","utf8")), myDB="disabled", sqlite="disabled";
if(serverSettings.myDBserver){
	if(serverSettings.myDBserver.enabled==="yes"){
		const mySQL=require("mysql");
		myDB=mySQL.createConnection(serverSettings.myDBserver);
		myDB.connect(error=>{
			if(error){
				console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ACCESS"+cc.cyan+" Database "+cc.reset+"(invalid login)\nRAW: "+error.sqlMessage)
			}
		});
	}
	else{
		sqlite=require("sqlite"); sqlite.open("./database/data.sqlite");
	}
}


//
// LOAD ALL COMMANDS
//
const commands=fs.readdirSync("./commands").filter(file=>file.endsWith(".js"));
for(const file of commands){
	const command=require("./commands/"+file);bot.commands.set(command.name,command);
}


//
// SHORTEN JSON DATA AND CONSOLE COLORS
//
const advText=globalSettings.advText, foulText=globalSettings.foulText, pokeCity=serverPokeSettings.pokeCity,
	pokeBadge=serverPokeSettings.pokeBadge, pokeRegion=serverPokeSettings.pokeRegion, pokeCuttie=serverPokeSettings.pokeCuttie,
	cc={"reset":"\x1b[0m","ul":"\x1b[4m","lred":"\x1b[91m","red":"\x1b[31m","lgreen":"\x1b[92m","green":"\x1b[32m","lyellow":"\x1b[93m","yellow":"\x1b[33m",
		"lblue":"\x1b[94m","blue":"\x1b[34m","lcyan":"\x1b[96m","cyan":"\x1b[36m","pink":"\x1b[95m","purple":"\x1b[35m","bgwhite":"\x1b[107m","bggray":"\x1b[100m",
		"bgred":"\x1b[41m","bggreen":"\x1b[42m","bglgreen":"\x1b[102m","bgyellow":"\x1b[43m","bgblue":"\x1b[44m","bglblue":"\x1b[104m","bgcyan":"\x1b[106m",
		"bgpink":"\x1b[105m","bgpurple":"\x1b[45m","hlwhite":"\x1b[7m","hlred":"\x1b[41m\x1b[30m","hlgreen":"\x1b[42m\x1b[30m","hlblue":"\x1b[44m\x1b[37m",
		"hlcyan":"\x1b[104m\x1b[30m","hlyellow":"\x1b[43m\x1b[30m","hlpink":"\x1b[105m\x1b[30m","hlpurple":"\x1b[45m\x1b[37m"};



//
// FUNCTION: CLEAN TEXT FOR EVALUATION COMMAND
//
function clean(text){
	if(typeof(text)==="string"){
		return text.replace(/`/g, "`"+String.fromCharCode(8203)).replace(/@/g, "@"+String.fromCharCode(8203));
	}
	return text;
}



//
// FUNCTION: TIME STAMP
//
function timeStamp(type){
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	if(!type || type===0){
	// 	YYYY/MM/DD HH:MM:SS |
		return cc.blue+yr+"/"+mo+"/"+da+" "+hr+":"+min+":"+sec+cc.reset+" |"
	}
	if(type===1){
	// 	`MM/DD/YYYY @ HH:MM:SS`
		return "`"+mo+"/"+da+"/"+yr+" @ "+hr+":"+min+":"+sec+"`"
	}
}



//
// FUNCTION: GET THIS GUILD
//
function getGuild(guildID){
	for(let n=0;n<serverSettings.servers.length;n++){
		if(guildID===serverSettings.servers[n].id){
			return n;
		}
	}
}



//
// RANDOM FUNCTION
//
function random(type,arg){
	if(type==="key"){
		let keyGen="";
		let possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for(var i=0;i<arg;i++) {
			keyGen+=possible.charAt(Math.floor(Math.random()*possible.length));
		}
		return keyGen
	}
	if(type==="num"){
		let numGen="";
		let possible="0123456789";
		for(var i=0;i<arg;i++) {
			numGen+=possible.charAt(Math.floor(Math.random()*possible.length));
		}
		return numGen
	}
	if(type==="arr"){
		return arg[Math.floor(Math.random()*arg.length)];
	}
}



//
// FUNCTION: GET BANNED MEMBER
//
function getBannedMember(guild,channelID,guildName){
	setTimeout(function(){
		guild.fetchAuditLogs({limit:1,type:22})
		.then(auditLog=>{
			let masterName="",masterID="",minionName="",minionID="",reason="",embedMSG="";
			auditLog.entries.map(u=>{
				masterName=u.executor.username,masterID=u.executor.id,minionName=u.target.username,minionID=u.target.id,reason="."+String(u.reason)+"."
			});
			if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat" || botConfig.consoleLog==="cmdsevents" || botConfig.consoleLog==="events"){
				console.log(
					timeStamp()+" "+cc.cyan+minionName+cc.reset+"("+cc.lblue+minionID+cc.reset+") was "+cc.green+"banned"+cc.reset+" from: "+cc.yellow+guild.name+cc.reset
					+", due to: "+cc.cyan+reason.replace("|CmdBy:", cc.reset+" | CmdBy:"+cc.red).slice(1,-1)+cc.reset
				);
			}
			reason=reason.replace("|CmdBy:", "\n\n**CmdBy**:");if(reason===".."){reason="It was **not** __defined__"}else{reason=reason.slice(1,-1)}
			embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⛔ \""+minionName+"\" WAS BANNED",
					"thumbnail": {"url": globalSettings.images.banned},
					"description": "**UserID**: `"+minionID+"`\n**UserTag**: <@"+minionID+">\n"
						+"**Reason**: "+reason+"\n**By**: <@"+masterID+">\n**On**: "+timeStamp(1)
				}
			};
			if(guildName){
				embedMSG={
					"embed": {
						"color": 0xFF0000,
						"title": "⛔ \""+minionName+"\" WAS BANNED",
						"thumbnail": {"url": globalSettings.images.banned},
						"description": "**UserID**: `"+minionID+"`\n**UserTag**: <@"+minionID+">\n"
							+"**From Server**: "+guildName+"\n**Reason**: "+reason+"\n**By**: <@"+masterID+">\n**On**: "+timeStamp(1)
					}
				};
			}
			bot.channels.get(channelID).send(embedMSG)
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel ID: "+cc.cyan+channelID+cc.reset+" | "+error.message));
		})
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"fetchAuditLogs()"+cc.reset+" | "+error.message));
	},2000)
}



//
// FUNCTION: GET NEW MEMBER
//
function getNewMember(member,channelID,agreementRequired){
	let assignedChannel="",agreementMethod="";
	if(channelID && agreementRequired){
		assignedChannel="(<#"+channelID+">)";
		agreementMethod="and **accept** them by typing: `!agree` in channel: <#"+channelID+">";
	}
	else if(channelID){
		assignedChannel="(<#"+channelID+">)";
	}
	let welcomeMSG=`
Welcome to **${member.guild.name}**'s Discord, ${member}.

**FIRST**
	Confirm your contact information with **Discord** so you can have read-access to our basic channels.

**THEN:**
	Carefully read our **Rules**${assignedChannel}; make sure you have clear understanding of our **rules** ${agreementMethod}
	-If you have any question, or need clarification about a rule, contact a **Moderator** or **Staff** member.

**LASTLY:**
	Enjoy and have fun catching awesome **Pokemon** while using our services. Meet other trainers, and try to attend our community events.

-<@${botConfig.ownerID}>
`
;
	member.send(welcomeMSG)
	.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
}


//
// DATABASE TIMER FOR TEMPORARY ROLES
//
setInterval(function(){
	let timeNow=new Date().getTime(),dbTime="",daysLeft="",logginChannel="",sid="",member="";
	if(myDB!=="disabled"){
		myDB.query(`SELECT * FROM PokeHelp_bot.temporaryRoles;`,(error,results)=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"DELETE FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
			else{
				if(results.length<1){
					return;
				}
				else{
					let rows=results;
					for(let rowNumber="0"; rowNumber<rows.length; rowNumber++){
						dbTime=rows[rowNumber].endDate; daysLeft=(dbTime*1)-(timeNow*1);
						sid=getGuild(rows[rowNumber].guildID);if(sid===undefined){return}
						member=bot.guilds.get(rows[rowNumber].guildID).members.get(rows[rowNumber].userID) || "notFound";
						if(serverSettings.servers[sid].id){
							if(serverSettings.servers[sid].tempRoles){
								if(serverSettings.servers[sid].tempRoles.remindAtDays){
									let daysRemaining=Math.ceil(daysLeft/86400000), remindAt=(serverSettings.servers[sid].tempRoles.remindAtDays*1), dayORdays=" day";
									if(serverSettings.servers[sid].tempRoles.remindAtDays>1){dayORdays=" days"}
									if(daysRemaining===remindAt){
										myDB.query(`UPDATE PokeHelp_bot.temporaryRoles SET reminderSent=? WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`,
											["yes"],error=>{
												if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
											}
										);
										if(rows[rowNumber].reminderSent===null || rows[rowNumber].reminderSent==="no"){
											if(member!=="notFound"){
												if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
													console.info(timeStamp()+" "+cc.lblue+rows[rowNumber].userName+cc.reset+"'s "
													+cc.green+"temporary role"+cc.reset+" is expiring soon, sending notification..."+cc.reset);
												}
												member.send(
													"⚠ <@"+rows[rowNumber].userID+">, you will **lose** your role: **"+rows[rowNumber].temporaryRole+"** "
													+"in `"+daysRemaining+dayORdays+"`. Please contact <@"+botConfig.ownerID
													+"> if you wish to renew your **temporary role**."
												)
												.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"));
											}
										}
									}
								}
							}
						}
						if(daysLeft<1){
							if(member==="notFound"){
								if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat" || botConfig.consoleLog==="cmdsevents" || botConfig.consoleLog==="events"){
									console.info(
										timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+cc.cyan+rows[rowNumber].userName+cc.reset+"("+cc.lblue+rows[rowNumber].userID+cc.reset
										+") was not found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | They will be removed from "+cc.cyan+"TemporaryRoles"+cc.reset+" DataBase"
									);
								}
							}
							if(serverSettings.servers[sid].id){
								if(serverSettings.servers[sid].serverEvents){
									if(serverSettings.servers[sid].serverEvents.roleChannelID){
										bot.channels.get(serverSettings.servers[sid].serverEvents.roleChannelID)
										.send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their role: **"+rows[rowNumber].temporaryRole+"** - their **temporary** access has __EXPIRED__ 😭")
										.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not send message to channel | "+error.message));
										logginChannel=serverSettings.servers[sid].serverEvents.roleChannelID;
									}
								}
							}
							if(serverSettings.serverEvents){
								if(serverSettings.serverEvents.roleChannelID){
									if(serverSettings.serverEvents.roleChannelID){
										if(logginChannel!==serverSettings.serverEvents.roleChannelID){
											bot.channels.get(serverSettings.serverEvents.joinChannelID)
											.send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their role: **"+rows[rowNumber].temporaryRole+"** - their **temporary** access has __EXPIRED__ 😭")
											.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not send message to channel | "+error.message));
										}
									}
								}
							}
							if(member!=="notFound"){
								member.send(
									"⚠ <@"+rows[rowNumber].userID+">, you have **lost** your role: **"+rows[rowNumber].temporaryRole+"** - your **temporary**"
									+"access has __EXPIRED__ 😭 \nPlease contact <@"+botConfig.ownerID+"> if you wish to renew your **temporary role**."
								)
								.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"));
							}
							console.log(
								timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") have lost their "
								+cc.green+"temporary"+cc.reset+" role: "+cc.red+rows[rowNumber].temporaryRole+cc.reset+", in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset
							);
							let roleToRemove=bot.guilds.get(rows[rowNumber].guildID).roles.find(role=>role.name===rows[rowNumber].temporaryRole) || "notFound";
							if(roleToRemove==="notFound"){
								console.info(
									timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" The "+cc.green+"temporary"+cc.reset+" role: "+cc.cyan+rows[rowNumber].temporaryRole+cc.reset+" was "
									+cc.red+"not"+cc.reset+" found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | But dbEntry was "+cc.green+"removed"+cc.reset+" from DataBase"
								);
							}
							else if(member.roles.has(roleToRemove.id)){
								member.removeRole(roleToRemove)
								.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"removeRole()"+cc.reset+" from member | "+error.message));
							}
							myDB.query(`DELETE FROM PokeHelp_bot.temporaryRoles WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`,error=>{
								if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"DELETE FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
							});
						}
					}
				}
			}
		});
	}
	else{
		sqlite.all(`SELECT * FROM temporaryRoles;`).then(rows=>{
			if(rows.length<1){return}
			else{
				for(let rowNumber="0"; rowNumber<rows.length; rowNumber++){
					dbTime=rows[rowNumber].endDate; daysLeft=(dbTime*1)-(timeNow*1);
					sid=getGuild(rows[rowNumber].guildID);if(sid===undefined){return}
					member=bot.guilds.get(rows[rowNumber].guildID).members.get(rows[rowNumber].userID) || "notFound";
					if(serverSettings.servers[sid].id){
						if(serverSettings.servers[sid].tempRoles){
							if(serverSettings.servers[sid].tempRoles.remindAtDays){
								let daysRemaining=Math.ceil(daysLeft/86400000), remindAt=(serverSettings.servers[sid].tempRoles.remindAtDays*1), dayORdays=" day";
								if(serverSettings.servers[sid].tempRoles.remindAtDays>1){dayORdays=" days"}
								if(daysRemaining===remindAt){
									sqlite.run(`UPDATE temporaryRoles SET reminderSent=? WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`,["yes"])
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table | "+error.message));
									if(rows[rowNumber].reminderSent===null || rows[rowNumber].reminderSent==="no"){
										if(member!=="notFound"){
											if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
												console.info(timeStamp()+" "+cc.lblue+rows[rowNumber].userName+cc.reset+"'s "
												+cc.green+"temporary role"+cc.reset+" is expiring soon, sending notification..."+cc.reset);
											}
											member.send(
												"⚠ <@"+rows[rowNumber].userID+">, you will **lose** your role: **"+rows[rowNumber].temporaryRole+"** "
												+"in `"+daysRemaining+dayORdays+"`. Please contact <@"+botConfig.ownerID
												+"> if you wish to renew your **temporary role**."
											)
											.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"));
										}
									}
								}
							}
						}
					}
					if(daysLeft<1){
						if(member==="notFound"){
							if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat" || botConfig.consoleLog==="cmdsevents" || botConfig.consoleLog==="events"){
								console.info(
									timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+cc.cyan+rows[rowNumber].userName+cc.reset+"("+cc.lblue+rows[rowNumber].userID+cc.reset
									+") was not found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | They will be removed from "+cc.cyan+"TemporaryRoles"+cc.reset+" DataBase"
								);
							}
						}
						if(serverSettings.servers[sid].id){
							if(serverSettings.servers[sid].serverEvents){
								if(serverSettings.servers[sid].serverEvents.roleChannelID){
									bot.channels.get(serverSettings.servers[sid].serverEvents.roleChannelID)
									.send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their role: **"+rows[rowNumber].temporaryRole+"** - their **temporary** access has __EXPIRED__ 😭")
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not send message to channel | "+error.message));
									logginChannel=serverSettings.servers[sid].serverEvents.roleChannelID;
								}
							}
						}
						if(serverSettings.serverEvents){
							if(serverSettings.serverEvents.roleChannelID){
								if(serverSettings.serverEvents.roleChannelID){
									if(logginChannel!==serverSettings.serverEvents.roleChannelID){
										bot.channels.get(serverSettings.serverEvents.joinChannelID)
										.send("⚠ <@"+rows[rowNumber].userID+"> have **lost** their role: **"+rows[rowNumber].temporaryRole+"** - their **temporary** access has __EXPIRED__ 😭")
										.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not send message to channel | "+error.message));
									}
								}
							}
						}
						if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat" || botConfig.consoleLog==="cmdsevents" || botConfig.consoleLog==="events"){
							console.log(
								timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") have lost their "
								+cc.green+"temporary"+cc.reset+" role: "+cc.red+rows[rowNumber].temporaryRole+cc.reset+", in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset
							);
						}
						member.send(
							"⚠ <@"+rows[rowNumber].userID+">, you have **lost** your role: **"+rows[rowNumber].temporaryRole+"** - your **temporary**"
							+"access has __EXPIRED__ 😭 \nPlease contact <@"+botConfig.ownerID+"> if you wish to renew your **temporary role**."
						)
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs, blocked me, or is no longer in server"));
						let roleToRemove=bot.guilds.get(rows[rowNumber].guildID).roles.find(role=>role.name===rows[rowNumber].temporaryRole) || "notFound";
						if(roleToRemove==="notFound"){
							console.info(
								timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" The "+cc.green+"temporary"+cc.reset+" role: "+cc.cyan+rows[rowNumber].temporaryRole+cc.reset+" was "
								+cc.red+"not"+cc.reset+" found in server: "+cc.yellow+rows[rowNumber].guildName+cc.reset+" | But dbEntry was "+cc.green+"removed"+cc.reset+" from DataBase"
							);
						}
						else if(member.roles.has(roleToRemove.id)){
							member.removeRole(roleToRemove)
							.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"removeRole()"+cc.reset+" from member | "+error.message));
						}
						sqlite.run(`DELETE FROM temporaryRoles WHERE userID="${rows[rowNumber].userID}" AND temporaryRole="${rows[rowNumber].temporaryRole}";`)
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"DELETE FROM"+cc.reset+" database | "+error.message));
					}
				}
			}
		})
		.catch(error=>{console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" TemporaryRoles timer, could not "+cc.yellow+"SELECT FROM"+cc.cyan+" database | "+error.message)});
	}
},3600000);
// 86400000 = 24hrs
// 43200000 = 12hrs
// 21600000 = 6hrs
// 10800000 = 3hrs
// 3600000 = 1hr <-
// 1800000 = 30mins



//
// UNHANDLED REJECTION/PROMISE
//
process.on("unhandledRejection",error=>console.log(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Uncaught Promise Rejection:\n"+error));



//
// BOT SIGNED IN AND IS READY
//
bot.on("ready", ()=>{
	botConfig.botVersion="3.7";
	console.info(timeStamp()+" -- DISCORD HELPBOT: "+cc.yellow+bot.user.username+cc.reset+", IS "+cc.green+"READY"+cc.reset+"! --");

	// VERSION CHECKER
	request("https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/version.txt",(error,response,body)=>{
		if(error){
			console.info(timeStamp()+" "+cc.hlred+"ERROR "+cc.reset+" Could not load version from gitHub | "+error);
		}
		if(body){
			let gitHubVer=body.slice(0,-1); let timeLog=timeStamp();
			let verChecker=cc.green+"up-to-date"+cc.reset; if(gitHubVer!==botConfig.botVersion){ verChecker=cc.hlred+" OUTDATED! "+cc.reset }
			console.info(
				timeLog+" GitHub Discord Bot [PokéHelp]: "+cc.yellow+"v"+gitHubVer+cc.reset+"\n"
				+timeLog+" Local Discord Bot ["+bot.user.username+"]: "+cc.yellow+"v"+botConfig.botVersion+cc.reset+" -> "+verChecker+"\n"
				+timeLog+" Discord API [discord.js]: "+cc.yellow+"v"+Discord.version+cc.reset+"\n"
				+timeLog+" Node API [node.js] version: "+cc.yellow+process.version+cc.reset
			);
		}
	});
	//
	// DATABASE FILE AND TABLE CREATION
	//
	//CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
	if(myDB!=="disabled"){
		// CREATE DATABASE
		myDB.query(`CREATE DATABASE IF NOT EXISTS PokeHelp_bot CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE DATABASE"+cc.cyan+" PokeHelp_bot "+cc.reset+"\nRAW: "+error)}
		});

		// CREATE TABLE MEMBER AGREEMENT TRACKER
		myDB.query(`CREATE TABLE IF NOT EXISTS PokeHelp_bot.agreedMembers (userID TEXT,userName TEXT,serverID TEXT,serverName TEXT,dateAccepted TEXT);`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" agreedMembers "+cc.reset+"in database\nRAW: "+error)}
		});

		// CREATE TABLE CHAT TRACKER
		myDB.query(`CREATE TABLE IF NOT EXISTS PokeHelp_bot.chatTracker (userID TEXT,userName TEXT,lastMsgID TEXT,lastMsg TEXT,lastChanID TEXT,lastChanName TEXT,guildID TEXT,guildName TEXT,lastDate TEXT,points INTEGER,level INTEGER);`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" chatTracker "+cc.reset+"in database\nRAW: "+error)}
		});

		// CREATE TABLE COMMAND SPAM CONTROL
		myDB.query(`CREATE TABLE IF NOT EXISTS PokeHelp_bot.cmdSpamControl (userID TEXT,userName TEXT,guildID TEXT,guildName TEXT,lastDate TEXT,cmdCount TEXT);`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" cmdSpamControl "+cc.reset+"in database\nRAW: "+error)}
		});

		// CREATE TABLE TEMPORARY ROLES
		myDB.query(`CREATE TABLE IF NOT EXISTS PokeHelp_bot.temporaryRoles (userID TEXT,userName TEXT,temporaryRole TEXT,guildID TEXT,guildName TEXT,startDate TEXT,endDate TEXT,addedByID TEXT,addedByName TEXT);`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" temporaryRoles "+cc.reset+"in database\nRAW: "+error)}
		});
		myDB.query(`SELECT reminderSent FROM PokeHelp_bot.temporaryRoles;`,async (error,results)=>{
			if(error){
				console.info(timeStamp()+" "+cc.hlblue+" WARNING "+cc.reset+" Could not "+cc.yellow+"SELECT reminderSent FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error
					+"\n"+timeStamp()+" Column above did not exist. Adding column to table...");
				myDB.query(`ALTER TABLE PokeHelp_bot.temporaryRoles ADD COLUMN reminderSent TEXT AFTER addedByName;`,error=>{
					if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ALTER TABLE"+cc.cyan+" temporaryRoles "+cc.reset+"in database\nRAW: "+error)}
				});
			}
		});

		// CREATE TABLE TEMPORARY SELF ROLES
		myDB.query(`CREATE TABLE IF NOT EXISTS PokeHelp_bot.temporarySelfTag (userID TEXT,userName TEXT,temporaryTag TEXT,guildID TEXT,guildName TEXT,startDate TEXT,endDate TEXT);`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" temporarySelfTag "+cc.reset+"in database\nRAW: "+error)}
		});

		// CREATE TABLE MESSAGE REACTIONS
		myDB.query(`CREATE TABLE IF NOT EXISTS PokeHelp_bot.messageReactions (id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,serverID TEXT,serverName TEXT,channelID TEXT,channelName TEXT,messageID TEXT,emojiAnimated TEXT,emojiName TEXT,emojiID TEXT,roleName TEXT,roleID TEXT,title TEXT,display TEXT);`,error=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" messageReactions "+cc.reset+"in database\nRAW: "+error)}
		});
	}
	else{
		// MEMBER AGREEMENT TRACKER
		sqlite.run(`CREATE TABLE IF NOT EXISTS agreedMembers (userID TEXT, userName TEXT, serverID TEXT, serverName TEXT, dateAccepted TEXT);`)
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" agreedMembers "+cc.reset+"in database | "+error.message+"\n"+error));

		// CHAT TRACKER
		sqlite.run(`CREATE TABLE IF NOT EXISTS chatTracker (userID TEXT, userName TEXT, lastMsgID, lastMsg TEXT, lastChanID TEXT, lastChanName TEXT, guildID TEXT, guildName TEXT, lastDate TEXT, points INTEGER, level INTEGER);`)
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" chatTracker "+cc.reset+"in database | "+error.message));

		// COMMAND SPAM CONTROL
		sqlite.run(`CREATE TABLE IF NOT EXISTS cmdSpamControl (userID TEXT, userName TEXT, guildID TEXT, guildName TEXT, lastDate TEXT, cmdCount TEXT);`)
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" cmdSpamControl "+cc.reset+"in database | "+error.message));

		// TEMPORARY ROLES
		sqlite.run(`CREATE TABLE IF NOT EXISTS temporaryRoles (userID TEXT, userName TEXT, temporaryRole TEXT, guildID TEXT, guildName TEXT, startDate TEXT, endDate TEXT, addedByID TEXT, addedByName TEXT);`)
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" temporaryRoles "+cc.reset+"in database | "+error.message));
		sqlite.all(`SELECT reminderSent FROM temporaryRoles`)
		.catch(err=>{
			sqlite.run(`ALTER TABLE temporaryRoles ADD COLUMN reminderSent TEXT AFTER addedByName;`)
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ALTER"+cc.cyan+" temporaryRoles"+cc.reset+" table | "+error.message));
			console.info(timeStamp()+" "+cc.hlblue+" NOTICE "+cc.reset+" Could not "+cc.yellow+"SELECT reminderSent FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+err.message
				+"\n"+timeStamp()+" Column above did not exist. Adding column to table...")
		});

		// TEMPORARY SELF ROLES
		sqlite.run(`CREATE TABLE IF NOT EXISTS temporarySelfTag (userID TEXT, userName TEXT, temporaryTag TEXT, guildID TEXT, guildName TEXT, startDate TEXT, endDate TEXT);`)
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" temporarySelfTag "+cc.reset+"in database | "+error.message));

		// MESSAGE REACTIONS
		sqlite.run(`CREATE TABLE IF NOT EXISTS messageReactions (id INTEGER PRIMARY KEY, serverID TEXT, serverName TEXT, channelID TEXT, channelName TEXT, messageID TEXT, emojiAnimated TEXT, emojiName TEXT, emojiID TEXT, roleName TEXT, roleID TEXT, title TEXT, display TEXT);`)
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"CREATE TABLE"+cc.cyan+" messageReactions "+cc.reset+"in database | "+error.message));
	}
});



//
// JOIN EVENT
//
bot.on("guildMemberAdd", member=>{
	
	let joinedServer="", guild=member.guild, user=member.user, sid=getGuild(member.guild.id);if(sid===undefined){return}
	if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat" || botConfig.consoleLog==="cmdsevents" || botConfig.consoleLog==="events"){
		console.log(timeStamp()+" "+cc.cyan+user.username+cc.reset+"("+cc.lblue+user.id+cc.reset+") has joined server: "+cc.yellow+guild.name+cc.reset);
	}
	let welcomeList=[
		member+" came to get their last badge, the **"+random("arr",pokeBadge)+" Badge**!",
		"Everyone quick! A **shiny** "+member+" has just **spawned**!",
		member+" is looking for their **"+random("arr",pokeCuttie)+"**, anyone seen it?",
		"Prepare for trouble, "+member+", and make it double...",
		member+" wants to be their very **best** ♪, like no one ever was! ♫ ♪",
		"Trainer "+member+" needs a **"+random("arr",pokeCuttie)+"** to complete their **PokeDex**!",
		member+", from the **"+random("arr",pokeRegion)+" Region**, is looking for a friendly match!",
		"Anyone with a **"+random("arr",pokeBadge)+" Badge**? "+member+" needs help getting one!",
		member+" needs help finding the **"+random("arr",pokeCity)+" City Gym**, help them out plz!",
		"A wild "+member+" **CP**:`489` (__82%__ 12/10/15) has just **spawned**!",
		"One sec guys! "+member+" needs to heal their Pokémon...",
		member+" has an `OP` **"+random("arr",pokeCuttie)+"**! Niantic, nerf it pl0x!",
		"Gratz "+member+"! You just caught your first **"+random("arr",pokeCuttie)+"**!",
		member+" has come to show off their **"+random("arr",pokeCuttie)+"** - what a noOb!"
	];
	let joinMSG=random("arr",welcomeList), logginChannel="";
	if(serverSettings.servers[sid].id){
		if(serverSettings.servers[sid].newMember){
			if(serverSettings.servers[sid].newMember.welcomeDM==="yes"){
				if(serverSettings.servers[sid].newMember.rulesChannelID && serverSettings.servers[sid].newMember.roleAgreementRequired==="yes"){
					getNewMember(member,serverSettings.servers[sid].newMember.rulesChannelID,"yes");
				}
				else if(serverSettings.servers[sid].newMember.rulesChannelID){
					getNewMember(member,serverSettings.servers[sid].newMember.rulesChannelID);
				}
				else{
					getNewMember(member);
				}
			}
			if(serverSettings.servers[sid].newMember.roleOnJoinEnabled==="yes"){
				if(serverSettings.servers[sid].newMember.roleOnJoinName){
					let starterRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].newMember.roleOnJoinName) || "notFound";
					if(starterRole==="notFound"){
						console.info(
							timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Role: "+cc.cyan+serverSettings.servers[sid].newMember.roleOnJoinName+cc.reset
							+" was "+cc.red+"not"+cc.reset+" found in server: "+cc.yellow+member.guild.name+cc.reset+", as it was input in "
							+cc.purple+"serverSettings.json"+cc.reset+" > "+cc.purple+"newMember"+cc.reset+" > "+cc.purple+"roleOnJoinName"+cc.reset
						);
					}
					else{
						member.addRole(starterRole)
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"addRole()"+cc.reset+" to new member | "+error.message));
					}
				}
			}
		}
		if(serverSettings.servers[sid].serverEvents){
			if(serverSettings.servers[sid].serverEvents.joinChannelID){
				if(serverSettings.servers[sid].serverEvents.joinEvents==="yes"){
					if(serverSettings.servers[sid].serverEvents.joinPokeRandom==="yes"){
						bot.channels.get(serverSettings.servers[sid].serverEvents.joinChannelID).send(timeStamp(1)+" "+joinMSG)
						.catch(
							error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channelID "
							+cc.cyan+serverSettings.servers[sid].serverEvents.joinChannelID+cc.reset+" | "+error.message)
						);
					}
					else{
						bot.channels.get(serverSettings.servers[sid].serverEvents.joinChannelID).send(timeStamp(1)+" "+member.user.username+" has joined server!")
						.catch(
							error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channelID "
							+cc.cyan+serverSettings.servers[sid].serverEvents.joinChannelID+cc.reset+" | "+error.message)
						);
					}
					logginChannel=serverSettings.servers[sid].serverEvents.joinChannelID;
				}
			}
		}
	}
	if(serverSettings.serverEvents){
		if(serverSettings.serverEvents.joinChannelID){
			if(logginChannel!=="" && logginChannel===serverSettings.serverEvents.joinChannelID){return}
			if(serverSettings.serverEvents.joinEvents==="yes"){
				if(serverSettings.serverEvents.joinPokeRandom==="yes"){
					bot.channels.get(serverSettings.serverEvents.joinChannelID).send(timeStamp(1)+" "+joinMSG)
					.catch(
						error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channelID "
						+cc.cyan+serverSettings.serverEvents.joinChannelID+cc.reset+" | "+error.message)
					);
				}
				else{
					bot.channels.get(serverSettings.serverEvents.joinChannelID).send(timeStamp(1)+" "+member+" has joined server!")
					.catch(
						error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channelID "
						+cc.cyan+serverSettings.serverEvents.joinChannelID+cc.reset+" | "+error.message)
					);
				}
			}
		}
	}
});
// END OF: JOIN EVENT



//
// BAN EVENT
//
bot.on("guildBanAdd",async (guild,user)=>{
	let sid=await getGuild(guild.id);if(sid===undefined){return} let logginChannel="";
	if(serverSettings.servers[sid].id){
		if(serverSettings.servers[sid].moderationEvents){
			if(serverSettings.servers[sid].moderationEvents.channelID){
				if(serverSettings.servers[sid].moderationEvents.banEvents==="yes"){
					getBannedMember(guild,serverSettings.servers[sid].moderationEvents.channelID);
					logginChannel=serverSettings.servers[sid].moderationEvents.channelID;
				}
			}
		}
	}
	if(serverSettings.moderationEvents){
		if(serverSettings.moderationEvents.channelID){
			if(logginChannel!=="" && logginChannel===serverSettings.moderationEvents.channelID){return}
			if(serverSettings.moderationEvents.banEvents==="yes"){
				getBannedMember(guild,serverSettings.moderationEvents.channelID,guild.name);
			}
		}
	}
});
// END OF: BAN EVENT



//////////////////////////////////////////////////////////////////////////////////////////////////
//																								//
//									MESSAGE LISTENER											//
//																								//
//////////////////////////////////////////////////////////////////////////////////////////////////
bot.on("messageUpdate",async (oldMessage,newMessage)=>{
	if(newMessage.channel.guild===undefined){return}
	let member=newMessage.member, sid=await getGuild(newMessage.channel.guild.id);if(sid===undefined){return}
	// GRAB ADMINS AND MODERATORS
	let adminRole=newMessage.channel.guild.roles.find(role=>role.name===serverSettings.servers[sid].adminRoleName);
		if(!adminRole){
			adminRole={"id":"10101"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
				+cc.red+"adminRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].adminRoleName+cc.reset+" for server: "
				+cc.lblue+newMessage.channel.guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
	let modRole=newMessage.channel.guild.roles.find(role=>role.name===serverSettings.servers[sid].modRoleName);
		if(!modRole){
			modRole={"id":"10101"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
				+cc.red+"modRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].modRoleName+cc.reset+" for server: "
				+cc.lblue+newMessage.channel.guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
				
	// FOUL LANGUAGE FILTER
	if(foulText.some(word=>newMessage.content.includes(word))){
		let skip="no";if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){skip="yes"}
		if(serverSettings.servers[sid].id){if(serverSettings.servers[sid].chatFilter){if(serverSettings.servers[sid].chatFilter.allowFoulLanguage==="yes"){skip="yes"}}}
		if(skip==="no"){
			newMessage.delete();
			embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ WARNING: Watch Your Language ⚠",
					"thumbnail": {"url": globalSettings.images.warning},
					"description": "You are being **WARNED** about a **inappropriate** word... "
						+"Please watch your language; kids play this game too, you know\n**OffenseDate**: "+timeStamp(1)
				}
			};
			console.log(
				timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" FOUL LANGUAGE: "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") said: "+newMessage.content
			);
			member.send(embedMSG).then(()=>{
				member.send("Please **Read/Review Our Rules** in order to avoid a `Mute`/`Kick`/`Ban`")
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
			})
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
		}
	}

	// ADVERTISEMENT FILTER
	if(advText.some(word=>newMessage.content.toLowerCase().includes(word))){
		let skip="no";if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){skip="yes"}
		if(serverSettings.servers[sid].id){if(serverSettings.servers[sid].chatFilter){if(serverSettings.servers[sid].chatFilter.allowLinks==="yes"){skip="yes"}}}
		if(skip==="no"){
			newMessage.delete();
			embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ WARNING: No Advertising ⚠",
					"thumbnail": {"url": globalSettings.images.warning},
					"description": "You are being **WARNED** about a link... "
						+"Advertising is **NOT** allowed in our server.\n**OffenseDate**: "+timeStamp(1)
				}
			};
			console.log(
				timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" ADVERTISEMENT: "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") said: "+newMessage.content
			);
			member.send(embedMSG).then(()=>{
				member.send("Please **Read/Review Our Rules** in order to avoid a `Mute`/`Kick`/`Ban`")
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
			})
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
		}
	}

	// INVITE LINK FILTER
	let invLinks=newMessage.content.toLowerCase().match(/discord.gg/g);
	if(invLinks){
		let skip="no";if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){skip="yes"}
		if(serverSettings.servers[sid].id){if(serverSettings.servers[sid].chatFilter){if(serverSettings.servers[sid].chatFilter.allowInvites==="yes"){skip="yes"}}}
		if(skip==="no"){
			newMessage.delete();
			embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ WARNING: No Invites ⚠",
					"thumbnail": {"url": globalSettings.images.warning},
					"description": "You are being **WARNED** about an __invite__ code or link... "
						+"Advertising of other servers is **NOT** allowed in our server.\n**OffenseDate**: "+timeStamp(1)
				}
			};
			console.log(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" INVITE: "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") said: "+newMessage.content);
			member.send(embedMSG).then(()=>{
				member.send("Please **Read/Review Our Rules** in order to avoid a `Mute`/`Kick`/`Ban`")
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"))
			}).catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"))
		}
	}
});


bot.on("message",message=>{
	if(!message.member){return}if(!message.member.user){return}if(!message.member.user.username){return}
	if(message.member.user.bot || message.channel.type==="dm"){return}if(!message.content){return}

	// DEFINE SHORTER DISCORD PROPERTIES
	let guild=message.guild, channel=message.channel, member=message.member, sid=getGuild(message.guild.id);if(sid===undefined){return}

	// GRAB COMMAND
	let command=message.content.toLowerCase().split(/ +/)[0]; command=command.slice(botConfig.cmdPrefix.length);

	// GRAB ARGUMENTS
	let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1);

	// GRAB ADMINS AND MODERATORS
	let adminRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].adminRoleName);
		if(!adminRole){
			adminRole={"id":"10101"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
				+cc.red+"adminRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].adminRoleName+cc.reset+" for server: "
				+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
	let modRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].modRoleName);
		if(!modRole){
			modRole={"id":"10101"};console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
				+cc.red+"modRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].modRoleName+cc.reset+" for server: "
				+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
	//
	
	
	
	//
	// CHAT LISTENER
	//

	// CHAT ACTIVITY UPDATER
	//MAX PTS   | MAX LVL | XP MULTIPLIER
	//----------+---------+--------------
	//99,999pts = lvl 999 = 3.15914 xp
	//99,999pts = lvl 100 = 0.31623 xp
	//99,999pts = lvl 40  = 0.1265 xp
	//99,999pts = lvl 31  = 0.1 xp « old system
	let curTime=new Date().getTime(), points2add=1;
	if(args.length>5){
		if(args.length>9){points2add=2.5}if(args.length>14){points2add=3.5}
		if(args.length>19){points2add=5.5}if(args.length>24){points2add=6.5}
		if(args.length>29){points2add=8.5}if(args.length>34){points2add=9.5}
		if(args.length>39){points2add=11.5}if(args.length>44){points2add=12.5}
		if(args.length>49){points2add=14.5}if(args.length>54){points2add=15.5}
		if(args.length>59){points2add=17.5}if(args.length>64){points2add=18.5}
	}
	if(myDB!=="disabled"){
		myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${member.id}" AND guildID="${guild.id}";`,(error,results)=>{
			if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
			else{
				if(results.length<1){
					myDB.query(`INSERT INTO PokeHelp_bot.chatTracker (userID, userName, lastMsgID, lastMsg, lastChanID, lastChanName, guildID, guildName, lastDate, points, level) VALUES (?,?,?,?,?,?,?,?,?,?,?);`,
						[member.id, member.user.username, message.id, message.content, channel.id, channel.name, guild.id, guild.name, curTime, 1, 0],error=>{
							if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
						}
					);
				}
				else{
					let row=results[0];let curLevel=Math.floor(0.31623 * Math.sqrt(row.points)), newPoints=row.points+points2add;
					if(curLevel>row.level){
						row.level=curLevel;
						myDB.query(`UPDATE PokeHelp_bot.chatTracker SET lastMsgID=?, lastMsg=?, lastChanID=?, lastChanName=?, lastDate=?, points=?, level=? WHERE userID="${member.id}" AND guildID="${guild.id}";`,
							[message.id, message.content, channel.id, channel.name, curTime, newPoints, row.level],error=>{
								if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
							}
						);
						if(serverSettings.servers[sid].id){
							if(serverSettings.servers[sid].chatActivity){
								if(serverSettings.servers[sid].chatActivity.broadCastNewLevel==="yes"){
									channel.send("🎉 Gratz "+member+"! You've leveled up! Your new level is: **"+curLevel+"**! Keep the chat going 👍")
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message))
								}
							}
						}
						if(serverSettings.chatActivity){
							if(serverSettings.chatActivity.broadCastNewLevel==="yes"){
								channel.send("🎉 Gratz "+member+"! You've leveled up! Your new level is: **"+curLevel+"**! Keep the chat going 👍")
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message))
							}
						}
					}
					else{
						myDB.query(`UPDATE PokeHelp_bot.chatTracker SET lastMsgID=?, lastMsg=?, lastChanID=?, lastChanName=?, lastDate=?, points=? WHERE userID="${member.id}" AND guildID="${guild.id}";`,
							[message.id, message.content, channel.id, channel.name, curTime, newPoints],error=>{
								if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
							}
						);
					}
				}
			}
		});
	}
	else{
		sqlite.get(`SELECT * FROM chatTracker WHERE userID="${member.id}" AND guildID="${guild.id}";`)
		.then(row=>{
			if(!row){
				sqlite.run(`INSERT INTO chatTracker (userID, userName, lastMsgID, lastMsg, lastChanID, lastChanName, guildID, guildName, lastDate, points, level) VALUES (?,?,?,?,?,?,?,?,?,?,?);`,
					[member.id, member.user.username, message.id, message.content, channel.id, channel.name, guild.id, guild.name, curTime, 1, 0])
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.reset+cc.cyan+" chatTracker"+cc.reset+" table | "+error.message));
			}
			else{
				let curLevel=Math.floor(0.31623 * Math.sqrt(row.points)), newPoints=row.points+points2add;
				if(curLevel>row.level){
					row.level=curLevel;
					sqlite.run(`UPDATE chatTracker SET lastMsgID=?, lastMsg=?, lastChanID=?, lastChanName=?, lastDate=?, points=?, level=? WHERE userID="${member.id}" AND guildID="${guild.id}";`,
						[message.id, message.content, channel.id, channel.name, curTime, newPoints, row.level])
					.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" chatTracker"+cc.reset+" table | "+error.message))
					if(serverSettings.servers[sid].id){
						if(serverSettings.servers[sid].chatActivity){
							if(serverSettings.servers[sid].chatActivity.broadCastNewLevel==="yes"){
								channel.send("🎉 Gratz "+member+"! You've leveled up! Your new level is: **"+curLevel+"**! Keep the chat going 👍")
								.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" #1 Could not send message to channel | "+error.message));
							}
						}
					}
					if(serverSettings.chatActivity){
						if(serverSettings.chatActivity.broadCastNewLevel==="yes"){
							channel.send("🎉 Gratz "+member+"! You've leveled up! Your new level is: **"+curLevel+"**! Keep the chat going 👍")
							.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
						}
					}
				}
				else{
					sqlite.run(`UPDATE chatTracker SET lastMsgID=?, lastMsg=?, lastChanID=?, lastChanName=?, lastDate=?, points=? WHERE userID="${member.id}" AND guildID="${guild.id}";`,
						[message.id, message.content, channel.id, channel.name, curTime, newPoints])
					.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" chatTracker"+cc.reset+" table | "+error.message));
				}
			}
		})
		.catch(error=>{
			console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT"+cc.reset+" items from "+cc.cyan+"chatTracker"+cc.reset+" table | "+error.message);
		});
	}

	// FOUL LANGUAGE FILTER
	if(foulText.some(word=>message.content.includes(word))){
		let skip="no";if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){skip="yes"}
		if(serverSettings.servers[sid].id){if(serverSettings.servers[sid].chatFilter){if(serverSettings.servers[sid].chatFilter.allowFoulLanguage==="yes"){skip="yes"}}}
		if(skip==="no"){
			message.delete();
			embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ WARNING: Watch Your Language ⚠",
					"thumbnail": {"url": globalSettings.images.warning},
					"description": "You are being **WARNED** about a **inappropriate** word... "
						+"Please watch your language; kids play this game too, you know\n**OffenseDate**: "+timeStamp(1)
				}
			};
			console.log(
				timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" FOUL LANGUAGE: "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") said: "+message.content
			);
			member.send(embedMSG).then(()=>{
				member.send("Please **Read/Review Our Rules** in order to avoid a `Mute`/`Kick`/`Ban`")
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
			})
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
		}
	}

	// ADVERTISEMENT FILTER
	if(advText.some(word=>message.content.toLowerCase().includes(word))){
		let skip="no";if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){skip="yes"}
		if(serverSettings.servers[sid].id){if(serverSettings.servers[sid].chatFilter){if(serverSettings.servers[sid].chatFilter.allowLinks==="yes"){skip="yes"}}}
		if(skip==="no"){
			message.delete();
			embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ WARNING: No Advertising ⚠",
					"thumbnail": {"url": globalSettings.images.warning},
					"description": "You are being **WARNED** about a link... "
						+"Advertising is **NOT** allowed in our server.\n**OffenseDate**: "+timeStamp(1)
				}
			};
			console.log(
				timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" ADVERTISEMENT: "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") said: "+message.content
			);
			member.send(embedMSG).then(()=>{
				member.send("Please **Read/Review Our Rules** in order to avoid a `Mute`/`Kick`/`Ban`")
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
			})
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
		}
	}

	// INVITE LINK FILTER
	let invLinks=message.content.toLowerCase().match(/discord.gg/g);
	if(invLinks){
		let skip="no";if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){skip="yes"}
		if(serverSettings.servers[sid].id){if(serverSettings.servers[sid].chatFilter){if(serverSettings.servers[sid].chatFilter.allowInvites==="yes"){skip="yes"}}}
		if(skip==="no"){
			message.delete();
			embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ WARNING: No Invites ⚠",
					"thumbnail": {"url": globalSettings.images.warning},
					"description": "You are being **WARNED** about an __invite__ code or link... "
						+"Advertising of other servers is **NOT** allowed in our server.\n**OffenseDate**: "+timeStamp(1)
				}
			};
			console.log(timeStamp()+" "+cc.hlyellow+" WARNING "+cc.reset+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") said: "+message.content);
			member.send(embedMSG).then(()=>{
				member.send("Please **Read/Review Our Rules** in order to avoid a `Mute`/`Kick`/`Ban`")
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"))
			}).catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"))
		}
	}



	//
	// COMMAND LISTENER
	//
	if(!message.content.startsWith(botConfig.cmdPrefix)){
		if(botConfig.consoleLog==="all"){
			return console.info(timeStamp()+" "+cc.purple+"#"+channel.name+cc.reset+" | "+cc.lblue+member.user.username+cc.reset+": "+message.content);
		}
		else{return}
	}
	else{
		if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat" || botConfig.consoleLog==="cmds" || botConfig.consoleLog==="cmdsevents"){
			console.info(timeStamp()+" "+cc.purple+"#"+channel.name+cc.reset+" | "+cc.lblue+member.user.username+cc.reset+" > "
			+cc.green+"command"+cc.reset+": "+cc.cyan+message.content+cc.reset);
		}
		let skip="no";if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID || serverSettings.servers[sid].chatFilter.allowCommandSpam==="yes"){skip="yes"}
		if(skip==="no"){
			let curTime=new Date().getTime();
			if(myDB!=="disabled"){
				myDB.query(`SELECT * FROM PokeHelp_bot.cmdSpamControl WHERE userID="${member.id}";`,(error,results)=>{
					if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
					else{
						if(results.length<1){
							myDB.query(`INSERT INTO cmdSpamControl (userID, userName, lastDate, cmdCount) VALUES (?,?,?,?);`, [member.id, member.user.username, curTime, 1],error=>{
								if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
							});
							setTimeout(function(){
								myDB.query(`UPDATE PokeHelp_bot.cmdSpamControl SET cmdCount=0 WHERE userID="${row.userID}";`,error=>{
									if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
								});
							},15000);
						}
						else{
							setTimeout(function(){
								myDB.query(`UPDATE PokeHelp_bot.cmdSpamControl SET cmdCount=0 WHERE userID="${row.userID}";`,error=>{
									if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
								});
							},15000);
							let row=results[0];let cmdCurCount=row.cmdCount; cmdCurCount++;
							myDB.query(`UPDATE PokeHelp_bot.cmdSpamControl SET cmdCount="${cmdCurCount}" WHERE userID="${member.id}";`,error=>{
								if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
							});
							myDB.query(`SELECT * FROM PokeHelp_bot.cmdSpamControl WHERE userID="${member.id}";`,(error,results)=>{
								if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
								else{
									let row=results[0];
									let daCommander=guild.members.get(row.userID);
									if(row.cmdCount>3){
										daCommander.send("⚠ **NOTICE:** you have been **KICKED** due to: **command SPAM/ABUSE**, next time it will be a **BAN**")
										.catch(erroror=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
										channel.send("⚠ **NOTICE:** "+daCommander+" has been **KICKED** due to: **command SPAM/ABUSE**, next time it will be a **BAN**");
										let embedMSG={
											"color": 0xFF0000,
											"title": "\""+daCommander.user.username+"\" HAS BEEN KICKED",
											"thumbnail": {"url": config.images.kicked},
											"description": "**UserID**: "+daCommander.user.id+"\n**UserTag**: "+daCommander.user.username+"\n"
												+"**Reason**: Command Spamming\n**Command**: `"+message.content+"`\n\n**By**: AutoDetect \n**On**: "+timeStamp(1)
										};
										//bot.channels.get(config.modLogChannel.channelID).send({embed: embedMSG}).catch(error=>console.info("ERROR admin#C-4:\n"+error.message));
										//guild.member(member.user.id).kick().catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message))
									}
									// IF TYPED 3 COMMANDS WARN THEM
									if(row.cmdCount>2){
										console.info(timeStamp()+" "+cc.hlblue+" SPAM CONTROL "+cc.reset+" | "+cc.lblue+daCommander.user.username+cc.reset+" has used 3 consecutive commands, they could be KICKED...");
										daCommander.send("⚠ **WARNING:** you have used 3 consecutive commands, please allow **15 seconds** between each command! **1 more and you will be __KICKED__**")
										.catch(error=>console.info("ERROR admin#C-5:\n"+daCommander.user.username+"|"+error.message));
										channel.send("⚠ **WARNING:** "+daCommander+", you have used 3 consecutive commands, please allow **15 seconds** between each command! **1 more and you will be __KICKED__**");
									}
								}
							});
						}
					}
				});
			}
			else{
				sqlite.get(`SELECT * FROM cmdSpamControl WHERE userID="${member.id}";`)
				.then(row=>{
					if(!row){
						sqlite.run(`INSERT INTO cmdSpamControl (userID, userName, lastDate, cmdCount) VALUES (?,?,?,?);`, [member.id, member.user.username, curTime, 1])
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" cmdSpamControl"+cc.reset+" table | "+error.message));
						setTimeout(function(){
							sqlite.run(`UPDATE cmdSpamControl SET cmdCount=0 WHERE userID="${row.userID}";`)
							.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" cmdSpamControl"+cc.reset+" table | "+error.message));
						},15000);
					}
					else{
						setTimeout(function(){
						sqlite.run(`UPDATE cmdSpamControl SET cmdCount=0 WHERE userID="${row.userID}";`)
							.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" cmdSpamControl"+cc.reset+" table | "+error.message));
						},15000);
						let cmdCurCount=row.cmdCount; cmdCurCount++;
						sqlite.run(`UPDATE cmdSpamControl SET cmdCount="${cmdCurCount}" WHERE userID="${member.id}";`)
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" cmdSpamControl"+cc.reset+" table | "+error.message));
						sqlite.get(`SELECT * FROM cmdSpamControl WHERE userID="${member.id}";`)
						.then(row=>{
							let daCommander=guild.members.get(row.userID);
							if(row.cmdCount>3){
								daCommander.send("⚠ **NOTICE:** you have been **KICKED** due to: **command SPAM/ABUSE**, next time it will be a **BAN**")
								.catch(erroror=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message+" | Member has disabled DMs or has blocked me"));
								channel.send("⚠ **NOTICE:** "+daCommander+" has been **KICKED** due to: **command SPAM/ABUSE**, next time it will be a **BAN**");
								let embedMSG={
									"color": 0xFF0000,
									"title": "\""+daCommander.user.username+"\" HAS BEEN KICKED",
									"thumbnail": {"url": config.images.kicked},
									"description": "**UserID**: "+daCommander.user.id+"\n**UserTag**: "+daCommander.user.username+"\n"
										+"**Reason**: Command Spamming\n**Command**: `"+message.content+"`\n\n**By**: AutoDetect \n**On**: "+timeStamp(1)
								};
								//bot.channels.get(config.modLogChannel.channelID).send({embed: embedMSG}).catch(error=>console.info("ERROR admin#C-4:\n"+error.message));
								//guild.member(member.user.id).kick().catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message))
							}

							// IF TYPED 3 COMMANDS WARN THEM
							if(row.cmdCount>2){
								console.info(timeStamp()+" "+cc.hlblue+" SPAM CONTROL "+cc.reset+" | "+cc.lblue+daCommander.user.username+cc.reset+" has used 3 consecutive commands, they could be KICKED...");
								daCommander.send("⚠ **WARNING:** you have used 3 consecutive commands, please allow **15 seconds** between each command! **1 more and you will be __KICKED__**")
								.catch(error=>console.info("ERROR admin#C-5:\n"+daCommander.user.username+"|"+error.message));
								channel.send("⚠ **WARNING:** "+daCommander+", you have used 3 consecutive commands, please allow **15 seconds** between each command! **1 more and you will be __KICKED__**");
							}
						})
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT"+cc.reset+" items from "+cc.cyan+"cmdSpamControl"+cc.reset+" table | "+error.message));
					}
				})
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" cmdSpamControl"+cc.reset+" table | "+error.message));
			}
		}
	}


	// EVAL COMMAND - OWNER ONLY
	if(command==="eval" && member.id===botConfig.ownerID){
		try{
			let code=message.content.slice(6); let evaled=eval(code); let embedMSG="";
			if(typeof evaled!=="string"){
				evaled=require("util").inspect(evaled);
				embedMSG={"color": 0x00FF00,"description": "📥 **[**`Input`**]**:```js\n"+code+"```📤 **[**`Output`**]**:```js\n"+clean(evaled)+"```"};
				return channel.send({embed: embedMSG})
				.catch(error=>{
					console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send "+cc.cyan+"eval"+cc.reset+" results | "+error.message);
					channel.send("⛔ **[**`ERROR`**]**:```md\n"+error.message+"```").catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message))
				});
			}
			embedMSG={"color": 0x00FF00,
				"description": "📥 **[**`Input`**]**:```js\n"+code+"```📤 **[**`Output`**]**:```xl\n"+clean(evaled)+"```"
			};
			return channel.send({embed: embedMSG}).catch(error=>{
				console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send "+cc.cyan+"eval"+cc.reset+" results | "+error.message);
				channel.send("⛔ **[**`ERROR`**]**:```md\n"+error.message+"```").catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message))
			})
		}
		catch(error){
			channel.send("⛔ **[**`ERROR`**]**:```md\n"+error.message+"```").catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Eval result error | "+error.message))
		}
	}

	// RELOAD COMMAND - OWNER ONLY
	if(command==="reload" && member.id===botConfig.ownerID){
		if(args.length<1){
			let theCommands=bot.commands.map(cmds=>cmds.name);
			return channel.send("ℹ "+member+", modules available(`"+theCommands.length+"`):```md\nall, bot, "+theCommands.join(", ")+"```");
		}
		if(args[0]==="all" || args[0]==="bot"){
			return channel.send("♻ Restarting **BOT**... please wait `3` to `5` seconds...").then(()=>{ process.exit(1) })
			.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
		}
		if(!bot.commands.has(args[0])){
			let theCommands=bot.commands.map(cmds=>cmds.name);
			return channel.send("⛔ "+member+", that command/file does not exist!\nAvailable(`"+theCommands.length+"`):```md\nall, bot, "+theCommands.join(", ")+"```");
		}
		delete require.cache[require.resolve(`./commands/${args[0]}.js`)];bot.commands.delete(args[0]);
		const props=require(`./commands/${args[0]}.js`); bot.commands.set(args[0],props);
		return channel.send("✅ "+member+", I have successfuly reloaded: `"+args[0]+".js`")
		.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
	}

	// RESTART BOT - OWNER ONLY
	if(command==="restart" && member.id===botConfig.ownerID){
		if(args.length>0){
			if(args[0]==="bot" || args[0]==="pokehelp" || args[0]==="all"){
				channel.send("♻ Restarting **BOT**... please wait `3` to `5` seconds...").then(()=>{process.exit(1)})
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
			}
		}
	}
	
	// SET ACTIVITY
	if(command==="setact" && member.id===botConfig.ownerID){
		let embedMSG={
			"embed": {
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "```md\n[ActivityName]( Name the Activity )\n"
					+"[ActivityType]( playing streaming listening watching )\n"
					+"# SYNTAX AND EXAMPLES #\n"
					+botConfig.cmdPrefix+"setact <ActivityType> <ActivityName>\n"
					+botConfig.cmdPrefix+"setact watching youtube\n"
					+botConfig.cmdPrefix+"setact playing pokemon go```"
			}
		};
		if(args.length<1){
			return channel.send(embedMSG).catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message))
		}
		else{
			let validActivities=["playing", "streaming", "listening", "watching"];
			if(validActivities.some(activity=>activity===args[0])){
				let actType=args[0].toUpperCase(), actName=ARGS.slice(1).join(" ");
				bot.user.setActivity(actName,{type:actType})
					.then(()=>channel.send("✅ "+member+", I have set my **activity** to: `"+actType+": "+actName+"` 👍").catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message)))
					.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.cyan+"setActivity()"+cc.reset+" | "+error.message)); return;
			}
			return channel.send(embedMSG).catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message));
		}
	}



	// DYNAMIC COMMAND HANDLER
	if(bot.commands.has(command) || bot.commands.find(cmd=>cmd.aliases && cmd.aliases.includes(command))){
		try{
			const COMMAND=bot.commands.get(command) || bot.commands.find(cmd=>cmd.aliases && cmd.aliases.includes(command));
			COMMAND.execute(
				timeStamp(),timeStamp(1),cc,message,sid,bot.guilds,bot.channels,bot.users,botConfig,serverSettings,globalSettings,Discord.version,process.version
			);
		}
		catch(error){
			console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" | "+error);
		}
		return;
	}
});



//////////////////////////////////////////////////////////////////////////////////////////////////
//																								//
//									REACTIONS LISTENER											//
//																								//
//////////////////////////////////////////////////////////////////////////////////////////////////
bot.on("raw",async event=>{
	if(!event.hasOwnProperty("t")){return}
	const data=event.d;
	if(event.t==="MESSAGE_REACTION_REMOVE"){
		let sid=getGuild(data.guild_id);if(sid===undefined){return}
		if(serverSettings.servers[sid].trackReactions==="yes"){
			if(myDB!=="disabled"){
				await myDB.query(`SELECT * FROM PokeHelp_bot.messageReactions WHERE serverID="${data.guild_id}" AND channelID="${data.channel_id}" AND messageID="${data.message_id}" AND emojiName="${data.emoji.name}";`,async (error,results)=>{
					if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
					else{
						if(results.length>0){
							let row=results[0];
							let member=await bot.guilds.get(serverSettings.servers[sid].id).members.get(data.user_id);
							if(member.user.bot){return}
							member.removeRole(row.roleID)
							.then(()=>{
								return console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") have "+cc.red+"LOST"+cc.reset
								+" their role: "+cc.yellow+row.roleName+cc.reset+"; member "+cc.red+"removed"+cc.reset+" reaction from channel: "+cc.purple+"#"+row.channelName+cc.reset)
							})
							.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"removeRole()"+cc.reset+" from member | "+error.message));
						}
					}
				});
			}
			else{
				await sqlite.get(`SELECT * FROM messageReactions WHERE serverID="${data.guild_id}" AND channelID="${data.channel_id}" AND messageID="${data.message_id}" AND emojiName="${data.emoji.name}";`)
				.then(async row=>{
					if(!row){
						return
					}
					else{
						let member=await bot.guilds.get(serverSettings.servers[sid].id).members.get(data.user_id);
						if(member.user.bot){return}
						member.removeRole(row.roleID)
						.then(()=>{
							return console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") have "+cc.red+"LOST"+cc.reset
							+" their role: "+cc.yellow+row.roleName+cc.reset+"; member "+cc.red+"removed"+cc.reset+" reaction from channel: "+cc.purple+"#"+row.channelName+cc.reset)
						})
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message));
					}
				})
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message));
			}
		}
	}
	if(event.t==="MESSAGE_REACTION_ADD"){
		let sid=getGuild(data.guild_id);if(sid===undefined){return}
		if(serverSettings.servers[sid].trackReactions==="yes"){
			if(myDB!=="disabled"){
				await myDB.query(`SELECT * FROM PokeHelp_bot.messageReactions WHERE serverID="${data.guild_id}" AND channelID="${data.channel_id}" AND messageID="${data.message_id}" AND emojiName="${data.emoji.name}";`,async (error,results)=>{
					if(error){console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" cmdSpamControl"+cc.reset+" table\nRAW: "+error);}
					else{
						if(results.length>0){
							let row=results[0];
							let member=await bot.guilds.get(serverSettings.servers[sid].id).members.get(data.user_id);
							if(member.user.bot){return}
							member.addRole(row.roleID)
							.then(()=>{
								return console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has "+cc.green+"GAINED"+cc.reset
									+" role: "+cc.yellow+row.roleName+cc.reset+"; member "+cc.green+"reacted"+cc.reset+" in channel: "+cc.purple+"#"+row.channelName+cc.reset)
							})
							.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message));
						}
					}
				});
			}
			else{
				await sqlite.get(`SELECT * FROM messageReactions WHERE serverID="${data.guild_id}" AND channelID="${data.channel_id}" AND messageID="${data.message_id}" AND emojiName="${data.emoji.name}";`)
				.then(async row=>{
					if(!row){
						return
					}
					else{
						let member=await bot.guilds.get(serverSettings.servers[sid].id).members.get(data.user_id);
						if(member.user.bot){return}
						member.addRole(row.roleID)
						.then(()=>{
							return console.info(timeStamp()+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset+") has "+cc.green+"GAINED"+cc.reset
								+" role: "+cc.yellow+row.roleName+cc.reset+"; member "+cc.green+"reacted"+cc.reset+" in channel: "+cc.purple+"#"+row.channelName+cc.reset)
						})
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message))
					}
				})
				.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" "+error.message));
			}
		}
	}
});


//
// CONNECT BOT TO DISCORD
//
bot.login(botConfig.token);


//
// DISCONNECTED
//
bot.on("disconnect", function (){
	console.info(timeStamp()+cc.bgred+" -- DISCORD HELPBOT HAS DISCONNECTED --"+cc.reset)
});
