module.exports={
	name: "level",
	aliases: ["lvl"],
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
				"description": "```md\n"+botConfig.cmdPrefix+"level ##```"
			}
		};

		if(serverSettings.servers[sid].levelRoles){
			if(serverSettings.servers[sid].levelRoles.enabled==="no"){
				return
			}
			else{
				let lvlRolesPrefix=serverSettings.servers[sid].levelRoles.rolePrefix;
				let lvlRoles=serverSettings.servers[sid].levelRoles.lvlRoles;
				let newRole="", oldRole="", lvlRoleChans=[], teamLeadRoles=[], teamLeadIDs=[];
				if(serverSettings.servers[sid].teamRoles){
					if(serverSettings.servers[sid].teamRoles.channelID){lvlRoleChans.push(serverSettings.servers[sid].teamRoles.channelID)}
					
					if(serverSettings.servers[sid].teamRoles.valor){
						if(serverSettings.servers[sid].teamRoles.valor.channelID){lvlRoleChans.push(serverSettings.servers[sid].teamRoles.valor.channelID)}
						if(serverSettings.servers[sid].teamRoles.valor.leadRoleIDs){if(serverSettings.servers[sid].teamRoles.valor.leadRoleIDs.length>0){
						teamLeadRoles.push(serverSettings.servers[sid].teamRoles.valor.leadRoleIDs)}}if(serverSettings.servers[sid].teamRoles.valor.leadIDs){
						if(serverSettings.servers[sid].teamRoles.valor.leadIDs.length>0){teamLeadIDs.push(serverSettings.servers[sid].teamRoles.valor.leadIDs)}}
					}
					if(serverSettings.servers[sid].teamRoles.instinct){
						if(serverSettings.servers[sid].teamRoles.instinct.channelID){lvlRoleChans.push(serverSettings.servers[sid].teamRoles.instinct.channelID)}
						if(serverSettings.servers[sid].teamRoles.instinct.leadRoleIDs){if(serverSettings.servers[sid].teamRoles.instinct.leadRoleIDs.length>0){
						teamLeadRoles.push(serverSettings.servers[sid].teamRoles.instinct.leadRoleIDs)}}if(serverSettings.servers[sid].teamRoles.instinct.leadIDs){
						if(serverSettings.servers[sid].teamRoles.instinct.leadIDs.length>0){teamLeadIDs.push(serverSettings.servers[sid].teamRoles.instinct.leadIDs)}}
					}
					if(serverSettings.servers[sid].teamRoles.mystic){
						if(serverSettings.servers[sid].teamRoles.mystic.channelID){lvlRoleChans.push(serverSettings.servers[sid].teamRoles.mystic.channelID)}
						if(serverSettings.servers[sid].teamRoles.mystic.leadRoleIDs){if(serverSettings.servers[sid].teamRoles.mystic.leadRoleIDs.length>0){
						teamLeadRoles.push(serverSettings.servers[sid].teamRoles.mystic.leadRoleIDs)}}if(serverSettings.servers[sid].teamRoles.mystic.leadIDs){
						if(serverSettings.servers[sid].teamRoles.mystic.leadIDs.length>0){teamLeadIDs.push(serverSettings.servers[sid].teamRoles.mystic.leadIDs)}}
					}
				}
				if(serverSettings.servers[sid].levelRoles.selfAssignable==="yes"){
					if(lvlRoleChans.some(chanID=>chanID===channel.id) || serverSettings.servers[sid].levelRoles.channelID===channel.id){
						if(args.length<1){
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						if(!parseFloat(args[0])){
							return channel.send("⛔ Second value is not a number, "+member)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						for(var availbleRole=0;availbleRole<lvlRoles.length;availbleRole++){
							oldRole=guild.roles.find(role => role.name === lvlRolesPrefix+lvlRoles[availbleRole]);
							if(oldRole && member.roles.has(oldRole.id)){
								member.removeRole(oldRole).then(()=>{
									newRole=guild.roles.find(role => role.name === lvlRolesPrefix+args[0]);
									if(newRole){member.addRole(newRole)}
								}).catch(console.error);
							}
						}
						for(var userInput=0;userInput<lvlRoles.length;userInput++){
							if(args[0]===lvlRoles[userInput]){
								newRole=guild.roles.find(role => role.name === lvlRolesPrefix+args[0]);
							}
						}
						if(newRole){
							member.addRole(newRole).catch(console.error);
							return channel.send("🎉 Congratulations to: "+member+"! They are now **Level: "+args[0]+"** 🎉 ")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						return channel.send("⛔ That's not a **valid** level, "+member+"!\nAvailable: `\""+lvlRoles.join("\", \"")+"\"`")
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
				else{
					embedMSG={
						"embed": {
							"color": 0xFF0000,
							"title": "ℹ Available Syntax and Arguments ℹ",
							"description": "```md\n"+botConfig.cmdPrefix+"level <##> <@mention>```"
						}
					};
					if(lvlRoleChans.some(chanID=>chanID===channel.id)){
						if(teamLeadRoles.some(id=>member.roles.has(id)) || teamLeadRoles.some(id=>member.id===id) || member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
							if(args.length<1){
								return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							if(!parseFloat(args[0])){
								return channel.send("⛔ Second value is not a number, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							if(!mentionMember.id){
								return channel.send("⛔ Please `@mention` a person to assign a level, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							for(var availbleRole=0;availbleRole<lvlRoles.length;availbleRole++){
								oldRole=guild.roles.find(role => role.name === lvlRolesPrefix+lvlRoles[availbleRole]);
								if(oldRole && guild.members.get(mentionMember.id).roles.has(oldRole.id)){
									mentionMember.removeRole(oldRole)
										.then(()=>{
											newRole=guild.roles.find(role => role.name === lvlRolesPrefix+args[0]);
											if(newRole){mentionMember.addRole(newRole)}
										})
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
							}
							for(var userInput=0;userInput<lvlRoles.length;userInput++){
								if(args[0]===lvlRoles[userInput]){
									newRole=guild.roles.find(role => role.name === lvlRolesPrefix+args[0]);
								}
							}
							if(newRole){
								mentionMember.addRole(newRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
								return channel.send("🎉 Congratulations to: "+mentionMember+"! They are now **Level: "+args[0]+"** 🎉 ")
							}
							return channel.send("⛔ That's not a **valid** level, "+member+"!\nAvailable: `\""+lvlRoles.join("\", \"")+"\"`")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
					if(serverSettings.servers[sid].levelRoles){
						if(serverSettings.servers[sid].levelRoles.channelID){
							if(serverSettings.servers[sid].levelRoles.channelID===channel.id){
								channel.send("⚠ Level roles are being assigned by **Team** leaders in their respective channels: <#"+lvlRoleChans.join(">, <#")+">")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
						}
					}
				}
			}
		}
	}
};
