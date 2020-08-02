const request=require("request");
module.exports={
	name: "info",
	aliases: ["i"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		var myDB="disabled", sqlite="disabled";
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
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember="notMentioned",guild=message.guild,channel=message.channel,member=message.member;

		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.users.first()){mentionMember=await guild.fetchMember(message.mentions.users.first())}
		
		
		// DEFAULT EMBED MESSAGE
		let embedMSG={
			"embed": {
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "```md\n"+botConfig.cmdPrefix+"info server\n"
					+botConfig.cmdPrefix+"info <@mention/id>\n"
					+botConfig.cmdPrefix+"info bot```"
			}
		};
		
		if(args.length<1){
			return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
		}
		else{
			if(args[0]==="bot" || mentionMember.id===botConfig.botID){
				request("https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/version.txt",
					function(error,response,body){
						if(error){console.info(error)}
						if(body){
							let gitHubVer=body;
							embedMSG={
								"embed":{
									"color": 0x00FF00,
									"title": "📊 PokéHelp[bot] » Info 📈",
									"thumbnail": {"url": "https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/PokeHelpBot.png"},
									"url": "https://github.com/JennerPalacios/PokeHelp-Bot/",
									"fields": [
										{"name": "🤵 Developer:", "value": "JennerPalacios`#5366`", "inline": true},
										{"name": "🕵 DevUserID:", "value": "`237597448032354304`", "inline": true},
										{"name": "🛃 DevServer:", "value": "Invite: `fJvqFGP`", "inline": true},
										{"name": "💵 DevPayPal:", "value": "`paypal.me/JennerPalacios`", "inline": true},
										{"name": "🤖 BotVersion:", "value": "v"+botConfig.botVersion,"inline": true},
										{"name": "🌐 GitHubVersion:", "value": "v"+gitHubVer,"inline": true},
										{"name": "⚙ Discord.js:", "value": "v"+discordVersion,"inline": true},
										{"name": "📝 Node.js:", "value": processVersion,"inline": true}
									]
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
				);
				return
			}
			if(args[0]==="server"){
				let gDate=guild.createdAt; let gCreatedDate=globalSettings.DTdays[gDate.getDay()]+" "+globalSettings.DTmonths[gDate.getMonth()]+" "+gDate.getDate()+", "+gDate.getFullYear();
				let userBots=guild.members.filter(b => b.user.bot); let txtChannels=[];
				guild.channels.map(c=>{if(c.type==="text"){txtChannels.push(c.name)}});
				embedMSG={
					"embed":{
						"color": 0x00FF00,
						"title": "📊 "+guild.name+" » Info 📈",
						"thumbnail": {"url": guild.iconURL},
						"fields": [
							{"name": "👤 ServerOwner:", "value": "<@"+guild.owner.id+">", "inline": true},
							{"name": "📆 DateCreated:","value": gCreatedDate,"inline": true},
							{"name": "📝 RolesCount:","value": guild.roles.size,"inline": true},
							{"name": "👥 MemberCount:","value": guild.memberCount,"inline": true},
							{"name": "🤖 DiscordBots:","value": userBots.size,"inline": true},
							{"name": "🗒 Channels:","value": txtChannels.length,"inline": true}
						]
					}
				};
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			if(Number.isInteger(parseInt(args[0]))){if(args[0].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[0]))}}
			if(mentionMember.id){
				// COMMON VARIABLES
				let [joinedAt, joinedDT, joinedDate, mRolesName, userRoleCount, roleNames, daysJoined, createdAt, createdDate]=["","","","","","","","",""];

				// MEMBER NICKNAME
				if(!mentionMember.nickname){mentionMember.nickname="No \"/Nick\" yet"}

				// JOINED DATE()
				joinedAt=mentionMember.joinedTimestamp; joinedDT=new Date(); joinedDT.setTime(joinedAt);
				joinedDate=globalSettings.DTdays[joinedDT.getDay()].slice(0,3)+", "+globalSettings.DTmonths[joinedDT.getMonth()].slice(0,3)+" "+joinedDT.getDate()+" "+joinedDT.getFullYear();
				let joined_diffMS=new Date().getTime() - joinedAt;let joinedDateAndDaysSince="";
				let joined_diffSecs=joined_diffMS/1000;let joinedSeconds=Math.floor(joined_diffSecs%60);let joined_diffMins=joined_diffSecs/60;let joinedMinutes=Math.floor(joined_diffMins%60);
				let joined_diffHrs=joined_diffMins/60;let joinedHours=Math.floor(joined_diffHrs%24);let joined_diffDays=joined_diffHrs/24;let joinedDays=Math.floor(joined_diffDays%30.41666666666667);
				let joined_diffMonths=joined_diffDays/30.41666666666667;let joinedMonths=Math.floor(joined_diffMonths%12);let joinedYears=Math.floor(joined_diffMonths/12);
				
				if(joinedYears>0){
					joinedDateAndDaysSince=joinedYears+"y "+joinedMonths+"mo "+joinedDays+"d ago"//"+joinedHours+"h "+joinedMinutes+"m "+joinedSeconds+"s ago"
				}
				else if(joinedMonths>0){
					joinedDateAndDaysSince=joinedMonths+"mo "+joinedDays+"d "+joinedHours+"h ago"//"+joinedMinutes+"m "+joinedSeconds+"s ago"
				}
				else if(joinedDays>0){
					joinedDateAndDaysSince=joinedDays+"d "+joinedHours+"h "+joinedMinutes+"m ago"//"+joinedSeconds+"s ago"
				}
				else if(joinedHours>0){
					joinedDateAndDaysSince=joinedHours+"h "+joinedMinutes+"m "+joinedSeconds+"s ago"
				}
				else if(joinedMinutes>0){
					joinedDateAndDaysSince=joinedMinutes+"m "+joinedSeconds+"s ago"
				}
				else if(joinedSeconds>0){
					joinedDateAndDaysSince=joinedSeconds+"s ago"
				}
				joinedDateAndDaysSince="`"+joinedDate+"`\n(`"+joinedDateAndDaysSince+"`)";

				// ACCOUNT CREATED DATE()
				createdAt=mentionMember.user.createdAt.getTime(); let createdDT=new Date(); createdDT.setTime(createdAt); skipDTcheck="no";
				createdDate=globalSettings.DTdays[createdDT.getDay()].slice(0,3)+", "+globalSettings.DTmonths[createdDT.getMonth()].slice(0,3)+" "+createdDT.getDate()+" "+createdDT.getFullYear();
				let created_diffMS=new Date().getTime() - createdAt;let createdDateAndDaysSince="";
				let created_diffSecs=created_diffMS/1000;let createdSeconds=Math.floor(created_diffSecs%60);let created_diffMins=created_diffSecs/60;let createdMinutes=Math.floor(created_diffMins%60);
				let created_diffHrs=created_diffMins/60;let createdHours=Math.floor(created_diffHrs%24);let created_diffDays=created_diffHrs/24;let createdDays=Math.floor(created_diffDays%30.41666666666667);
				let created_diffMonths=created_diffDays/30.41666666666667;let createdMonths=Math.floor(created_diffMonths%12);let createdYears=Math.floor(created_diffMonths/12);
				
				if(createdYears>0){
					createdDateAndDaysSince=createdYears+"y "+createdMonths+"mo "+createdDays+"d ago"//"+createdHours+"h "+createdMinutes+"m "+createdSeconds+"s ago"
				}
				else if(createdMonths>0){
					createdDateAndDaysSince=createdMonths+"mo "+createdDays+"d "+createdHours+"h ago"//"+createdMinutes+"m "+createdSeconds+"s ago"
				}
				else if(createdDays>0){
					createdDateAndDaysSince=createdDays+"d "+createdHours+"h "+createdMinutes+"m ago"//"+createdSeconds+"s ago"
				}
				else if(createdHours>0){
					createdDateAndDaysSince=createdHours+"h "+createdMinutes+"m "+createdSeconds+"s ago"
				}
				else if(createdMinutes>0){
					createdDateAndDaysSince=createdMinutes+"m "+createdSeconds+"s ago"
				}
				else if(createdSeconds>0){
					createdDateAndDaysSince=createdSeconds+"s ago"
				}
				createdDateAndDaysSince="`"+createdDate+"`\n(`"+createdDateAndDaysSince+"`)";

				// MEMBER ROLES
				mRolesName=await mentionMember.roles.map(r=>r.name);mRolesName=mRolesName.slice(1);
				if(mRolesName.length<1){userRoleCount=0;roleNames="NONE"}else{userRoleCount=mRolesName.length;roleNames=mRolesName.join(", ")}
				
				let dbMemberData="notFound";
				
				if(myDB!=="disabled"){
					myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}";`,async (error,results)=>{
						if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
						else{
							if(results.length>0){
								dbMemberData=results[0];
								let membLastMessage=dbMemberData.lastMsg, membLastSeenChannel="", membLastSeenDate=dbMemberData.lastDate;
								if(dbMemberData.lastChanID!==null && dbMemberData.lastMsgID!==null){
									membLastSeenChannel="<#"+dbMemberData.lastChanID+">\n`Link to MSG:` [HERE](https://discordapp.com/channels/"+dbMemberData.guildID+"/"+dbMemberData.lastChanID+"/"+dbMemberData.lastMsgID+")"
								}
								else if(dbMemberData.lastChanID!==null){
									membLastSeenChannel="<#"+dbMemberData.lastChanID+">"
								}
								else{
									membLastSeenChannel="`#"+dbMemberData.lastChanName+"`"
								}
								// LAST SEEN DATE
								let seenDT=new Date(); seenDT.setTime(membLastSeenDate); skipDTcheck="no"
								let seenHr=seenDT.getHours(); if(seenHr<10){seenHr="0"+seenHr} let seenMin=seenDT.getMinutes(); if(seenMin<10){seenMin="0"+seenMin}
								let seenDate=globalSettings.DTdays[seenDT.getDay()].slice(0,3)+" "+globalSettings.DTmonths[seenDT.getMonth()].slice(0,3)+" "+seenDT.getDate();//+", "+seenDT.getFullYear();
								let seen_diffMS=new Date().getTime() - seenDT;let seenDateAndDaysSince="";
								let seen_diffSecs=seen_diffMS/1000;let seenSeconds=Math.floor(seen_diffSecs%60);let seen_diffMins=seen_diffSecs/60;let seenMinutes=Math.floor(seen_diffMins%60);
								let seen_diffHrs=seen_diffMins/60;let seenHours=Math.floor(seen_diffHrs%24);let seen_diffDays=seen_diffHrs/24;let seenDays=Math.floor(seen_diffDays%30.41666666666667);
								let seen_diffMonths=seen_diffDays/30.41666666666667;let seenMonths=Math.floor(seen_diffMonths%12);let seenYears=Math.floor(seen_diffMonths/12);
								
								if(seenYears>0){
									seenDateAndDaysSince=seenYears+"y "+seenMonths+"mo "+seenDays+"d ago"//"+seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"
								}
								else if(seenMonths>0){
									seenDateAndDaysSince=seenMonths+"mo "+seenDays+"d "+seenHours+"h ago"//"+seenMinutes+"m "+seenSeconds+"s ago"
								}
								else if(seenDays>0){
									seenDateAndDaysSince=seenDays+"d "+seenHours+"h "+seenMinutes+"m ago"//"+seenSeconds+"s ago"
								}
								else if(seenHours>0){
									seenDateAndDaysSince=seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"
								}
								else if(seenMinutes>0){
									seenDateAndDaysSince=seenMinutes+"m "+seenSeconds+"s ago"
								}
								else if(seenSeconds>0){
									seenDateAndDaysSince=seenSeconds+"s ago"
								}
								seenDateAndDaysSince="`"+seenDate+" @ "+seenHr+":"+seenMin+"`\n(`"+seenDateAndDaysSince+"`)";
								embedMSG={
									"embed":{
										"color": 0x00FF00,
										"author": {
											"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+"'s » Info",
											"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
										},
										"thumbnail": {"url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"},
										"fields": [
											{"name": "👥 Nick/AKA", "value": "`"+mentionMember.nickname+"`", "inline": true},
											{"name": "🕵 UserID", "value": "`"+mentionMember.id+"`", "inline": true},
											{"name": "📝 Roles ("+userRoleCount+"):", "value": "`"+roleNames+"`", "inline": false},
											{"name": "📆 JoinedServer:", "value": joinedDateAndDaysSince, "inline": true},
											{"name": "📆 AccountCreated", "value": createdDateAndDaysSince, "inline": true},
											{"name": "\u200B", "value": "\u200B", "inline": false},
											{"name": "👁‍ LastSeenChannel:", "value": membLastSeenChannel, "inline": true},
											{"name": "⏲ LastSeenDate:", "value": seenDateAndDaysSince, "inline": true},
											{"name": "🗨 LastMessageSent:", "value": "```md\n"+membLastMessage+"```", "inline": false}
										]
									}
								};
								return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								.catch(error=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
							}
							else{
								embedMSG={
									"embed":{
										"color": 0x00FF00,
										"author": {
											"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+"'s » UserInfo",
											"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
										},
										"thumbnail": {"url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"},
										"fields": [
											{"name": "⚠ Warning:", "value": "Inactive member! No `lastSeen` data recorded", "inline": false},
											{"name": "👥 Nick/AKA", "value": "`"+mentionMember.nickname+"`", "inline": true},
											{"name": "🕵 UserID", "value": "`"+mentionMember.id+"`", "inline": true},
											{"name": "📝 Roles ("+userRoleCount+")", "value": "`"+roleNames+"`", "inline": false},
											{"name": "📆 JoinedServer", "value": joinedDateAndDaysSince, "inline": true},
											{"name": "📆 AccountCreated", "value": createdDateAndDaysSince, "inline": true}
										]
									}
								};
								return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								.catch(error=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
							}
						}
					});
				}
				else{
					sqlite.get(`SELECT * FROM chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}"`)
					.then(async row=>{
						if(row){
							dbMemberData=row;
							let membLastMessage=dbMemberData.lastMsg, membLastSeenChannel="", membLastSeenDate=dbMemberData.lastDate;
							if(dbMemberData.lastChanID!==null && dbMemberData.lastMsgID!==null){
								membLastSeenChannel="<#"+dbMemberData.lastChanID+">\n`Link to MSG:` [HERE](https://discordapp.com/channels/"+dbMemberData.guildID+"/"+dbMemberData.lastChanID+"/"+dbMemberData.lastMsgID+")"
							}
							else if(dbMemberData.lastChanID!==null){
								membLastSeenChannel="<#"+dbMemberData.lastChanID+">"
							}
							else{
								membLastSeenChannel="`#"+dbMemberData.lastChanName+"`"
							}
							// LAST SEEN DATE
							let seenDT=new Date(); seenDT.setTime(membLastSeenDate); skipDTcheck="no"
							let seenHr=seenDT.getHours(); if(seenHr<10){seenHr="0"+seenHr} let seenMin=seenDT.getMinutes(); if(seenMin<10){seenMin="0"+seenMin}
							let seenDate=globalSettings.DTdays[seenDT.getDay()].slice(0,3)+" "+globalSettings.DTmonths[seenDT.getMonth()].slice(0,3)+" "+seenDT.getDate();//+", "+seenDT.getFullYear();
							let seen_diffMS=new Date().getTime() - seenDT;let seenDateAndDaysSince="";
							let seen_diffSecs=seen_diffMS/1000;let seenSeconds=Math.floor(seen_diffSecs%60);let seen_diffMins=seen_diffSecs/60;let seenMinutes=Math.floor(seen_diffMins%60);
							let seen_diffHrs=seen_diffMins/60;let seenHours=Math.floor(seen_diffHrs%24);let seen_diffDays=seen_diffHrs/24;let seenDays=Math.floor(seen_diffDays%30.41666666666667);
							let seen_diffMonths=seen_diffDays/30.41666666666667;let seenMonths=Math.floor(seen_diffMonths%12);let seenYears=Math.floor(seen_diffMonths/12);
							
							if(seenYears>0){
								seenDateAndDaysSince=seenYears+"y "+seenMonths+"mo "+seenDays+"d ago"//"+seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenMonths>0){
								seenDateAndDaysSince=seenMonths+"mo "+seenDays+"d "+seenHours+"h ago"//"+seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenDays>0){
								seenDateAndDaysSince=seenDays+"d "+seenHours+"h "+seenMinutes+"m ago"//"+seenSeconds+"s ago"
							}
							else if(seenHours>0){
								seenDateAndDaysSince=seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenMinutes>0){
								seenDateAndDaysSince=seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenSeconds>0){
								seenDateAndDaysSince=seenSeconds+"s ago"
							}
							seenDateAndDaysSince="`"+seenDate+" @ "+seenHr+":"+seenMin+"`\n(`"+seenDateAndDaysSince+"`)";
							embedMSG={
								"embed":{
									"color": 0x00FF00,
									"author": {
										"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+"'s » Info",
										"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
									},
									"thumbnail": {"url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"},
									"fields": [
										{"name": "👥 Nick/AKA", "value": "`"+mentionMember.nickname+"`", "inline": true},
										{"name": "🕵 UserID", "value": "`"+mentionMember.id+"`", "inline": true},
										{"name": "📝 Roles ("+userRoleCount+"):", "value": "`"+roleNames+"`", "inline": false},
										{"name": "📆 JoinedServer:", "value": joinedDateAndDaysSince, "inline": true},
										{"name": "📆 AccountCreated", "value": createdDateAndDaysSince, "inline": true},
										{"name": "\u200B", "value": "\u200B", "inline": false},
										{"name": "👁‍ LastSeenChannel:", "value": membLastSeenChannel, "inline": true},
										{"name": "⏲ LastSeenDate:", "value": seenDateAndDaysSince, "inline": true},
										{"name": "🗨 LastMessageSent:", "value": "```md\n"+membLastMessage+"```", "inline": false}
									]
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							.catch(error=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
						}
						else{
							embedMSG={
								"embed":{
									"color": 0x00FF00,
									"author": {
										"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+"'s » UserInfo",
										"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
									},
									"thumbnail": {"url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"},
									"fields": [
										{"name": "⚠ Warning:", "value": "Inactive member! No `lastSeen` data recorded", "inline": false},
										{"name": "👥 Nick/AKA", "value": "`"+mentionMember.nickname+"`", "inline": true},
										{"name": "🕵 UserID", "value": "`"+mentionMember.id+"`", "inline": true},
										{"name": "📝 Roles ("+userRoleCount+")", "value": "`"+roleNames+"`", "inline": false},
										{"name": "📆 JoinedServer", "value": joinedDateAndDaysSince, "inline": true},
										{"name": "📆 AccountCreated", "value": createdDateAndDaysSince, "inline": true}
									]
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							.catch(error=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not send message to channel | "+error.message));
						}
					})
					.catch(error=>{
						console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT"+cc.reset+" items from "+cc.cyan+"chatTracker"+cc.reset+" table | "+error.message);
					});
				}
			}
		}
	}
};
