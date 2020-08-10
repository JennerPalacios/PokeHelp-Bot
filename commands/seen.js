module.exports={
	name: "seen",
	aliases: ["lastseen"],
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
				"description": "```md\n"+botConfig.cmdPrefix+"seen <@mention/id>```"
			}
		};
		
		if(args.length<1){
			return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
		}
		else{
			if(Number.isInteger(parseInt(args[0]))){
				if(args[0].length>17){
					mentionMember=await botUsers.get(args[0]) || "notMentioned";
					if(mentionMember==="notMentioned"){
						return channel.send("⚠ Please `@mention` the person you want to check, "+member+"\n "
							+"→ I don't think this member is in this server...")
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					else{
						mentionMember=await guild.fetchMember(botUsers.get(args[0]))
					}
				}
			}
			if(mentionMember==="notMentioned"){
				return channel.send("⚠ Please `@mention` the person you want to check, "+member)
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(myDB!=="disabled"){
					myDB.query(`SELECT * FROM PokeHelp_bot.chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}";`,async (error,results)=>{
						if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" chatTracker"+cc.reset+" table\nRAW: "+error);}
						else{
							if(results.length<1){
								embedMSG={
									"embed":{
										"color": 0x00FF00,
										"author": {
											"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+" » activity",
											"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
										},
										"fields": [
											{"name": "⚠ ERROR:", "value": "Inactive member! I havent seen them since I started tracking or since they joined!", "inline": false}
										]
									}
								};
								return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							else{
								let row=results[0];
								let membLastMessage=row.lastMsg, membLastSeenChannel="", membLastSeenDate=row.lastDate;
								if(row.lastChanID!==null && row.lastMsgID!==null){
									membLastSeenChannel="<#"+row.lastChanID+">\n`Link to MSG:` [HERE](https://discordapp.com/channels/"+row.guildID+"/"+row.lastChanID+"/"+row.lastMsgID+")"
								}
								else if(row.lastChanID!==null){
									membLastSeenChannel="<#"+row.lastChanID+">"
								}
								else{
									membLastSeenChannel="`#"+row.lastChanName+"`"
								}

								// LAST SEEN DATE
								let seenDT=new Date(); seenDT.setTime(membLastSeenDate);
								let seenHr=seenDT.getHours(); if(seenHr<10){seenHr="0"+seenHr} let seenMin=seenDT.getMinutes(); if(seenMin<10){seenMin="0"+seenMin}
								let seenDate=globalSettings.DTdays[seenDT.getDay()].slice(0,3)+", "+globalSettings.DTmonths[seenDT.getMonth()].slice(0,3)+" "+seenDT.getDate();// +", "+seenDT.getFullYear();
								let diffMS=new Date().getTime() - membLastSeenDate;let timeAgo="";
								let diffSecs=diffMS/1000;let seenSeconds=Math.floor(diffSecs%60);let diffMins=diffSecs/60;let seenMinutes=Math.floor(diffMins%60);
								let diffHrs=diffMins/60;let seenHours=Math.floor(diffHrs%24);let diffDays=diffHrs/24;let seenDays=Math.floor(diffDays%30.41666666666667);
								let diffMonths=diffDays/30.41666666666667;let seenMonths=Math.floor(diffMonths%12);let seenYears=Math.floor(diffMonths/12);
								
								if(seenYears>0){
									timeAgo=seenYears+"y "+seenMonths+"mo "+seenDays+"d "+seenHours+"h ago";
								}
								else if(seenMonths>0){
									timeAgo=seenMonths+"mo "+seenDays+"d "+seenHours+"h "+seenMinutes+"m ago";
								}
								else if(seenDays>0){
									timeAgo=seenDays+"d "+seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago";
								}
								else if(seenHours>0){
									timeAgo=seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago";
								}
								else if(seenMinutes>0){
									timeAgo=seenMinutes+"m "+seenSeconds+"s ago";
								}
								else if(seenSeconds>0){
									timeAgo=seenSeconds+"s ago";
								}
								timeAgo="`"+seenDate+" @ "+seenHr+":"+seenMin+"`\n(`"+timeAgo+"`)";
								
								embedMSG={
									"embed":{
										"color": 0x00FF00,
										"author": {
											"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+" » Activity",
											"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
										},
										"fields": [
											{"name": "👁‍ LastSeenChannel:", "value": membLastSeenChannel, "inline": true},
											{"name": "📆 LastSeenDate:", "value": timeAgo, "inline": true},
											{"name": "🗨 LastMessageSent:", "value": "```md\n"+membLastMessage+"```", "inline": false}
										]
									}
								};
								return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							}
						}
					});
				}
				else{
					sqlite.get(`SELECT * FROM chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}"`)
					.then(row=>{
						if(!row){
							embedMSG={
								"embed":{
									"color": 0x00FF00,
									"author": {
										"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+" » activity",
										"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
									},
									"fields": [
										{"name": "⚠ ERROR:", "value": "Inactive member! I havent seen them since I started tracking or since they joined!", "inline": false}
									]
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							let membLastMessage=row.lastMsg, membLastSeenChannel="", membLastSeenDate=row.lastDate;
							if(row.lastChanID!==null && row.lastMsgID!==null){
								membLastSeenChannel="<#"+row.lastChanID+">\n`Link to MSG:` [HERE](https://discordapp.com/channels/"+row.guildID+"/"+row.lastChanID+"/"+row.lastMsgID+")"
							}
							else if(row.lastChanID!==null){
								membLastSeenChannel="<#"+row.lastChanID+">"
							}
							else{
								membLastSeenChannel="`#"+row.lastChanName+"`"
							}

							// LAST SEEN DATE
							let seenDT=new Date(); seenDT.setTime(membLastSeenDate);
							let seenHr=seenDT.getHours(); if(seenHr<10){seenHr="0"+seenHr} let seenMin=seenDT.getMinutes(); if(seenMin<10){seenMin="0"+seenMin}
							let seenDate=globalSettings.DTdays[seenDT.getDay()].slice(0,3)+", "+globalSettings.DTmonths[seenDT.getMonth()].slice(0,3)+" "+seenDT.getDate();// +", "+seenDT.getFullYear();
							let diffMS=new Date().getTime() - membLastSeenDate;let timeAgo="";
							let diffSecs=diffMS/1000;let seenSeconds=Math.floor(diffSecs%60);let diffMins=diffSecs/60;let seenMinutes=Math.floor(diffMins%60);
							let diffHrs=diffMins/60;let seenHours=Math.floor(diffHrs%24);let diffDays=diffHrs/24;let seenDays=Math.floor(diffDays%30.41666666666667);
							let diffMonths=diffDays/30.41666666666667;let seenMonths=Math.floor(diffMonths%12);let seenYears=Math.floor(diffMonths/12);
							
							if(seenYears>0){
								timeAgo=seenYears+"y "+seenMonths+"mo "+seenDays+"d "+seenHours+"h ago"//"+seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenMonths>0){
								timeAgo=seenMonths+"mo "+seenDays+"d "+seenHours+"h "+seenMinutes+"m ago"//"+seenSeconds+"s ago"
							}
							else if(seenDays>0){
								timeAgo=seenDays+"d "+seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenHours>0){
								timeAgo=seenHours+"h "+seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenMinutes>0){
								timeAgo=seenMinutes+"m "+seenSeconds+"s ago"
							}
							else if(seenSeconds>0){
								timeAgo=seenSeconds+"s ago"
							}
							timeAgo="`"+seenDate+" @ "+seenHr+":"+seenMin+"`\n(`"+timeAgo+"`)";
							
							embedMSG={
								"embed":{
									"color": 0x00FF00,
									"author": {
										"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+" » Activity",
										"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
									},
									"fields": [
										{"name": "👁‍ LastSeenChannel:", "value": membLastSeenChannel, "inline": true},
										{"name": "📆 LastSeenDate:", "value": timeAgo, "inline": true},
										{"name": "🗨 LastMessageSent:", "value": "```md\n"+membLastMessage+"```", "inline": false}
									]
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					})
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
				}
			}
		}
	}
};
