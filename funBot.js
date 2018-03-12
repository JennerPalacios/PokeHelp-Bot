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
const scoresDB=require("sqlite");
scoresDB.open("./database/scores.sqlite");
const chucknorris=require('./data/chucknorris.json');
const pokeTrivia=require('./data/poketrivia.json');

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
// LOCAL SETTINGS
//
config.trivia={"channelID": ""};

var randomMsg=[
	"... but I know you can do better 😉", ", way to go! 🙂", ", 🗨 ChitChat much o.O?! 😛",
	"... aint that dandy? 😮", ", 🤔 isn't that coOl?", ", awsome! 🙂 Good job! 👍",
	"... not bad... for a noOb! 😂", "... hah! I more than you!😛", ", 😮 very nice!", ", amazing job! 😍"
	];

function random(list){
	return list[Math.floor(Math.random()*list.length)];
}
//
// END OF: LOCAL SETTINGS
//



//
// COMMON VARIABLES, ARRAYS, AND OBJECTS
//
var embedMSG="", skip="", msg1="", msg2="", command="", args="",
	guild="", user="", channel="", mentioned="", channeled="",
	qTimer=60000, item=random(pokeTrivia);

const filter=response=>{
    return item.answers.some(answer=>response.content.toLowerCase().includes(answer.toLowerCase()));
};
// DATE&TIME VALUES
const DTdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DTmonths=["January","February","March","April","May","June","July","August","September","October","November","December"];
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
	console.info(timeStamp(2)+"-- DISCORD HELPBOT: "+bot.user.username+", FUN MODULE IS READY --");
});



// ##########################################################################
// ############################## TEXT MESSAGE ##############################
// ##########################################################################
bot.on('message', message => {
	//STOP SCRIPT IF DM/PM
	if(message.channel.type==="dm"){ return }
	
	if(message.webhookID || message.member && message.member.user.bot===true){ return }
	
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
	
	
//
// CHAT ACTIVITY
//
	let antiAbuse=msg1.split(" ");let points2add=1;
	if(antiAbuse.length>5){
		if(antiAbuse.length>9){points2add=2}if(antiAbuse.length>14){points2add=3}
		if(antiAbuse.length>19){points2add=4}if(antiAbuse.length>24){points2add=5}
		if(antiAbuse.length>29){points2add=6}if(antiAbuse.length>34){points2add=7}
		if(antiAbuse.length>39){points2add=8}if(antiAbuse.length>44){points2add=9}
		if(antiAbuse.length>49){points2add=10}if(antiAbuse.length>54){points2add=11}
		if(antiAbuse.length>59){points2add=12}if(antiAbuse.length>64){points2add=13}
		scoresDB.get(`SELECT * FROM chatScores WHERE userId ="${message.author.id}"`).then(row => {
			if (!row) {
				scoresDB.run("INSERT INTO chatScores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, points2add, 0]);
			} else {
				let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
				if (curLevel > row.level) {
					row.level = curLevel;
					scoresDB.run(`UPDATE chatScores SET points = ${row.points + points2add}, level = ${row.level} WHERE userId = ${message.author.id}`);
					message.reply(`You've leveled up! Your new level is: **${curLevel}**! 🎉 Keep the chat going 👍 !`);
				}
				scoresDB.run(`UPDATE chatScores SET points = ${row.points + points2add} WHERE userId = ${message.author.id}`);
			}
		}).catch(() => {
			console.error;
			scoresDB.run("CREATE TABLE IF NOT EXISTS chatScores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
				scoresDB.run("INSERT INTO chatScores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, points2add, 0]);
			});
		})
	}
	//
	//
	//
	
	
	
//
// TRIVIA
//
	if(command==="trivia"){
		message.delete();
		if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID){
			let questionsCount=pokeTrivia.length;
			let secs=qTimer/1000;
			let chan=config.trivia.channelID;if(!chan){chan="__not set__"}
			if(args[0]){
				if(args[0].startsWith("t")){
					if(args[1]){
						let ms=parseFloat(args[1]);qTimer=ms*1000;
						return channel.send("✅ Trivia **timer** has been set to: **"+args[1]+"** seconds!");
					}
					return channel.send("🤔 How many seconds? `!trivia timer <seconds>`");
				}
				if(args[0].startsWith("c")){
					if(channeled){
						config.trivia.channelID=channeled.id;
						return channel.send("ℹ Trivia **channel** has been set to: <#"+channeled.id+">");
					}
					if(parseFloat(args[1])){
						config.trivia.channelID=args[1];
						return channel.send("ℹ Trivia **channel** has been set to: <#"+args[1]+">");
					}
				}
				if(args[0].startsWith("i")){
					let questionsCount=pokeTrivia.length;
					let secs=qTimer/1000;
					let chan=config.trivia.channelID;if(!chan){chan="__not set__"}
					embedMSG={
						"color": 0xFF0000,
						"title": "ℹ PokeTrivia » Info ℹ",
						"description": "**"+questionsCount+"** questions\n"
							+"**"+secs+"** seconds\n"
							+"**Channel**: <#"+chan+">"
					};
					return channel.send({embed: embedMSG});
				}
				embedMSG={
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "`!q` » start trivia, single **q**uestion\n"
						+"`!trivia timer <seconds>` » set timer in seconds\n"
						+"`!trivia channel <#channel>` » set trivia channel\n"
						+"`!trivia info` » check question count\n"
						+"`!trivia help` » display this message\n"
				};
				return channel.send({embed: embedMSG});
			}
			embedMSG={
				"color": 0xFF0000,
				"title": "ℹ PokeTrivia » Info ℹ",
				"description": "**"+questionsCount+"** questions\n"
					+"**"+secs+"** seconds\n"
					+"**Channel**: <#"+chan+">\n"
					+"`!q` » start trivia, single **q**uestion\n"
					+"`!trivia timer <seconds>` » set timer in seconds\n"
					+"`!trivia channel <#channel>` » set trivia channel\n"
					+"`!trivia info` » check question count\n"
					+"`!trivia help` » display this message"
				};
			return channel.send({embed: embedMSG});
		}
	}
	if(command==="q"){
		if(channel.id===config.trivia.channelID){
			if(user.roles.has(ModR.id) || user.roles.has(AdminR.id) || user.id===config.ownerID || user.id==="344195258776551424"){
				message.delete();
				message.channel.send("🤔 [**Q**] "+item.question+"🤔").then(() => {
					message.channel.awaitMessages(filter, { maxMatches: 1, time: qTimer, errors: ['time'] }).then(collected => {
						message.channel.send("✅ "+collected.first().author+" got the correct answer! **Gratz** 👍");
						userID=collected.first().author.id;
						
						// STORE SCORE TO DATABASE
						scoresDB.get(`SELECT * FROM triviaScores WHERE userId ="${userID}"`).then(row => {
						if (!row) {
							scoresDB.run("INSERT INTO triviaScores (userId, points, level) VALUES (?, ?, ?)", [userID, 1, 0]);
						} else {
							let curLevel = Math.floor(0.3 * Math.sqrt(row.points + 1));
							if (curLevel > row.level) {
								row.level = curLevel;
								scoresDB.run(`UPDATE triviaScores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${userID}`);
								message.channel.send("<@"+userID+">, You've leveled! 🎉 Your level is now: **"+curLevel+"**! 🎉 keep them answers coming!");
							}
							scoresDB.run(`UPDATE triviaScores SET points = ${row.points + 1} WHERE userId = ${userID}`);
							scoresDB.get(`SELECT * FROM triviaScores WHERE userId ="${userID}"`).then(row => {
								if (!row) return;
								message.channel.send("<@"+userID+">, you now have **"+row.points+"** points, keep it going! 👍 ");
							});
						}
					}).catch(() => {
						console.error;
						scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
							scoresDB.run("INSERT INTO triviaScores (userId, points, level) VALUES (?, ?, ?)", [userID, 1, 0]);
						});
					});
						
						item=pokeTrivia[Math.floor(Math.random() * pokeTrivia.length)];
					}).catch(collected=>{
						let txt1="**answer**";let txt2="was";
						if(item.answers.length>1){txt1="**answers**";txt2="were either"}
						message.channel.send('👎 Looks like nobody got the answer... 😅 \n »»» The correct '+txt1+' '+txt2+': `'+item.answers+'`! 😛');
						item=pokeTrivia[Math.floor(Math.random() * pokeTrivia.length)];
					}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
				});
			}
		}
	}
	//
	//
	//
	
	
	
// ############################## CHUCK NORRIS JOKES ##############################
	if(message.mentions.members.first()){
		let mentions=message.mentions.members.first();
		if(mentions.id===config.botID){
			let randomEmoji=["😆","😄","😁","😂","😅"];
			if(message.content.toLowerCase().includes("chuck") || message.content.toLowerCase().includes("norris") ||
			message.content.toLowerCase().includes("Chuck") || message.content.toLowerCase().includes("Norris")){
				return message.channel.send(randomEmoji[Math.floor(Math.random()*randomEmoji.length)]
					+" "+chucknorris.jokes[Math.floor(Math.random()*chucknorris.jokes.length)]
					+" "+randomEmoji[Math.floor(Math.random()*randomEmoji.length)]);
			}
		}
	}
	
	
	
// ############################## LEVEL CHAT OR TRIVIA ##############################
	if(command.startsWith("level")){
		if(!args[0]){
			embedMSG={
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "`!level chat` » personal level\n"
					+"`!level chat @mention`\n"
					+"`!level trivia` » personal level\n"
					+"`!level trivia @mention`\n"
			};
			return channel.send({embed: embedMSG});
		}
		if(args[0]==="chat"){
			if(mentioned){
				scoresDB.get(`SELECT * FROM chatScores WHERE userId ="${mentioned.id}"`).then(row => {
					if (!row) return message.reply("their current level is 0");
					message.reply("their current level is: **"+row.level+"**.");
				}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
				return
			}
			scoresDB.get(`SELECT * FROM chatScores WHERE userId ="${message.author.id}"`).then(row => {
				if (!row) return message.reply("Your current level is 0");
				message.reply("Your current level is: **"+row.level+"**.");
			}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
		}
		if(args[0]==="trivia"){
			if(mentioned){
				scoresDB.get(`SELECT * FROM triviaScores WHERE userId ="${mentioned.id}"`).then(row => {
					if (!row) return message.reply("their current level is 0");
					message.reply("their current level is: **"+row.level+"**.");
				}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
				return
			}
			scoresDB.get(`SELECT * FROM triviaScores WHERE userId ="${message.author.id}"`).then(row => {
				if (!row) return message.reply("Your current level is 0");
				message.reply("Your current level is: **"+row.level+"**.");
			}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
		}
	}
	
	
	
// ############################## SCORES CHAT OR TRIVIA ##############################
	if(command.startsWith("point") || command.startsWith("score")){
		if(!args[0]){
			embedMSG={
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "`!points chat` » personal points\n"
					+"`!points chat @mention`\n"
					+"`!points trivia` » personal points\n"
					+"`!points trivia @mention`\n"
			};
			return channel.send({embed: embedMSG});
		}
		if(args[0]==="chat"){
			if(mentioned){
				scoresDB.get(`SELECT * FROM chatScores WHERE userId ="${mentioned.id}"`).then(row => {
					if (!row) return message.reply("sadly they do not have any points yet!");
					message.reply("they currently have **"+row.points+"** points!");
				}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
				return
			}
			scoresDB.get(`SELECT * FROM chatScores WHERE userId ="${message.author.id}"`).then(row => {
				if (!row) return message.reply("sadly you do not have any points yet!");
				message.reply("you currently have **"+row.points+"** points"+randomMsg[Math.floor(Math.random()*randomMsg.length)]);
			}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
		}
		if(args[0]==="trivia"){
			if(mentioned){
				scoresDB.get(`SELECT * FROM triviaScores WHERE userId ="${mentioned.id}"`).then(row => {
					if (!row) return message.reply("sadly they do not have any points yet!");
					message.reply("they currently have **"+row.points+"** points!");
				}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
				return
			}
			scoresDB.get(`SELECT * FROM triviaScores WHERE userId ="${message.author.id}"`).then(row => {
				if (!row) return message.reply("sadly you do not have any points yet!");
				message.reply("you currently have **"+row.points+"** points"+randomMsg[Math.floor(Math.random()*randomMsg.length)]);
			}).catch(() => {scoresDB.run("CREATE TABLE IF NOT EXISTS triviaScores (userId TEXT, points INTEGER, level INTEGER)")});
		}
	}
	
	
	
// RESTART THIS MODULE
	if(command==="restart" && user.id===config.ownerID && args[0]==="funbot"){
		channel.send("♻ Restarting **FunBot** (`funBot.js`) module... please wait `3` to `5` seconds...").then(()=>{ process.exit(1) }).catch(console.error);
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
