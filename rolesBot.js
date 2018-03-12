//
//		CHECK THE LINE BELOW...DO THESE MAKE NO SENSE? ARE THEY RANDOM CHARACTERS?
//
// 		🔴 📵 🗨 📗 🗒 📜 📋 📝 📆 📲 👤 👥 🤖 📥 📤 ✅ ⚠ ⛔ 🚫 ❌ 🔨 🙂 😮 😁 😄 😆 😂 😅 😛 😍 😉 🤔 👍 👎 ❤
//
//		THEN YOU NEED TO ADJUST YOUR SETTINGS!!! "Encoding" » "Encode in UTF-8"
//		... BECAUSE THESE ARE ACTUAL IN-TEXT EMOJIS (WHICH DISCORD ALSO USES)
//
const Discord=require('discord.js');
const config=require('./config/config.json');
const bot=new Discord.Client();

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
// SETTINGS
//


// LOGGING EVENTS TO CONSOLE, CAN ADJUST THROUGH COMMANDS
var verbose="off";

config.token="<BOT_TOKEN_HERE>";

// CHANNELID = PUBLIC CHANNEL, SO THEY CAN SEE THEIR TAG
const servers=[
		{ "serverID": "<SERVER_ID_NUMBER>", "channelID": "<CHANNEL_ID_NUMBER>" },
		{ "serverID": "<SERVER_ID_NUMBER>", "channelID": "<CHANNEL_ID_NUMBER>" }
	];
	
// CHANNEL FOR LOGGING ALL ROLE CHANGES - HIDDEN CHANNEL - ADMINS/MODS ONLY
const rolesChanLogs="<CHANNEL_ID_NUMBER>";


//
// END OF: SETTINGS
//



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
	console.info(timeStamp(2)+"-- DISCORD HELPBOT: "+bot.user.username+", USERS MODULE IS READY --");
});



//
// USER JOIN LISTENER
//
bot.on("guildMemberAdd", member => {	
	// COMMON VARIABLES
	let guild=member.guild; let user=member.user; let guildMember=""; let mRolesName=""; let userRoleCount="";
	
	for(var x="0";x<servers.length;x++){
		if(guild.id!==servers[x].serverID){
			// GET USER FROM SERVER
			guildMember=bot.guilds.get(servers[x].serverID).members.get(user.id);
			
			// USER WAS NOT FOUND IN SERVER
			if(!guildMember){
				if(verbose==="on"){
					console.info(timeStamp(2)+"[ROLES-BOT] User: \""+user.username+"\" ("+user.id+") was not found in server: "+bot.guilds.get(servers[x].serverID).name)
				}
			}
			
			// USER FOUND IN SERVER
			if(guildMember){
				// GRAB ALL ROLES AND SLICE "@everyone"
				mRolesName=bot.guilds.get(servers[x].serverID).members.get(user.id).roles.map(r => r.name);
				mRolesName=mRolesName.slice(1);userRoleCount=mRolesName.length;
				
				// USER HAD NO ROLES
				if(!mRolesName){userRoleCount=0} roleNames="NONE";
				
				// ATTEMPT TO ADD IN SERVER THE ROLES FOUND IN ANOTHER SERVER
				if(userRoleCount!==0){
					roleNames=mRolesName
					for(var r="0";r<userRoleCount;r++){
						let rName=guild.roles.find('name', mRolesName[r]);
						
						// A ROLE WAS NOT FOUND IN ONE OF THE SERVERS
						if(!rName){
							if(verbose==="on"){
								console.info(timeStamp(2)+"[ROLES-BOT] Role: \""+mRolesName[r]+"\" was not found in server: "+bot.guilds.get(servers[x].serverID).name)
							}
							bot.channels.get(rolesChanLogs).send("⚠ I couldn't find role: **"+mRolesName[r]+"** over at `"+guild.name+"`, please make sure it exist, with **exact-same name**!");
						}
						
						// ROLE WAS FOUND - ATTEMPT TO ADD IT
						if(rName){
							guild.members.get(user.id).addRole(rName).catch(console.error);
							bot.channels.get(servers[x].channelID).send("👍 "+user+" has been given the role of: **"+mRolesName[r]+"**, enjoy! 🎉");
						}
					}
				}
			}
		}
	}
});



bot.on("guildMemberUpdate", (oldMember,newMember) => {
	// COMMON VARIABLES
	daGuild=oldMember.guild; let daRole=""; let roleName="";
	
	daGuild.fetchAuditLogs({limit: 1,type: 25})
		.then(auditLog => {
			let masterName=auditLog.entries.map(u=>u.executor.username);let masterID=auditLog.entries.map(u=>u.executor.id);
			let minionName=auditLog.entries.map(u=>u.target.username);let minionID=auditLog.entries.map(u=>u.target.id);
			let action=auditLog.entries.map(u=>u.changes),daRole=auditLog.entries.map(u=>u.changes);
				action=action[0][0].key;action=action.slice(1);let action2="";daRole=daRole[0][0].new[0].name;
				if(action==="add"){action="added"; action2="to"}if(action==="remove"){action="removed"; action2="from"}

			bot.channels.get(rolesChanLogs).send(timeStamp(1)+"**"+masterName+"**(`"+masterID+"`) has **"+action+"** role: "
				+"`"+daRole+"` "+action2+" **"+minionName+"**(`"+minionID+"`) over at `"+daGuild.name+"`");
			
			let daUser=bot.users.get(""+minionID+"");
			for(var x="0";x<servers.length;x++){
				if(daGuild.id!==servers[x].serverID){
					// GET USER FROM SERVER
					guildMember=bot.guilds.get(servers[x].serverID).members.get(""+minionID+"");
					
					// USER WAS NOT FOUND IN SERVER
					if(!guildMember){
						if(verbose==="on"){
							console.info(timeStamp(2)+"[ROLES-BOT] User: \""+daUser.username+"\" ("+daUser.id+") was not found in server: "+bot.guilds.get(servers[x].serverID).name)
						}
					}
					if(guildMember){
						roleName=bot.guilds.get(servers[x].serverID).roles.find('name', daRole);
						if(!roleName){
							if(verbose==="on"){
								console.info(timeStamp(2)+"[ROLES-BOT] I couldn't find role: "+daRole+" in server: "+bot.guilds.get(servers[x].serverID).name)
							}
							bot.channels.get(rolesChanLogs).send("⚠ I couldn't find role: **"+daRole+"** over at `"+bot.guilds.get(servers[x].serverID).name+"`, please make sure it exist, it must have **exact name**!")
						}
						if(roleName && action==="added"){
							if(!guildMember.roles.has(roleName.id)){
								bot.guilds.get(servers[x].serverID).members.get(""+minionID+"").addRole(roleName).catch(console.error);
								bot.channels.get(servers[x].channelID).send("👍 <@"+minionID+"> has been given the role of: **"+daRole+"**, enjoy! 🎉")
							}
						}
						if(roleName && action==="removed"){
							if(guildMember.roles.has(roleName.id)){
								bot.guilds.get(servers[x].serverID).members.get(""+minionID+"").removeRole(roleName).catch(console.error);
								bot.channels.get(servers[x].channelID).send("⚠ <@"+minionID+"> have lost their role of: **"+daRole+"**! 😅")
							}
						}
					}
				}
			}
		});
});



bot.on('message', message => {
	//STOP SCRIPT IF DM/PM
	if(message.channel.type=="dm"){ return }
	
	// GET CHANNEL INFO
	let g=message.guild; let c=message.channel; let m=message.member; let msg=message.content.toLowerCase();
	
	// GET TAGGED USER
	let mentioned=""; if(message.mentions.users.first()){mentioned=message.mentions.users.first();}
	
	// REMOVE LETTER CASE (MAKE ALL LOWERCASE)
	let command=msg.toLowerCase(); command=command.split(" ")[0]; command=command.slice(config.cmdPrefix.length);
	
	// GET ARGUMENTS
	let args=msg.split(" ").slice(1);
	
	// DATE&TIME VALUES
	const DTdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	const DTmonths=["January","February","March","April","May","June","July","August","September","October","November","December"];
	
	
// ############################################################################
// ############################## COMMANDS BEGIN ##############################
// ############################################################################
	
	if(command==="verbose" && m.id===config.ownerID){
		if(args[0]==="roles" && !args[1]){
			message.reply("**Roles**'s verbose logs: **"+verbose+"**")
		}
		if(args[0]==="roles" && args[1]==="on"){
			verbose="on";
			message.reply("I will be logging all `roleEvents()` to the __console__!")
		}
		if(args[0]==="roles" && args[1]==="off"){
			verbose="off";
			message.reply("I will no-longer be logging all `roleEvents()` to the __console__")
		}
	}
	
	if(command==="restart"){
		if(m.id===config.ownerID){
			if(args[0]==="roles"){
				message.reply("Restarting **RolesChecker** (`rolesBot.js`) module... please wait `3` to `5` seconds").then(()=>{ process.exit(1) }).catch(console.error);
			}
		}
	}
	
});



//
// CONNECT BOT TO DISCORD
//
bot.login(config.token);



bot.on('disconnected', function (){
	console.info(timeStamp(2)+'-- Disconnected --');console.log(console.error);
	process.exit(1);
});