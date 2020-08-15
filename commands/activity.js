module.exports={
	name: "activity",
	aliases: [],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		var myDB="disabled", sqlite="disabled";
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
		let inactiveLimit=""
		if(serverSettings.servers[sid]){if(serverSettings.servers[sid].chatActivity){
			if(serverSettings.servers[sid].chatActivity.inactiveDaysLimit){inactiveLimit=(serverSettings.servers[sid].chatActivity.inactiveDaysLimit*1);
				if(inactiveLimit<1){inactiveLimit=14;}
			}
		}}if(inactiveLimit===""){inactiveLimit=14;}
		
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
					"description": "```md\n# CHECK SERVER ACTIVITY #\n"
						+botConfig.cmdPrefix+"activity check\n"
						+"# WARN INACTIVE MEMBERS #\n"
						+botConfig.cmdPrefix+"activity -warn\n"
						+"# KICK INACTIVE MEMBERS #\n"
						+botConfig.cmdPrefix+"activity -kick```"
						+"→ Inactivity __allowed__ for: **"+inactiveLimit+"days**"
						+"```md\n"
						+botConfig.cmdPrefix+"activity points [@mention/id]\n"
						+botConfig.cmdPrefix+"activity level [@mention/id]\n"
						+botConfig.cmdPrefix+"activity board```"
				}
			};
		
		let kickedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ YOU HAVE BEEN KICKED ⚠",
					"thumbnail": {"url": globalSettings.images.kicked},
					"description": "**From Server**: "+guild.name+"\n**Reason**: You were inactive in our server. "
						+"We are constantly cleaning our server, getting rid of inactive members, potential spoofers, bots, etc... "
						+"If you do not interact in any of our channels, you are likely to be **kicked** from our server.\n\n"
						+"**By**: ActivityCheck[bot]\n"
						+"**On**: "+timeStampEmbed
				}
			};
			
		let warnembedMSG={
				"embed": {
					"color": 0xFF0000,
					"title": "⚠ THIS IS A WARNING ⚠",
					"thumbnail": {"url": globalSettings.images.warning},
					"description": "**From Server**: "+guild.name+"\n**Reason**: You are currently inactive. "
						+"We will be removing people from our server for inactivity in the near future. "
						+"If you do not interact in any of our channels, you will be **kicked** soon.\n\n"
						+"**By**: ActivityCheck[bot]\n"
						+"**On**: "+timeStampEmbed
				}
			};
		var randomMsg=[
			"... but I know you can do better 😉", ", way to go! 🙂", ", 🗨 ChitChat much o.O?! 😛",
			"... aint that dandy? 😮", ", 🤔 isn't that coOl?", ", awsome! 🙂 Good job! 👍",
			"... not bad... for a noOb! 😂", "... hah! I more than you!😛", ", 😮 very nice!", ", amazing job! 😍"
			];

		function random(list){
			return list[Math.floor(Math.random()*list.length)];
		}
		
		function warnMember(guild,channel,member){
			botUsers.get(member.user.id).send(warnembedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message+"\nMember blocked me or disabled DMs?"));
			console.info(timeStamp+" A warning has been sent to: "+cc.cyan+member.user.username+cc.reset+" from "+cc.purple+guild.name+cc.reset+" for "+cc.red+"INACTIVITY"+cc.reset);//
		}
		function kickMember(guild,channel,member){
			console.info(timeStamp+" Member: "+cc.cyan+member.user.username+cc.reset+" has been "+cc.red+"KICKED"+cc.reset+" from "+cc.purple+guild.name+cc.reset+" for "+cc.red+"INACTIVITY"+cc.reset);//
			let kickLogLocal={
				"embed": {
					"color": 0xFF0000,
					"title": "⛔ \""+member.user.username+"\" WAS KICKED",
					"thumbnail": {"url": globalSettings.images.kicked},
					"description": "**UserID**: `"+member.user.id+"`\n**UserTag**: <@"+member.user.id+">\n"
						+"**Reason**: Member has been inactive for more than "+inactiveLimit+" days\n\n**By**: ActivityCheck[bot]\n**On**: "+timeStampEmbed
				}
			};
			let kickLogCrossServer={
				"embed": {
					"color": 0xFF0000,
					"title": "⛔ \""+member.user.username+"\" WAS KICKED",
					"thumbnail": {"url": globalSettings.images.kicked},
					"description": "**UserID**: `"+member.user.id+"`\n**UserTag**: <@"+member.user.id+">\n"
						+"**From Server**: "+guild.name+"\n**Reason**: Member has been inactive for more than "+inactiveLimit+" days\n\n**By**: ActivityCheck[bot]\n**On**: "+timeStampEmbed
				}
			};
			if(serverSettings.servers[sid].moderationEvents){
				if(serverSettings.servers[sid].moderationEvents.enabled==="yes"){
					botChannels.get(serverSettings.servers[sid].moderationEvents.channelID).send(kickLogLocal).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
			if(serverSettings.moderationEvents){
				if(serverSettings.moderationEvents.enabled==="yes"){
					botChannels.get(serverSettings.moderationEvents.channelID).send(kickLogCrossServer).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
			botUsers.get(member.user.id).send(kickedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
			member.kick("Member has been inactive for more than "+inactiveLimit+" days").catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not kick member...\n"+err.message));
		}
		function parseDate(timeInMilliseconds){
			let lastSeenDate=new Date();lastSeenDate.setTime(timeInMilliseconds);
			return globalSettings.DTdays[lastSeenDate.getDay()]+", "+globalSettings.DTmonths[lastSeenDate.getMonth()]+" "+lastSeenDate.getDate()+", "+lastSeenDate.getFullYear();
		}
		function parseTimeAgo(timeInMilliseconds){
			let totalTimeAgo="",diffMS=new Date().getTime() - timeInMilliseconds;
			let diffSecs=diffMS/1000;let seenSeconds=Math.floor(diffSecs%60);let diffMins=diffSecs/60;let seenMinutes=Math.floor(diffMins%60);
			let diffHrs=diffMins/60;let seenHours=Math.floor(diffHrs%24);let diffDays=diffHrs/24;let seenDays=Math.floor(diffDays%30.41666666666667);
			let diffMonths=diffDays/30.41666666666667;let seenMonths=Math.floor(diffMonths%12);let seenYears=Math.floor(diffMonths/12);
			if(seenYears>0){totalTimeAgo=seenYears+"y "+seenMonths+"mo "+seenDays+"d "+seenHours+"h ago"}
			else if(seenMonths>0){totalTimeAgo=seenMonths+"mo "+seenDays+"d "+seenHours+"h "+seenMinutes+"m ago"}
			else if(seenDays>0){totalTimeAgo=seenDays+"d "+seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"}
			else if(seenHours>0){totalTimeAgo=seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"}
			else if(seenMinutes>0){totalTimeAgo=seenMinutes+"m "+seenSeconds+"s ago"}
			else if(seenSeconds>0){totalTimeAgo=seenSeconds+"s ago"}
			return "`"+totalTimeAgo+"`";
		}
		function parseDaysAgo(timeInMilliseconds){
			let seenDays=new Date().getTime() - timeInMilliseconds;seenDays=Math.floor(seenDays/1000/60/60/24);
			return seenDays;
		}
		
		
		function InactiveExempt(currentMember,guild){
			let exempt=false;
			if(currentMember.user.bot || currentMember.roles.has(modRole.id) || currentMember.roles.has(adminRole.id) || currentMember.id===botConfig.ownerID){
				exempt=true
			}
			if(serverSettings.servers[sid].protectedRoles){
				if(serverSettings.servers[sid].protectedRoles.skipMemberIfRoleIDs){
					if(serverSettings.servers[sid].protectedRoles.skipMemberIfRoleIDs.length>0){
						for(roleName in serverSettings.servers[sid].protectedRoles.skipMemberIfRoleIDs){
							if(exempt){break}
							let memberRole=guild.roles.find(role=>role.id===serverSettings.servers[sid].protectedRoles.skipMemberIfRoleIDs[roleName]);
							exempt=currentMember.roles.has(memberRole.id)
						}
					}
				}
				if(serverSettings.servers[sid].protectedRoles.skipRemovingRoleIDs){
					if(serverSettings.servers[sid].protectedRoles.skipRemovingRoleIDs.length>0){
						for(roleName in serverSettings.servers[sid].protectedRoles.skipRemovingRoleIDs){
							if(exempt){break}
							let memberRole=guild.roles.find(role=>role.id===serverSettings.servers[sid].protectedRoles.skipRemovingRoleIDs[roleName]);
							exempt=currentMember.roles.has(memberRole.id);
						}
					}
				}
			}
			return exempt;
		}
		
		function checkActivity(sid,guild,channel,flag){
			let guildMembers=[],inactiveCount="",totalCount="",warnembedMSG="",n=0,memberCount=1;
			guild.fetchMembers()
			.then(async liveGuild=>{
				let liveMembers=await liveGuild.members.map(m=>{guildMembers.push(m)});
				let currentMilliseconds=1500,millisecondsToAdd=1500;inactiveCount=0;totalCount=guildMembers.length;
				if(flag==="check"){
					channel.send("✅ Okay, I will check **"+totalCount+"** members and their activity on the server, "+member).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(flag==="warn"){
					channel.send("✅ Okay, I will check **"+totalCount+"** members and their activity on the server. If they have been **inactive** for `"
						+inactiveLimit+"` days, I will send them a **warning**, "+member).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(flag==="kick"){
					channel.send("✅ Okay, I will check **"+totalCount+"** members and their activity on the server. If they have been **inactive** for `"
						+inactiveLimit+"` days, I will **kick** them from the server, "+member).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				
				for(var i=0;i<totalCount;i++){
					setTimeout(function(){
						let currentMember=guildMembers[n];
						if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
							console.info(timeStamp+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+totalCount+cc.reset+"] Checking activity for: "
								+cc.cyan+currentMember.user.username+cc.reset+"("+cc.lblue+currentMember.user.id+cc.reset+") from server: "+cc.purple+guild.name+cc.reset);
						}
						
						if(myDB!=="disabled"){
							myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${currentMember.user.id}" AND guildID="${guild.id}";`,async (error,results)=>{
								if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
								else{
									if(results.length<1){
										myDB.query(`INSERT INTO PokeHelp_bot.chatTracker (userID, userName, lastMsg, lastChanID, lastChanName, guildID, guildName, lastDate, points, level) VALUES (?,?,?,?,?,?,?,?,?,?)`, 
											[currentMember.id, currentMember.user.username, "Hello! I'm here", channel.id, channel.name, guild.id, guild.name, currentMember.joinedTimestamp, 1, 0],async (error,results)=>{
											if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
										});
										
										let timeAgo=parseTimeAgo(currentMember.joinedTimestamp),daLastDate=parseDate(currentMember.joinedTimestamp);
										if(!InactiveExempt(currentMember,guild)){
											channel.send("[`"+n+"/"+totalCount+"`] **"+currentMember.user.username+"** has not been seen since we started tracking...\n"
												+"» Adding their `joining date`: **"+daLastDate+"** as the `lastDate` they spoke, which was "+timeAgo)
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
											
											if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
												console.info(timeStamp+cc.red+" Member above is NOT EXEMPT!"+cc.reset+" Joining date was used for the "+cc.purple+"DataBase"+cc.reset);//
											}
											if(flag==="kick"){
												kickMember(guild,channel,currentMember);
											}
											if(flag==="warn"){
												warnMember(guild,channel,currentMember);
											}
											inactiveCount++;
										}
										else{
											if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
												console.info(timeStamp+" "+cc.green+"Member above is EXEMPT!"+cc.reset+" Joining date was used for the "+cc.purple+"DataBase"+cc.reset);//
											}
										}
									}
									else{
										let inactiveDays=parseDaysAgo(results[0].lastDate),timeAgo=parseTimeAgo(results[0].lastDate);let lastSeenDate=parseDate(results[0].lastDate);
										if(inactiveDays>inactiveLimit){
											if(!InactiveExempt(currentMember,guild)){
												inactiveCount++;
												channel.send("⚠ [`"+n+"/"+totalCount+"`] #"+inactiveCount+" **"+currentMember+"** has not been seen since: `"+lastSeenDate+"`, which was "+timeAgo)
												.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
												
												if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
													console.info(timeStamp+" "+cc.red+"Member above is NOT EXEMPT! Inactive for "+inactiveDays+" days");//
												}
												if(flag==="kick"){
													kickMember(guild,channel,currentMember);
												}
												else if(flag==="warn"){
													warnMember(guild,channel,currentMember);
												}
											}
											else{
												if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
													console.info(timeStamp+" "+cc.green+"Member above is EXEMPT!"+cc.reset);//
												}
											}
										}
									}
								}
							})
						}
						else{
							sqlite.get(`SELECT * FROM chatTracker WHERE userID="${currentMember.user.id}" AND guildID="${guild.id}";`)
							.then(async row=>{
								if(!row){
									sqlite.run(`INSERT INTO chatTracker (userID, userName, lastMsg, lastChanID, lastChanName, guildID, guildName, lastDate, points, level) VALUES (?,?,?,?,?,?,?,?,?,?);`,
										[currentMember.id, currentMember.user.username, "Hello! I'm here", channel.id, channel.name, guild.id, guild.name, currentMember.joinedTimestamp, 1, 0])
									.catch(error=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.reset+cc.cyan+" chatTracker"+cc.reset+" table | "+error.message));
									
									let timeAgo=parseTimeAgo(currentMember.joinedTimestamp),daLastDate=parseDate(currentMember.joinedTimestamp);
									if(!InactiveExempt(currentMember,guild)){
										channel.send("[`"+n+"/"+totalCount+"`] **"+currentMember.user.username+"** has not been seen since we started tracking...\n"
											+"» Adding their `joining date`: **"+daLastDate+"** as the `lastDate` they spoke, which was "+timeAgo)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
										
										if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
											console.info(timeStamp+cc.red+" Member above is NOT EXEMPT!"+cc.reset+" Joining date was used for the "+cc.purple+"DataBase"+cc.reset);//
										}
										if(flag==="kick"){
											kickMember(guild,channel,currentMember);
										}
										if(flag==="warn"){
											warnMember(guild,channel,currentMember);
										}
										inactiveCount++;
									}
									else{
										if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
											console.info(timeStamp+" "+cc.green+"Member above is EXEMPT!"+cc.reset+" Joining date was used for the "+cc.purple+"DataBase"+cc.reset);//
										}
									}
								}
								else{
									let inactiveDays=parseDaysAgo(row.lastDate),timeAgo=parseTimeAgo(row.lastDate);let lastSeenDate=parseDate(row.lastDate);
									if(inactiveDays>inactiveLimit){
										if(!InactiveExempt(currentMember,guild)){
											inactiveCount++;
											channel.send("⚠ [`"+n+"/"+totalCount+"`] #"+inactiveCount+" **"+currentMember+"** has not been seen since: `"+lastSeenDate+"`, which was "+timeAgo)
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
											
											if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
												console.info(timeStamp+" "+cc.red+"Member above is NOT EXEMPT! Inactive for "+inactiveDays+" days");//
											}
											if(flag==="kick"){
												kickMember(guild,channel,currentMember);
											}
											else if(flag==="warn"){
												warnMember(guild,channel,currentMember);
											}
										}
										else{
											if(botConfig.consoleLog==="all" || botConfig.consoleLog==="allnochat"){
												console.info(timeStamp+" "+cc.green+"Member above is EXEMPT!"+cc.reset);//
											}
										}
									}
								}
							})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
						n++;memberCount++;
						if(memberCount>totalCount){
							setTimeout(function(){
								channel.send("✅ Done! I have have found a total of **"+inactiveCount+"** members that are completely **inactive**, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							},2000);
						}
					},currentMilliseconds);
					currentMilliseconds=currentMilliseconds+millisecondsToAdd;
				}
			});
		}
		
		
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
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(args[0]==="check"){
					checkActivity(sid,guild,channel,"check");
					return;
				}
				if(args[0]==="-warn"){
					checkActivity(sid,guild,channel,"warn");
					return;
				}
				if(args[0]==="-kick"){
					checkActivity(sid,guild,channel,"kick");
					return;
				}
				if(args[0]==="level"){
					if(args.length>1){
						if(Number.isInteger(parseInt(args[1]))){if(args[1].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[1]))}}
						if(!mentionMember.id){
							return channel.send("⚠ That member could not be found, "+member)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							if(myDB!=="disabled"){
								myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}";`,async (error,results)=>{
									if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
									else{
										if(results.length<1){return message.reply("their current level is 0")}
										else{message.reply("their current level is: **"+results[0].level+"**.")}
									}
								})
							}
							else{
								sqlite.get(`SELECT * FROM chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}";`).then(row => {
									if(!row){return message.reply("their current level is 0")}
									message.reply("their current level is: **"+row.level+"**.");
								}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							}
							return
						}
					}
					else{
						if(myDB!=="disabled"){
							myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${message.author.id}" AND guildID="${guild.id}";`,async (error,results)=>{
								if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
								else{
									if(results.length<1){return message.reply("your current level is 0")}
									else{message.reply("your current level is: **"+results[0].level+"**.")}
								}
							})
						}
						else{
							sqlite.get(`SELECT * FROM chatTracker WHERE userID="${message.author.id}" AND guildID="${guild.id}";`).then(row => {
								if(!row){return message.reply("your current level is 0")};
								message.reply("your current level is: **"+row.level+"**.");
							}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
					}
				}
				if(args[0].startsWith("point")){
					if(args.length>1){
						if(Number.isInteger(parseInt(args[1]))){if(args[1].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[1]))}}
						if(!mentionMember.id){
							return channel.send("⚠ That member could not be found, "+member)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							if(myDB!=="disabled"){
								myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}";`,async (error,results)=>{
									if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
									else{
										if(results.length<1){return message.reply("sadly they do not have any points yet!")}
										else{message.reply("they currently have **"+results[0].points+"** points!")}
									}
								})
							}
							else{
								sqlite.get(`SELECT * FROM chatTracker WHERE userID ="${mentionMember.id}" AND guildID="${guild.id}";`).then(row => {
									if(!row){return message.reply("sadly they do not have any points yet!")}
									message.reply("they currently have **"+row.points+"** points!");
								}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							}
							return
						}
					}
					else{
						if(myDB!=="disabled"){
							myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${message.author.id}" AND guildID="${guild.id}";`,async (error,results)=>{
								if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
								else{
									if(results.length<1){return message.reply("sadly you do not have any points yet!")}
									else{message.reply("you currently have **"+results[0].points+"** points"+randomMsg[Math.floor(Math.random()*randomMsg.length)])}
								}
							})
						}
						else{
							sqlite.get(`SELECT * FROM chatTracker WHERE userID="${message.author.id}" AND guildID="${guild.id}";`).then(row => {
								if(!row){return message.reply("sadly you do not have any points yet!")}
								message.reply("you currently have **"+row.points+"** points"+randomMsg[Math.floor(Math.random()*randomMsg.length)]);
							}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
				}
				if(args[0]==="board"){
					let rowNumber="",boardTxt="",rowSpace="",rowNumb=0,trainerName="",trainerPoints="",trainerLvl="";
					if(myDB!=="disabled"){
						myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker ORDER BY points DESC LIMIT 10;`,async (error,results)=>{
							if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporaryRoles"+cc.reset+" table\nRAW: "+error);}
							else{
								if(results.length<1){return}
								else{
									for(rowNumber="0";rowNumber<results.length;rowNumber++){
										if(guild.members.get(results[rowNumber].userID)){trainerName=guild.members.get(results[rowNumber].userID).user.username}
										else{trainerName=results[rowNumber].userName;if(!results[rowNumber].userName){trainerName="@"+results[rowNumber].userID}}
										
										trainerPoints=results[rowNumber].points; trainerLvl=results[rowNumber].level;
										if(trainerName.length>16){trainerName=trainerName.slice(0,14);trainerName=trainerName+".."}
										if(trainerName.length===15){trainerName=trainerName+" "}
										if(trainerName.length===14){trainerName=trainerName+"  "}
										if(trainerName.length===13){trainerName=trainerName+"   "}
										if(trainerName.length===12){trainerName=trainerName+"    "}
										if(trainerName.length===11){trainerName=trainerName+"     "}
										if(trainerName.length===10){trainerName=trainerName+"      "}
										if(trainerName.length===9){trainerName=trainerName+"       "}
										if(trainerName.length===8){trainerName=trainerName+"        "}
										if(trainerName.length===7){trainerName=trainerName+"         "}
										if(trainerName.length===6){trainerName=trainerName+"          "}
										if(trainerName.length===5){trainerName=trainerName+"           "}
										if(trainerName.length===4){trainerName=trainerName+"            "}
										if(trainerName.length===3){trainerName=trainerName+"             "}
										if(trainerName.length===2){trainerName=trainerName+"              "}
										trainerPoints=Math.floor(trainerPoints);
										if(trainerPoints<10000 && trainerPoints>999){trainerPoints=trainerPoints+" "}
										if(trainerPoints<1000 && trainerPoints>99){trainerPoints=trainerPoints+"  "}
										if(trainerPoints<100 && trainerPoints>9){trainerPoints=trainerPoints+"   "}
										if(trainerPoints<10 && trainerPoints>0){trainerPoints=trainerPoints+"    "}
										if(trainerLvl<100 && trainerLvl>9){trainerLvl=trainerLvl+" "}
										if(trainerLvl<10){trainerLvl=trainerLvl+"  "}
										
										rowNumb++;if(rowNumb<10){rowSpace=" "}boardTxt+="|"+rowSpace+rowNumb+"|"+trainerName+" |"+trainerPoints+"|"+trainerLvl+"|\n";rowSpace="";
									}
									embedMSG={
										"embed": {
											"color": 0x00FF00,
											"title": "ℹ CHAT ACTIVITY LEADER BOARD 📝",
											"description": "```JavaScript\n ## TRAINER            PTS  LVL\n|--|-----------------|-----|---|\n"+boardTxt+"```"
										}
									};
									return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									
									return channel.send("ℹ **CHAT ACTIVITY LEADER BOARD** 📝"
										+"```JavaScript\n ## TRAINER            PTS  LVL\n|--|-----------------|-----|---|\n"+boardTxt+"```")
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
							}
						})
					}
					else{
						sqlite.all(`SELECT * FROM chatTracker ORDER BY points DESC LIMIT 10`).then(rows=>{
							if(!rows){return}
							for(rowNumber="0";rowNumber<rows.length;rowNumber++){
								if(guild.members.get(rows[rowNumber].userID)){trainerName=guild.members.get(rows[rowNumber].userID).user.username}
								else{trainerName=rows[rowNumber].userName;if(!rows[rowNumber].userName){trainerName="@"+rows[rowNumber].userID}}
								
								trainerPoints=rows[rowNumber].points; trainerLvl=rows[rowNumber].level;
								if(trainerName.length>16){trainerName=trainerName.slice(0,14);trainerName=trainerName+".."}
								if(trainerName.length===15){trainerName=trainerName+" "}
								if(trainerName.length===14){trainerName=trainerName+"  "}
								if(trainerName.length===13){trainerName=trainerName+"   "}
								if(trainerName.length===12){trainerName=trainerName+"    "}
								if(trainerName.length===11){trainerName=trainerName+"     "}
								if(trainerName.length===10){trainerName=trainerName+"      "}
								if(trainerName.length===9){trainerName=trainerName+"       "}
								if(trainerName.length===8){trainerName=trainerName+"        "}
								if(trainerName.length===7){trainerName=trainerName+"         "}
								if(trainerName.length===6){trainerName=trainerName+"          "}
								if(trainerName.length===5){trainerName=trainerName+"           "}
								if(trainerName.length===4){trainerName=trainerName+"            "}
								if(trainerName.length===3){trainerName=trainerName+"             "}
								if(trainerName.length===2){trainerName=trainerName+"              "}
								trainerPoints=Math.floor(trainerPoints);
								if(trainerPoints<10000 && trainerPoints>999){trainerPoints=trainerPoints+" "}
								if(trainerPoints<1000 && trainerPoints>99){trainerPoints=trainerPoints+"  "}
								if(trainerPoints<100 && trainerPoints>9){trainerPoints=trainerPoints+"   "}
								if(trainerPoints<10 && trainerPoints>0){trainerPoints=trainerPoints+"    "}
								if(trainerLvl<100 && trainerLvl>9){trainerLvl=trainerLvl+" "}
								if(trainerLvl<10){trainerLvl=trainerLvl+"  "}
								
								rowNumb++;if(rowNumb<10){rowSpace=" "}boardTxt+="|"+rowSpace+rowNumb+"|"+trainerName+" |"+trainerPoints+"|"+trainerLvl+"|\n";rowSpace="";
							}
							embedMSG={
								"embed": {
									"color": 0x00FF00,
									"title": "ℹ CHAT ACTIVITY LEADER BOARD 📝",
									"description": "```JavaScript\n ## TRAINER            PTS  LVL\n|--|-----------------|-----|---|\n"+boardTxt+"```"
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						})
					}
				}
			}
		}
	}
};
