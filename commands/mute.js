module.exports={
	name: "mute",
	aliases: [],
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
				"description": "```md\n"+botConfig.cmdPrefix+"mute <@mention> [reason]```"
			}
		};
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(!mentionMember.id){
					return channel.send("⚠ Please `@mention` a person you want me to **mute**, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else{
					message.delete();
					let reasons=ARGS.slice(1).join(" "), modLogChan="";
					if(!args[1]){
						reasons="Stop running your mouth!"
					}
					embedMSG={
						"embed": {
							"color": 0xFF0000,
							"title": "🤐 YOU HAVE BEEN MUTED 🤐",
							"thumbnail": {"url": globalSettings.images.muted},
							"description": "**From Server**: "+guild.name+"\n**From Channel**: <#"+channel.id+">\n**Reason**: "+reasons+"\n\n**By**: "+member+"\n**On**: "+timeStampEmbed
						}
					};
					channel.overwritePermissions(mentionMember,{SEND_MESSAGES:false})
					.then(()=>{
						embedMSG={
							"embed": {
								"color": 0xFF0000,
								"title": "🤐 \""+mentionMember.user.username+"\" WAS MUTED",
								"thumbnail": {"url": globalSettings.images.muted},
								"description": "**UserID**: "+mentionMember.id+"\n**UserTag**: "+mentionMember+"\n"
									+"**Channel**: <#"+channel.id+">\n**Reason**: "+reasons+"\n\n**By**: "+member+"\n**On**: "+timeStampEmbed
							}
						};
						channel.send("⚠ "+mentionMember+" has been **MUTED** 🤐",{embed:{color:0xFFAA11,description:reasons}})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						console.log(timeStamp+" "+cc.lblue+mentionMember.user.username+cc.reset+"("+cc.cyan+mentionMember.id+cc.reset
							+") has been "+cc.green+"muted"+cc.reset+" in channel: "+cc.purple+"#"+channel.name+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
						if(serverSettings.servers[sid].moderationEvents){
							if(serverSettings.servers[sid].moderationEvents.enabled==="yes"){
								if(serverSettings.servers[sid].moderationEvents.muteEvents==="yes"){
									botChannels.get(serverSettings.servers[sid].moderationEvents.channelID).send(embedMSG)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
									modLogChan=serverSettings.servers[sid].moderationEvents.channelID
								}
							}
						}
						if(serverSettings.moderationEvents){
							if(serverSettings.moderationEvents.enabled==="yes"){
								if(serverSettings.moderationEvents.muteEvents==="yes"){
									if(modLogChan!=="" && modLogChan===serverSettings.moderationEvents.channelID){return}
									embedMSG={
										"embed": {
											"color": 0xFF0000,
											"title": "🤐 \""+mentionMember.user.username+"\" WAS MUTED",
											"thumbnail": {"url": globalSettings.images.muted},
											"description": "**UserID**: "+mentionMember.id+"\n**UserTag**: "+mentionMember+"\n"
												+"**Server**: "+guild.name+"\n**Channel**: <#"+channel.id+">\n**Reason**: "+reasons+"\n\n**By**: "+member+"\n**On**: "+timeStampEmbed
										}
									};
									botChannels.get(serverSettings.moderationEvents.channelID).send(embedMSG)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
							}
						}
					})
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
	}
};