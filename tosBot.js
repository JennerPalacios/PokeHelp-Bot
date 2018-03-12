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
sql.open("./database/usersAgreed.sqlite");

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
// WELCOME MESSAGE - SECOND PART OF WELCOME MESSAGE, "HEY <USER>", IS FOUND BELOW, AT THE ONJOIN EVENT, SO IT CAN GRAB THE MEMBER'S INFO
//
const welcomeMSG=""
		+", welcome to **"+config.serverName+"**'s Discord!"
		+"\n.\n"
		+"**FIRST:**\n"
		+"Confirm your contact information with **Discord** so you can have read-access to our basic channels; "
		+"our server is **2FA**-enabled (`Two-Factor Authentication`)"
		+"\n.\n"
		+"**THEN:**\n"
		+"Read carefully our **Terms of Service**, and agree to them by typing: `!agree tos`\n"
		+"Also, read our **Rules**; make sure you have clear understanding of our **rules** and accept them by typing: `!accept rules`\n"
		+"-If you have any question, or need clarification about a rule, contact a **Moderator** or **Staff**"
		+"\n.\n"
		+"**LASTLY:**\n"
		+"Enjoy and have fun catching awesome **Pokémon** while using our services. Meet other trainers, "
		+"try to attend our events, and **share** our website and information about our **Discord**\n"
		+"-<@"+config.ownerID+">";
		
		
		
//
// TOS MESSAGE
//
const tosMSG=""
		+"```diff\n- - - TERMS OF SERVICE - - -```"
		+"```md\n"
		
		+"[T1]: No spoofing.\n"
		+"- We have zero tolerance for spoofing, promoting spoofing, defending spoofing, or ties to spoofing.\n"
		
		+"[T2]: No unauthorized advertising.\n"
		+"- This includes other websites, maps, discord servers, accounts for sale, etc.\n"
		
		+"[T3]: No scraping.\n"
		+"- Taking our scan data and sharing it widely means that others are less likely to help support "+config.serverName+" "
		+"and one day that could mean no scans for anybody as it costs hundreds of dollars a month to provide this service.\n"
		
		+"[T4]: No NSFW media.\n"
		+"- Not-Safe-For-Work, Remember that while many of us are older adults, some users are still underage.\n"
		
		+"[T5]: No bigotry, hate speech, or excessive cursing.\n"
		+"- Friendly banter is fine but do not cross the line by making personal attacks. Do not criticize or put down "
		+"others for choosing different goals or strategies in the game.\n"
		+"```";
		
		
		
//
// RULES MESSAGE
//
const rulesMSG=""
		+"```diff\n- - - RULES - - -```"
		+"```md\n"
		
		+"[R1]: No spoofing.\n"
		+"- We have zero tolerance for spoofing, promoting spoofing, defending spoofing, or ties to spoofing.\n"
		
		+"[R2]: No unauthorized advertising.\n"
		+"- This includes other websites, maps, discord servers, accounts for sale, etc.\n"
		
		+"[R3]: No scraping.\n"
		+"- Taking our scan data and sharing it widely means that others are less likely to help support "+config.serverName+" "
		+"and one day that could mean no scans for anybody as it costs hundreds of dollars a month to provide this service.\n"
		
		+"[R4]: No NSFW media.\n"
		+"- Not-Safe-For-Work, Remember that while many of us are older adults, some users are still underage.\n"
		
		+"[R5]: No bigotry, hate speech, or excessive cursing.\n"
		+"- Friendly banter is fine but do not cross the line by making personal attacks. Do not criticize or put down "
		+"others for choosing different goals or strategies in the game."
		+"```";



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
		
		
		
		
//
// ONJOIN EVENT LISTENER
//
bot.on("guildMemberAdd", member => {
	let guild=member.guild; let user=member.user;
	
	if(guild.id===config.serverID && config.welcomeDM==="yes"){
		
		// SEND WELCOME MESSAGE
		bot.users.get(user.id).send("Hey "+user+welcomeMSG);
		
		// SEND TOS AGREEMENT
		if(config.tos.enabled==="yes"){
			bot.users.get(user.id).send(tosMSG);
		}
		
		// SEND RULES AGREEMENT
		if(config.rules.enabled==="yes"){
			bot.users.get(user.id).send(rulesMSG);
		}		
	}
});



// ##########################################################################
// ############################## TEXT MESSAGE ##############################
// ##########################################################################
bot.on('message', message => {
	
	// STOP SCRIPT IF TEXT IS NOT PRIVATE MESSAGE
	if(message.channel.type!=="dm"){ return }
	
	// MAKE SURE ITS A COMMAND
	if(!message.content.startsWith(config.cmdPrefix)) { return }
	
	// GET ROLES FROM CONFIG
	let tosRole=bot.guilds.get(config.serverID).roles.find("name", config.tos.roleNameToGive);
	let rulesRole=bot.guilds.get(config.serverID).roles.find("name", config.rules.roleNameToGive);
	
	// COMMON VARIABLES
	let msg=message.content; let m=message.author;
	
	// REMOVE LETTER CASE (MAKE ALL LOWERCASE)
	let command=msg.toLowerCase(); command=command.split(" ")[0]; command=command.slice(config.cmdPrefix.length);
	
	// GET ARGUMENTS
	let args=msg.split(" ").slice(1);
	
	
	
// ############################## DISPLAY RULES ##############################
	if(command==="rules"){
		message.reply(rulesMSG);
	}
	
	
	
// ############################### DISPLAY TOS ###############################
	if(command==="tos"){
		message.reply(tosMSG);
	}
	
	
	
// ############################## AGREE COMMAND ##############################
	if(command==="agree" || command==="accept"){
		let m=message.author; let userID=m.id; let userName=m.username; let dateTS=new Date();
		
		if(args[0]==="tos"){
			sql.get(`SELECT * FROM tos_table WHERE userID="${userID}"`).then(row => {
				if (!row) {
					sql.run("INSERT INTO tos_table (userID, userName, serverID, serverName, dateAccepted) VALUES (?,?,?,?,?)",
						userID, userName, config.serverName, config.serverID, dateTS);
					bot.guilds.get(config.serverID).members.get(userID).addRole(tosRole).catch(console.error);
					return message.reply("Thank you for accepting our `Terms of Service` agreement, you have been given "
						+"`read`-access to more channels in our server...\n.\n"
						+"Don't forget to read and accept our **Rules** too! (*if you haven't already*)");
				}
				else {
					return message.reply("You **already** accepted to our `Terms of Service` agreement");
				}
			}).catch(() => {
				console.error;
				sql.run("CREATE TABLE IF NOT EXISTS tos_table (userID TEXT,userName TEXT,serverID TEXT,serverName TEXT,dateAccepted TEXT)").then(() => {
					sql.run("INSERT INTO tos_table (userID, userName, serverID, serverName, dateAccepted) VALUES (?,?,?,?,?)",
						userID, userName, config.serverName, config.serverID, dateTS);
					bot.guilds.get(config.serverID).members.get(userID).addRole(tosRole).catch(console.error);
					return message.reply("Thank you for accepting our `Terms of Service` agreement, you have been given "
						+"`read`-access to more channels in our server...\n.\n"
						+"Don't forget to read and accept our **Rules** too! (*if you haven't already*)");
				});
			});
		}
		if(args[0]==="rules"){
			sql.get(`SELECT * FROM rules_table WHERE userID="${userID}"`).then(row => {
				if (!row) {
					sql.run("INSERT INTO rules_table (userID, userName, serverID, serverName, dateAccepted) VALUES (?,?,?,?,?)",
						userID, userName, config.serverName, config.serverID, dateTS);
					bot.guilds.get(config.serverID).members.get(userID).addRole(rulesRole).catch(console.error);
					return message.reply("Thank you for accepting our `Rules`, you have been given `write`-access to our server...\n.\n"
						+"Don't forget to read and accept our **Terms of Service** too! (*if you haven't already*)");
				}
				else {
					return message.reply("You **already** accepted to our `Rules`");
				}
			}).catch(() => {
				console.error;
				sql.run("CREATE TABLE IF NOT EXISTS rules_table (userID TEXT,userName TEXT,serverID TEXT,serverName TEXT,dateAccepted TEXT)").then(() => {
					sql.run("INSERT INTO rules_table (userID, userName, serverID, serverName, dateAccepted) VALUES (?,?,?,?,?)",
						userID, userName, config.serverName, config.serverID, dateTS);
					bot.guilds.get(config.serverID).members.get(userID).addRole(rulesRole).catch(console.error);
					return message.reply("Thank you for accepting our `Rules`, you have been given `write`-access to our server...\n.\n"
						+"Don't forget to read and accept our **Terms of Service** too! (*if you haven't already*)");
				});
			});
		}
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