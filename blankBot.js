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
// const sql = require("sqlite");
// const fs = require("fs");
// const request = require("request");
// sql.open("./database/data.sqlite");

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
	console.info(timeStamp(2)+"-- DISCORD HELPBOT: "+bot.user.username+", CUSTOM MODULE IS READY --");
});process.on('unhandledRejection', console.error);



// ##########################################################################
// ############################## TEXT MESSAGE ##############################
// ##########################################################################
bot.on('message', message => {
	//STOP SCRIPT IF DM/PM
	if(message.channel.type==="dm"){ return }
	
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
	// CUSTOME COMMANDS BELOW
	//
	if(command==="hey"){
		message.reply("I am listening!");
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