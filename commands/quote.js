module.exports={
	name: "quote",
	aliases: ["l2m","ltm","lm","qm"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionChannel="notMentioned",guild=message.guild,channel=message.channel,member=message.member;
		
		
		// DEFAULT EMBED MESSAGE
		let embedMSG={
			"embed": {
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "```md\n"+botConfig.cmdPrefix+"quote <#channel> <msgID>\n-- aliases --\n"
					+botConfig.cmdPrefix+"lm/qm → link/quote message```"
			}
		};
		if(args.length<2){
			return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
		}
		else{
			if(message.mentions.channels.first()){mentionChannel=message.mentions.channels.first()}
			if(mentionChannel==="notMentioned"){
				return channel.send("⚠ Please mention a `#channel` that I'm grabbing the message from, "+member)
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			if(!Number.isInteger(parseInt(args[1]))){
				return channel.send("⚠ Incorrect `messageID` - must be digits, "+member)
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			if(args[1].length<17){
				return channel.send("⚠ Incorrect `messageID` - usually it's 18+ numbers, "+member)
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				await guild.channels.get(mentionChannel.id).fetchMessage(args[1]).then(async msg=>{
					let postedDT=new Date(); postedDT.setTime(msg.createdTimestamp);
					let postedHr=postedDT.getHours(); if(postedHr<10){postedHr="0"+postedHr} let postedMin=postedDT.getMinutes(); if(postedMin<10){postedMin="0"+postedMin}
					let postedDate=globalSettings.DTdays[postedDT.getDay()].slice(0,3)+", "+globalSettings.DTmonths[postedDT.getMonth()].slice(0,3)+" "+postedDT.getDate()+" "+postedDT.getFullYear();
					let posted_diffMS=new Date().getTime() - postedDT;let postedDateAndDaysSince="";
					let posted_diffSecs=posted_diffMS/1000;let postedSeconds=Math.floor(posted_diffSecs%60);let posted_diffMins=posted_diffSecs/60;let postedMinutes=Math.floor(posted_diffMins%60);
					let posted_diffHrs=posted_diffMins/60;let postedHours=Math.floor(posted_diffHrs%24);let posted_diffDays=posted_diffHrs/24;let postedDays=Math.floor(posted_diffDays%30.41666666666667);
					let posted_diffMonths=posted_diffDays/30.41666666666667;let postedMonths=Math.floor(posted_diffMonths%12);let postedYears=Math.floor(posted_diffMonths/12);
					
					if(postedYears>0){
						postedDateAndDaysSince=postedYears+"y "+postedMonths+"mo "+postedDays+"d ago"//"+postedHours+"h "+postedMinutes+"m "+postedSeconds+"s ago"
					}
					else if(postedMonths>0){
						postedDateAndDaysSince=postedMonths+"mo "+postedDays+"d "+postedHours+"h ago"//"+postedMinutes+"m "+postedSeconds+"s ago"
					}
					else if(postedDays>0){
						postedDateAndDaysSince=postedDays+"d "+postedHours+"h "+postedMinutes+"m ago"//"+postedSeconds+"s ago"
					}
					else if(postedHours>0){
						postedDateAndDaysSince=postedHours+"h "+postedMinutes+"m "+postedSeconds+"s ago"
					}
					else if(postedMinutes>0){
						postedDateAndDaysSince=postedMinutes+"m "+postedSeconds+"s ago"
					}
					else if(postedSeconds>0){
						postedDateAndDaysSince=postedSeconds+"s ago"
					}
					postedDateAndDaysSince="`"+postedDate+" @ "+postedHr+":"+postedMin+"`\n(`"+postedDateAndDaysSince+"`)";
					
					let imgURL="";
					
					let hasImage=await msg.attachments.first() || "no";
					if(hasImage!=="no"){
						hasImage=await msg.attachments.first().height || "no";
						if(hasImage!=="no"){
							imgURL=await msg.attachments.first().url;
							imgURL="\n∙\n🖼 Member **uploaded** an [Image]("+imgURL+")";
						}
					}
					
					embedMSG={
						"embed":{
							"color": 0x00FF00,
							"author": {
								"name": msg.author.username+"#"+msg.author.discriminator+" said:",
								"icon_url": "https://cdn.discordapp.com/avatars/"+msg.author.id+"/"+msg.author.avatar+".png"
							},
							"description": msg.content+imgURL,
							"fields": [
								{"name": "📆 MessagePosted:", "value": postedDateAndDaysSince, "inline": true},
								{"name": "🗨 Link to Channel and Message:", "value": "<#"+mentionChannel.id+"> → [MSG, TAP HERE](https://discordapp.com/channels/"+guild.id+"/"+mentionChannel.id+"/"+args[1]+")", "inline": false}
							]
						}
					};
					return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				})
				.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
		}
	}
};
