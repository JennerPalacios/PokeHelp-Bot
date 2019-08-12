module.exports={
	name: "warn",
	aliases: ["w","warning","warned"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
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
				"description": "```md\n"+botConfig.cmdPrefix+"warn <@mention> [reason]```"
			}
		};
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(!mentionMember.id){
					return channel.send("⚠ Please `@mention` a person you want me to issue a **warning** to, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else{
					message.delete();
					let reasons=ARGS.slice(1).join(" "), modLogChan="", sendToChannelTyped="yes";
					if(!args[1]){
						reasons="Check yourself!"
					}
					embedMSG={
						"embed": {
							"color": 0xFF0000,
							"title": "⚠ THIS IS A WARNING ⚠",
							"thumbnail": {"url": globalSettings.images.warning},
							"description": "**From Server**: "+guild.name+"\n**Reason**: "+reasons+"\n\n**By**: "+member+"\n**On**: "+timeStampEmbed
						}
					};
					mentionMember.send(embedMSG).catch(err=>{
						console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message+" | Member blocked me or disabled DMs?")
					});
					if(serverSettings.servers[sid].moderationEvents){
						if(serverSettings.servers[sid].moderationEvents.channelID===channel.id){
							sendToChannelTyped="no"
						}
					}
					if(serverSettings.moderationEvents){
						if(serverSettings.moderationEvents.channelID===channel.id){
							sendToChannelTyped="no"
						}
					}
					if(sendToChannelTyped==="yes"){
						channel.send("⚠ This is your official warning, "+mentionMember+":",{embed:{color:0xFFAA11,description:reasons}})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					console.log(timeStamp+" "+cc.lblue+mentionMember.user.username+cc.reset+"("+cc.cyan+mentionMember.id+cc.reset
						+") has been "+cc.green+"warned"+cc.reset+" in server: "+cc.purple+guild.name+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
					if(serverSettings.servers[sid].moderationEvents){
						if(serverSettings.servers[sid].moderationEvents.enabled==="yes"){
							if(serverSettings.servers[sid].moderationEvents.warnEvents==="yes"){
								embedMSG={
									"embed": {
										"color": 0xFF0000,
										"title": "⚠ \""+mentionMember.user.username+"\" WAS WARNED",
										"thumbnail": {"url": globalSettings.images.warning},
										"description": "**UserID**: "+mentionMember.id+"\n**UserTag**: "+mentionMember+"\n"
											+"**Reason**: "+reasons+"\n\n**By**: "+member+"\n**On**: "+timeStampEmbed
									}
								};
								botChannels.get(serverSettings.servers[sid].moderationEvents.channelID).send(embedMSG)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
								modLogChan=serverSettings.servers[sid].moderationEvents.channelID;
							}
						}
					}
					if(serverSettings.moderationEvents){
						if(serverSettings.moderationEvents.enabled==="yes"){
							if(serverSettings.moderationEvents.warnEvents==="yes"){
								if(modLogChan!=="" && modLogChan===serverSettings.moderationEvents.channelID){return}
								else{
									embedMSG={
										"embed": {
											"color": 0xFF0000,
											"title": "⚠ \""+mentionMember.user.username+"\" WAS WARNED",
											"thumbnail": {"url": globalSettings.images.warning},
											"description": "**UserID**: "+mentionMember.id+"\n**UserTag**: "+mentionMember+"\n"
												+"**Server**: "+guild.name+"\n**Reason**: "+reasons+"\n\n**By**: "+member+"\n**On**: "+timeStampEmbed
										}
									};
									botChannels.get(serverSettings.moderationEvents.channelID).send(embedMSG)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
							}
						}
					}
				}
			}
		}
	}
};