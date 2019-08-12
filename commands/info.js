const request=require("request");
module.exports={
	name: "info",
	aliases: ["information"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		const sqlite=require("sqlite"); sqlite.open("./database/data.sqlite");
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember={},guild=message.guild,channel=message.channel,member=message.member;

		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.members.first()){mentionMember=message.mentions.members.first()}
		
		
		// DEFAULT EMBED MESSAGE
		let embedMSG={
			"embed": {
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "```md\n"+botConfig.cmdPrefix+"info server\n"
					+botConfig.cmdPrefix+"info <@mention>\n"
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
									"title": "📊 PokéHelp[bot] » rawInfo 📈",
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
						"title": "📊 "+guild.name+" » ServerInfo 📈",
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
			if(mentionMember.id){
				// COMMON VARIABLES
				let [joinedAt, joinedDT, joinedDate, mRolesName, userRoleCount, roleNames, daysJoined, createdAt, createdDate]=["","","","","","","","",""];

				// MEMBER NICKNAME
				if(!mentionMember.nickname){mentionMember.nickname="No \"/Nick\" yet"}

				// JOINED DATE()
				joinedAt=mentionMember.joinedTimestamp; joinedDT=new Date(); joinedDT.setTime(joinedAt);
				joinedDate=globalSettings.DTdays[joinedDT.getDay()]+" "+globalSettings.DTmonths[joinedDT.getMonth()]+" "+joinedDT.getDate()+", "+joinedDT.getFullYear();
				daysJoined=new Date().getTime() - joinedAt; daysJoined=daysJoined/1000/60/60/24; daysJoined=daysJoined.toFixed(0);
				if(daysJoined<1){daysJoined="today"}
				if(daysJoined===1){daysJoined="1 day ago"}
				if(daysJoined>1 && daysJoined<366){daysJoined=daysJoined+" days ago"}
				if(daysJoined>365 && daysJoined<731){daysJoined=daysJoined-365;daysJoined="1 year, "+daysJoined+" days ago"}
				if(daysJoined>730 && daysJoined<1096){daysJoined=daysJoined-730;daysJoined="2 years, "+daysJoined+" days ago"}
				if(daysJoined>1095 && daysJoined<1461){daysJoined=daysJoined-1095;daysJoined="3 years, "+daysJoined+" days ago"}
				if(daysJoined>1460 && daysJoined<1826){daysJoined=daysJoined-1460;daysJoined="4 years, "+daysJoined+" days ago"}

				// ACCOUNT CREATED DATE()
				createdAt=mentionMember.user.createdAt.getTime(); let createdDT=new Date(); createdDT.setTime(createdAt); skipDTcheck="no";
				createdDate=globalSettings.DTdays[createdDT.getDay()]+" "+globalSettings.DTmonths[createdDT.getMonth()]+" "+createdDT.getDate()+", "+createdDT.getFullYear();
				let daysCreated=new Date().getTime() - createdAt; daysCreated=daysCreated/1000/60/60/24; daysCreated=daysCreated.toFixed(0);
				if(daysCreated<1){daysCreated="today"}
				if(daysCreated===1){daysCreated="1 day ago"}
				if(daysCreated>1 && daysCreated<366){daysCreated=daysCreated+" days ago"}
				if(daysCreated>365 && daysCreated<731){daysCreated=daysCreated-365;daysCreated="1 year, "+daysCreated+" days ago"}
				if(daysCreated>730 && daysCreated<1096){daysCreated=daysCreated-730;daysCreated="2 years, "+daysCreated+" days ago"}
				if(daysCreated>1095 && daysCreated<1461){daysCreated=daysCreated-1095;daysCreated="3 years, "+daysCreated+" days ago"}
				if(daysCreated>1460 && daysCreated<1826){daysCreated=daysCreated-1460;daysCreated="4 years, "+daysCreated+" days ago"}

				// MEMBER ROLES
				mRolesName=mentionMember.roles.map(r=>r.name);mRolesName=mRolesName.slice(1);
				if(mRolesName.length<1){userRoleCount=0;roleNames="NONE"}else{userRoleCount=mRolesName.length;roleNames=mRolesName.join(", ")}

				// CHAT TRACKER LAST
				sqlite.get(`SELECT * FROM chatTracker WHERE userID="${mentionMember.id}" AND guildID="${guild.id}"`)
				.then(row=>{
					if(!row){
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
									{"name": "📆 JoinedServer", "value": "`"+joinedDate+"`\n(`"+daysJoined+"`)", "inline": true},
									{"name": "📆 AccountCreated", "value": "`"+createdDate+"`\n(`"+daysCreated+"`)", "inline": true}
								]
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					else{
						let membLastMessage=row.lastMsg, membLastSeenChannel=row.lastChan, membLastSeenDate=row.lastDate;

						// LAST SEEN DATE
						let seenDT=new Date(); seenDT.setTime(membLastSeenDate); skipDTcheck="no"
						let seenHr=seenDT.getHours(); if(seenHr<10){seenHr="0"+seenHr} let seenMin=seenDT.getMinutes(); if(seenMin<10){seenMin="0"+seenMin}
						let seenDate=globalSettings.DTdays[seenDT.getDay()]+" "+globalSettings.DTmonths[seenDT.getMonth()]+" "+seenDT.getDate()+", "+seenDT.getFullYear();
						let seenDays=new Date().getTime() - seenDT; seenDays=seenDays/1000/60/60/24; seenDays=seenDays.toFixed(0);
						
						if(seenDays<1){seenDays="today"}
						if(seenDays===1){seenDays="1 day ago"}
						if(seenDays>1 && seenDays<366){seenDays=seenDays+" days ago"}
						if(seenDays>365 && seenDays<731){seenDays=seenDays-365;seenDays="1 year, "+seenDays+" days ago"}
						if(seenDays>730 && seenDays<1096){seenDays=daysJoined-730;seenDays="2 years, "+seenDays+" days ago"}
						if(seenDays>1095 && seenDays<1461){seenDays=daysJoined-1095;seenDays="3 years, "+seenDays+" days ago"}
						if(seenDays>1460 && seenDays<1826){seenDays=daysJoined-1460;seenDays="4 years, "+seenDays+" days ago"}

						embedMSG={
							"embed":{
								"color": 0x00FF00,
								"author": {
									"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+"'s » UserInfo",
									"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
								},
								"thumbnail": {"url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"},
								"fields": [
									{"name": "👥 Nick/AKA", "value": "`"+mentionMember.nickname+"`", "inline": true},
									{"name": "🕵 UserID", "value": "`"+mentionMember.id+"`", "inline": true},
									{"name": "📝 Roles ("+userRoleCount+"):", "value": "`"+roleNames+"`", "inline": false},
									{"name": "📆 JoinedServer:", "value": "`"+joinedDate+"`\n(`"+daysJoined+"`)", "inline": true},
									{"name": "📆 AccountCreated", "value": "`"+createdDate+"`\n(`"+daysCreated+"`)", "inline": true},
									{"name": "👁‍ LastSeenChannel:", "value": "`#"+membLastSeenChannel+"`", "inline": true},
									{"name": "⏲ LastSeenDate:", "value": "`"+seenDate+"`\n@ `"+seenHr+":"+seenMin+"` (`"+seenDays+"`)", "inline": true},
									{"name": "🗨 LastMessageSent:", "value": "```md\n"+membLastMessage+"```", "inline": true}
								]
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				})
				.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
		}
	}
};
