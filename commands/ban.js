module.exports={
	name: "ban",
	aliases: ["b"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		let aliases=["ban","b"];
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember={},guild=message.guild,channel=message.channel,member=message.member;

		// CHECK IF SOMEONE WAS mentionMember AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.members.first()){mentionMember=message.mentions.members.first()}

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
				"description": "```md\n"+botConfig.cmdPrefix+"ban <@mention/id> [reason]```"
			}
		};

		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(Number.isInteger(parseInt(args[0]))){
					if(args[0].length===18){
						mentionMember={id: args[0],user:{username:"<@"+args[0]+">"}}
					}
				}
				if(!mentionMember.id){
					return channel.send("⚠ Please `@mention` a person you want me to **ban**, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else{
					message.delete();
					let reasons=ARGS.slice(1).join(" "), sendToChannelTyped="yes";
					if(!args[1]){
						reasons="Check yourself!"
					}
					embedMSG={
						"embed": {
							"color": 0xFF0000,
							"title": "⚠ YOU HAVE BEEN BANNED ⚠",
							"thumbnail": {"url": globalSettings.images.banned},
							"description": "**From Server**: "+guild.name+"\n**Reason**: "+reasons+"\n\n**By**: "+member+"\n**On**: "+timeStampEmbed
						}
					};
					if(guild.members.get(mentionMember.id)){
						guild.members.get(mentionMember.id).send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message+" | Member blocked me or disabled DMs?"))
					}
					if(serverSettings.servers[sid].moderationEvents){
						if(serverSettings.servers[sid].moderationEvents.enabled==="yes"){
							if(serverSettings.servers[sid].moderationEvents.channelID===channel.id){
								sendToChannelTyped="no"
							}
						}
					}
					if(serverSettings.moderationEvents){
						if(serverSettings.moderationEvents.enabled==="yes"){
							if(serverSettings.moderationEvents.channelID===channel.id){
								sendToChannelTyped="no"
							}
						}
					}
					if(sendToChannelTyped==="yes"){
						channel.send("⚠ <@"+mentionMember.id+"> has been **banned** 🔨 💪",{embed:{color:0xFFAA11,description:reasons}})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					reasons += "|CmdBy: "+member.user.username;
					return guild.ban(mentionMember.id,{days:7,reason:reasons}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
	}
};
