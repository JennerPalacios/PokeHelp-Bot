pokeTrivia=require("./../data/pokemonTrivia.json");
function shuffle(array) {
	let currentIndex=array.length,temporaryValue,randomIndex;
	while (0!==currentIndex){
		randomIndex=Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue=array[currentIndex];
		array[currentIndex]=array[randomIndex];
		array[randomIndex]=temporaryValue;
	}
	return array;
}
var qTimer=30, qTimerMultiplier=1000, qNumber=[], triviaQA="", triviaAutoState="stopped", singleQuestion="no", muteMember="no",
	roleEnabled="no", temporaryRoleEnabled="no", roleObject="", temporaryRoleObject="", temporaryRoleDays="";
for(let n=0;n<pokeTrivia.length;n++){
	qNumber.push(n)
}
var shuffledTrivia=shuffle(qNumber);
var triviaQA=pokeTrivia[shuffledTrivia[0]];
const filter=response=>{return triviaQA.answers.some(answer=>response.content.toLowerCase().includes(answer.toLowerCase()))};
function triviaLaunch(guild,channel,action,myDB,sqlite,botInfo,timeStamp,cc){
	embedMSG={
		"embed": {
			"color": 0xFF0000,
			"title": "Trivia Category: Pokémon 🤔",
			"description": triviaQA.question,
			"footer": { "text": "⏲ "+qTimer+" seconds to answer" }
		}
	};
	if(action==="pause"){
		triviaAutoState="stopped";
		return channel.send("⏸️ **Trivia has PAUSED**").catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
	}
	if(action==="reset"){
		shuffledTrivia=shuffle(qNumber);
		triviaQA=pokeTrivia[shuffledTrivia[0]];
		return channel.send("Restarting **trivia**, please wait...").catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
	}
	if(action==="resume"){
		triviaAutoState="run";
		return triviaLaunch(guild,channel,"postQuestion");
	}
	if(action==="postQuestion"){
		if(shuffledTrivia.length>0){
			channel.send(embedMSG)
			.then(()=>{
				channel.awaitMessages(filter,{maxMatches:1,time:qTimer*qTimerMultiplier,errors:['time']})
				.then(collected=>{
					if(roleEnabled==="yes"){
						channel.send("🎉 "+collected.first().author+" got the correct answer!\n"
							+"They have gained role: `"+roleObject.name+"`, **Gratz** 👍")
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						guild.members.get(collected.first().author.id).addRole(roleObject)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					if(temporaryRoleEnabled==="yes"){
						let dateMultiplier=86400000;
						if(myDB!=="disabled"){
							myDB.query(`SELECT * FROM PokeHelp_bot.temporaryRoles WHERE userID="${collected.first().author.id}" AND temporaryRole="${temporaryRoleObject.name}" AND guildID="${guild.id}";`,async (error,results)=>{
								if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
								else{
									if(results.length>0){
										let newFinalDate=((temporaryRoleDays)*(dateMultiplier)); newFinalDate=((results[0].endDate*1)+(newFinalDate*1));
										let endDateVal=new Date(); endDateVal.setTime(newFinalDate);
										let finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
										myDB.query(`UPDATE PokeHelp_bot.temporaryRoles SET endDate=?, reminderSent=? WHERE userID="${collected.first().author.id}" AND temporaryRole="${temporaryRoleObject.name}" AND guildID="${guild.id}";`,
											[newFinalDate,"no"],error=>{
												if(error){
													console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);
												}
												else{
													console.log(timeStamp+" "+cc.cyan+collected.first().author.username+cc.reset+"("+cc.lblue+collected.first().author.id+cc.reset
														+")'s "+cc.green+"temporary"+cc.reset+" role: "+cc.green+temporaryRoleObject.name+cc.reset+" has been extended by "
														+cc.green+temporaryRoleDays+" days"+cc.reset+", they have answered a TRIVIA question");
													channel.send("🎉 "+collected.first().author+" got the correct answer! **Gratz** 👍\n"
														+"Their **temporary role**: `"+temporaryRoleObject.name+"` has been extended by **"+temporaryRoleDays+"** more days.\n"
														+"They will lose this role on: `"+finalDate+"`");
												}
											}
										);
									}
									else{
										let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
										let finalDate=((temporaryRoleDays)*(dateMultiplier)); finalDate=((curDate)+(finalDate));
										finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
										myDB.query(`INSERT INTO PokeHelp_bot.temporaryRoles (userID, userName, temporaryRole, guildID, guildName, startDate, endDate, addedByID, addedByName) VALUES (?,?,?,?,?,?,?,?,?)`, 
											[collected.first().author.id, collected.first().author.username, temporaryRoleObject.name, guild.id, guild.name, curDate, finalDate, botInfo.id, botInfo.username],async (error,results)=>{
											if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
										});
										let theirRole=guild.roles.find(role=>role.name===temporaryRoleObject.name);
										guild.members.get(collected.first().author.id).addRole(temporaryRoleObject)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
										console.log(timeStamp+" "+cc.cyan+collected.first().author.username+cc.reset+"("+cc.lblue+collected.first().author.id+cc.reset
											+") was given a "+cc.green+"temporary"+cc.reset+" role: "+cc.green+temporaryRoleObject.name+cc.reset+", they have answered a TRIVIA question");
										channel.send("🎉 "+collected.first().author+" got the correct answer!\n"
											+"They have gained a **temporary role**: `"+temporaryRoleObject.name+"` for `"+temporaryRoleDays+" days`, **Gratz** 👍");
									}
								}
							});
						}
						else{
							sqlite.get(`SELECT * FROM temporaryRoles WHERE userID="${collected.first().author.id}" AND temporaryRole="${temporaryRoleObject.name}" AND guildID="${guild.id}";`)
							.then(row=>{
								if(row){
									let newFinalDate=((temporaryRoleDays)*(dateMultiplier)); newFinalDate=((row.endDate*1)+(newFinalDate*1));
									let endDateVal=new Date(); endDateVal.setTime(newFinalDate);
									let finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
									sqlite.run(`UPDATE temporaryRoles SET endDate=?, reminderSent=? WHERE userID="${collected.first().author.id}" AND temporaryRole="${temporaryRoleObject.name}" AND guildID="${guild.id}";`,
										[newFinalDate,"no"])
									.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporaryRoles"+cc.reset+" table | "+error.message));
									console.log(timeStamp+" "+cc.cyan+collected.first().author.username+cc.reset+"("+cc.lblue+collected.first().author.id+cc.reset
										+")'s "+cc.green+"temporary"+cc.reset+" role: "+cc.green+temporaryRoleObject.name+cc.reset+" has been extended by "
										+cc.green+temporaryRoleDays+" days"+cc.reset+", they have answered a TRIVIA question");
									channel.send("🎉 "+collected.first().author+" got the correct answer! **Gratz** 👍\n"
										+"Their **temporary role**: `"+temporaryRoleObject.name+"` has been extended by **"+temporaryRoleDays+"** more days.\n"
										+"They will lose this role on: `"+finalDate+"`");
								}
								else{
									let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
									let finalDate=((temporaryRoleDays)*(dateMultiplier)); finalDate=((curDate)+(finalDate));
									finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
									sqlite.run(`INSERT INTO temporaryRoles (userID, userName, temporaryRole, guildID, guildName, startDate, endDate, addedByID, addedByName) VALUES (?,?,?,?,?,?,?,?,?)`, 
										[collected.first().author.id, collected.first().author.username, temporaryRoleObject.name, guild.id, guild.name, curDate, finalDate, botInfo.id, botInfo.username]);
									let theirRole=guild.roles.find(role=>role.name===temporaryRoleObject.name);
									guild.members.get(collected.first().author.id).addRole(temporaryRoleObject).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
									console.log(timeStamp+" "+cc.cyan+collected.first().author.username+cc.reset+"("+cc.lblue+collected.first().author.id+cc.reset
										+") was given a "+cc.green+"temporary"+cc.reset+" role: "+cc.green+temporaryRoleObject.name+cc.reset+", they have answered a TRIVIA question");
									channel.send("🎉 "+collected.first().author+" got the correct answer!\n"
										+"They have gained a **temporary role**: `"+temporaryRoleObject.name+"` for `"+temporaryRoleDays+" days`, **Gratz** 👍");
								}
							})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
					if(roleEnabled==="no" && temporaryRoleEnabled==="no"){
						channel.send("🎉 "+collected.first().author+" got the correct answer! **Gratz** 👍")
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
					}
					if(muteMember==="yes"){
						channel.overwritePermissions(collected.first().author,{SEND_MESSAGES: false})
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					shuffledTrivia.shift();
					triviaQA=pokeTrivia[shuffledTrivia[0]];
					if(triviaAutoState==="run"){
						triviaLaunch(guild,channel,"postQuestion",myDB,sqlite,botInfo,timeStamp,cc)
					}
				})
				.catch(collected=>{
					let txt1="**answer**";let txt2="was";
					if(triviaQA.answers.length>1){txt1="**answers**";txt2="were either"}
					if(triviaAutoState==="run" || singleQuestion==="yes"){
						channel.send("👎 Looks like nobody got the answer... 😅 \n »»» The correct "+txt1+" "+txt2+": `"+triviaQA.answers.join(", ")+"`! 😛")
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
					}
					shuffledTrivia.shift();
					triviaQA=pokeTrivia[shuffledTrivia[0]];
					if(triviaAutoState==="run"){
						triviaLaunch(guild,channel,"postQuestion",myDB,sqlite,botInfo,timeStamp,cc)
					}
				})
			})
			.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
		}
		else{
			if(triviaAutoState==="run"){
				channel.send("✅ Trivia has **ENDED**").catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				channel.send("There aren't any more questions, restart with trivia with `"+botConfig.cmdPrefix+"reload trivia`")
				.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
		}
	}
}
function searchRole(wordEntry,guild){
	let actualRoles=guild.roles.map(r=>r.name),actualRolesLowerCase=guild.roles.map(r=>r.name.toLowerCase()),
	roleSearchedLC=wordEntry.toLowerCase(),roleSearched=wordEntry,meantThis=[];
	let roleFound=guild.roles.find(role=>role.name===roleSearched);
	if(!roleFound){
		let startWord=roleSearchedLC.slice(0,3);
		for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
		if(meantThis.length<1){
			startWord=roleSearchedLC.slice(0,2);
			for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
		}
		if(meantThis.length<1){
			startWord=roleSearchedLC.slice(0,1);
			for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
		}
		if(meantThis.length>0){
			return {"error": "⛔ I couldn't find such role, but I found these **roles**: \n`"+meantThis.join("`, `")+"`\nRoles are caseSensitive, you can also include `space`, "}
		}
		else{
			return {"error": "⛔ I couldn't find such role, please try again... "}
		}
	}
	else{
		return roleFound
	}
}



module.exports={
	name: "trivia",
	aliases: ["t","q"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		var myDB="disabled", sqlite="disabled", botInfo=botUsers.get(botConfig.botID);
		if(serverSettings.myDBserver){
			if(serverSettings.myDBserver.enabled==="yes"){
				const mySQL=require("mysql");
				myDB=mySQL.createConnection(serverSettings.myDBserver);
				myDB.connect(error=>{
					if(error){
						console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ACCESS"+cc.cyan+" Database "+cc.reset+"(invalid login)\nRAW: "+error.sqlMessage)
					}
				});
			}
			else{
				sqlite=require("sqlite"); sqlite.open("./database/data.sqlite");
			}
		}
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member,mentionChannel="notMentioned",mentionMember="notMentioned";
			
		// CHECK IF SOMEONE WAS mentionMember AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.users.first()){mentionMember=await guild.fetchMember(message.mentions.users.first())}
		
		// GRAB ADMINS AND MODERATORS
		let adminRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].adminRoleName);
			if(!adminRole){
				adminRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"adminRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].adminRoleName+cc.reset+" for server: "
					+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
		let modRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].modRoleName);
			if(!modRole){
				modRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"modRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].modRoleName+cc.reset+" for server: "
					+cc.lblue+guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
		
		// DEFAULT EMBED MESSAGE
		let embedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "ℹ Available Syntax and Arguments ℹ",
					"description": "```md\n"
						+botConfig.cmdPrefix+"trivia » single question\n"
						+botConfig.cmdPrefix+"trivia auto » start auto\n"
						+botConfig.cmdPrefix+"trivia auto pause » pause trivia\n"
						+botConfig.cmdPrefix+"trivia auto resume » resume trivia\n"
						+botConfig.cmdPrefix+"trivia auto reset » reset all\n"
						+botConfig.cmdPrefix+"trivia <seconds> » set delay\n"
						+botConfig.cmdPrefix+"trivia win reward » adjust rewards\n"
						+botConfig.cmdPrefix+"trivia win <mute/noMute> » mute winners```» Aliases: `!t` or `!q`"
				}
			};
		var randomMsg=[
			"... but I know you can do better 😉", ", way to go! 🙂", ", 🗨 ChitChat much o.O?! 😛",
			"... aint that dandy? 😮", ", 🤔 isn't that coOl?", ", awsome! 🙂 Good job! 👍",
			"... not bad... for a noOb! 😂", "... hah! I more than you!😛", ", 😮 very nice!", ", amazing job! 😍"
			];

		
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(serverSettings.servers[sid].mainChannel){
				if(serverSettings.servers[sid].mainChannel.enabled==="yes"){
					if(serverSettings.servers[sid].mainChannel.channelID===channel.id){
						return channel.send("⛔ You can't use that command here, "+member)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
			}
			if(serverSettings.servers[sid].ignoreChannels){
				if(serverSettings.servers[sid].ignoreChannels.enabled==="yes"){
					if(serverSettings.servers[sid].ignoreChannels.channelIDs.some(chan=>chan===channel.id)){
						return
					}
				}
			}
			if(args.length<1){
				singleQuestion="yes";
				return triviaLaunch(guild,channel,"postQuestion",myDB,sqlite,botInfo,timeStamp,cc);
			}
			else{
				if(args[0]==="auto" || args[0]==="stop" || args[0]==="pause" || args[0]==="resume" || args[0]==="continue"){
					singleQuestion="no";
				}
				if(parseInt(args[0])){
					qTimer=args[0];
					return channel.send("✅ Trivia **timer** has been set to: **"+args[0]+"** seconds!")
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else if(args[0]==="auto"){
					if(args[1]){
						if(args[1]==="reset"){
							return triviaLaunch(guild,channel,"reset");
						}
						if(args[1]==="stop" || args[1]==="pause"){
							return triviaLaunch(guild,channel,"pause");
						}
						if(args[1]==="resume" || args[1]==="continue"){
							return triviaLaunch(guild,channel,"resume");
						}
					}
					triviaAutoState="run"
					return triviaLaunch(guild,channel,"postQuestion",myDB,sqlite,botInfo,timeStamp,cc);
				}
				else if(args[0]==="stop" || args[0]==="pause"){
					return triviaLaunch(guild,channel,"pause");
				}
				else if(args[0]==="resume" || args[0]==="continue"){
					return triviaLaunch(guild,channel,"resume");
				}
				else if(args[0].startsWith("question") || args[0]==="count"){
					return channel.send("✅ There are `"+shuffledTrivia.length+"` questions remaining, "+member)
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
				}
				else if(args[0]==="win"){
					if(args[1]){
						if(args[1]==="mute"){
							muteMember="yes";
							return channel.send("✅ I will mute the `members` that give the correct answer, "+member)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else if(args[1]==="unmute" || args[1]==="nomute"){
							muteMember="no";
							return channel.send("✅ I will **not** mute the `members` that give the **correct** answer, "+member)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else if(args[1].startsWith("reward")){
							if(args[2]){
								if(args[2]==="clear"){
									roleEnabled="no";temporaryRoleEnabled="no";roleObject="";temporaryRoleObject="";temporaryRoleDays="";
									return channel.send("✅ Winning rewards have been **cleared**, "+member)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								if(args[2]==="tr"){
									if(args[3]){
										if(parseInt(args[3])){
											temporaryRoleDays=parseInt(args[3]);
											if(args[4]){
												let getRole=await searchRole(ARGS.slice(4).join(" "),guild);
												if(getRole.error){
													return channel.send(getRole.error+member).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
												}
												else{
													temporaryRoleObject=getRole;temporaryRoleEnabled="yes";
													return channel.send("✅ Got it, I will assign **temporary role**: `"+getRole.name+"` for `"+temporaryRoleDays+" days` to the winners, "+member)
														.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
												}
											}
											else{
												return channel.send("⛔ You forgot to include the `roleName`, "+member
													+"```md\n"+botConfig.cmdPrefix+"trivia win reward tr "+args[3]+" <roleName>```")
													.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
											}
										}
										else{
											return channel.send("⛔ The value after `tr` is meant to be a `number` (number of days), "+member
												+"```md\n"+botConfig.cmdPrefix+"trivia win reward tr <days> <roleName>```")
												.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
										}
									}
									else{
										return channel.send("⛔ You forgot to tell me **how many days**, "+member
											+"```md\n"+botConfig.cmdPrefix+"trivia win reward tr <days> <roleName>```")
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
								}
								else{
									let getRole=await searchRole(ARGS.slice(2).join(" "),guild);
									if(getRole.error){
										return channel.send(getRole.error+member).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
									else{
										roleObject=getRole; roleEnabled="yes";
										return channel.send("✅ Got it, I will assign role: `"+getRole.name+"` to the winners, "+member)
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
								}
							}
							else{
								embedMSG={
									"embed": {
										"color": 0xFF0000,
										"title": "ℹ Available Syntax and Arguments ℹ",
										"description": "```md\n"
											+"# WINNER GAINS A ROLE #\n"
											+botConfig.cmdPrefix+"trivia win reward <roleName>\n"
											+"# WINNER GAINS TEMPORARY ROLE #\n"
											+botConfig.cmdPrefix+"trivia win reward tr <days> <roleName>\n"
											+"# CLEAR REWARD SETTINGS #\n"
											+botConfig.cmdPrefix+"trivia win reward clear```"
									}
								};
								return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
						}
					}
					else{
						embedMSG={
							"embed": {
								"color": 0xFF0000,
								"title": "ℹ Available Syntax and Arguments ℹ",
								"description": "```md\n"
									+"# MUTE/UNMUTE WINNERS #\n"
									+botConfig.cmdPrefix+"trivia win <mute/noMute>\n"
									+"# WINNER GAINS A ROLE #\n"
									+botConfig.cmdPrefix+"trivia win reward <roleName>\n"
									+"# WINNER GAINS TEMPORARY ROLE #\n"
									+botConfig.cmdPrefix+"trivia win reward tr <days> <roleName>\n"
									+"# CLEAR REWARD SETTINGS #\n"
									+botConfig.cmdPrefix+"trivia win reward clear```"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
				else if(args[0]==="help" || args[0]==="info"){
					return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
	}
};
