const request=require("request");
module.exports={
	name: "seen",
	aliases: ["lastseen"],
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
				"description": "```md\n"+botConfig.cmdPrefix+"seen <@mention>```"
			}
		};
		
		if(args.length<1){
			return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
		}
		else{
			if(!mentionMember.id){
				return channel.send("⚠ Please `@mention` the person you want to check, "+member)
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				let skipDTcheck="no";
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
									"name": mentionMember.user.username+"#"+mentionMember.user.discriminator+" » activity",
									"icon_url": "https://cdn.discordapp.com/avatars/"+mentionMember.id+"/"+mentionMember.user.avatar+".png"
								},
								"fields": [
									{"name": "👁‍ LastSeenChannel:", "value": "`#"+membLastSeenChannel+"`", "inline": true},
									{"name": "📆 LastSeenDate:", "value": "`"+seenDate+"`\n@ "+seenHr+":"+seenMin+" (`"+seenDays+"`)", "inline": true},
									{"name": "🗨 LastMessageSent:", "value": "```md\n"+membLastMessage+"```", "inline": false}
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
