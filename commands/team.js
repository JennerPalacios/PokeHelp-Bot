module.exports={
	name: "team",
	aliases: ["valor", "instinct", "mystic"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){

		// GRAB COMMAND
		let command=message.content.toLowerCase().split(/ +/)[0]; command=command.slice(botConfig.cmdPrefix.length);
		
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
				"description": "```md\n"+botConfig.cmdPrefix+"team <valor/instinct/mystic>```"
			}
		};

		if(serverSettings.servers[sid].teamRoles){
			if(serverSettings.servers[sid].teamRoles.enabled==="no"){return}
			else{
				let imgSrc="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/pokeTeamsTrans/";
				let imgAmt=["_01.png","_02.png","_03.png","_04.png"];
				let teamProps={
						"valor": {
							"name": "Valor",
							"color": 0xFF0000,
							"suffix": "🔥"
						},
						"instinct": {
							"name": "Instinct",
							"color": 0xF1C40F,
							"suffix": "⚡"
						},
						"mystic": {
							"name": "Mystic",
							"color": 0x2A74F8,
							"suffix": "❄"
						},
						"teams": ["valor", "instinct", "mystic"]
					};
				let daTeamRole="", teamLeadRoles=[], teamLeadIDs=[], teamSuffix="";
				if(teamProps.teams.some(t=>t===command)){args=[command]}
				if(args.length<1){
					if(teamProps.teams.some(t=>serverSettings.servers[sid].teamRoles[t].channelID===channel.id) || serverSettings.servers[sid].teamRoles.channelID===channel.id){
						if(teamProps.teams.some(t=>serverSettings.servers[sid].teamRoles[t].leadRoleIDs.length>0) || teamProps.teams.some(t=>serverSettings.servers[sid].teamRoles[t].leadIDs.length>0)){
							if(teamProps.teams.some(t=>member.roles.has(serverSettings.servers[sid].teamRoles[t].leadRoleIDs)) 
								|| teamProps.teams.some(t=>member.id===serverSettings.servers[sid].teamRoles[t].leadIDs)
								|| member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
								embedMSG={
									"embed": {
										"color": 0xFF0000,
										"title": "ℹ Available Syntax and Arguments ℹ",
										"description": "```md\n"+botConfig.cmdPrefix+"team <mystic/valor/instinct> <@mention>\n"
											+"or:\n"
											+botConfig.cmdPrefix+"mystic <@mention>\n"
											+botConfig.cmdPrefix+"valor <@mention>\n"
											+botConfig.cmdPrefix+"instinct <@mention>\n```"
									}
								};
								return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							else{
								return channel.send("⛔ You are not allowed to use this command "+member+", only **Team Leads**/**CoLeads**!")
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
						}
						else{
							embedMSG={
								"embed": {
									"color": 0xFF0000,
									"title": "ℹ Available Syntax and Arguments ℹ",
									"description": "```md\n"+botConfig.cmdPrefix+"team <mystic/valor/instinct> <@mention>\n"
										+"or:\n"
										+botConfig.cmdPrefix+"mystic <@mention>\n"
										+botConfig.cmdPrefix+"valor <@mention>\n"
										+botConfig.cmdPrefix+"instinct <@mention>\n```"
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
				}
				if(teamProps.teams.some(team=>team===args[0])){
					if(serverSettings.servers[sid].teamRoles[args[0]].suffixEnabled==="yes"){teamSuffix=teamProps[args[0]].suffix}
					daTeamRole=guild.roles.find(role=>role.name===teamProps[args[0]].name);
					if(!daTeamRole){
						return console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Teamrole: "+cc.cyan+teamProps[args[0]].name+cc.reset+" does "
							+cc.red+"not"+cc.reset+" exist in server: "+cc.yellow+guild.name+cc.reset)
					}
					if(serverSettings.servers[sid].teamRoles[args[0]]){
						if(serverSettings.servers[sid].teamRoles[args[0]].channelID){
							if(serverSettings.servers[sid].teamRoles[args[0]].channelID===channel.id){
								if(serverSettings.servers[sid].teamRoles[args[0]].leadRoleIDs.length>0){teamLeadRoles=serverSettings.servers[sid].teamRoles[args[0]].leadRoleIDs}
								if(serverSettings.servers[sid].teamRoles[args[0]].leadIDs.length>0){teamLeadIDs=serverSettings.servers[sid].teamRoles[args[0]].leadIDs}
								if(teamLeadRoles.length>0 || teamLeadIDs.length>0){
									if(teamLeadIDs.some(id=>id.includes(member.id)) || teamLeadRoles.some(id=>member.roles.has(id)) || member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
										if(!mentionMember.id){
											return channel.send("⚠ Please `@mention` a person you want me to a **assign team** for, "+member)
												.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
										}
										else{
											mentionMember.addRole(daTeamRole)
												.then(()=>{
													embedMSG={
														"embed": {
															"color": teamProps[args[0]].color,
															"title": "Welcome \""+mentionMember.user.username+"\"!!!",
															"thumbnail": {"url": imgSrc+teamProps[args[0]].name+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
															"description": mentionMember+" has joined team **"+teamProps[args[0]].name+"**!\n"
																+"**On**: "+timeStampEmbed+"\n**VerifiedBy**: "+member
														}
													};
													channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
													if(serverSettings.servers[sid].teamRoles.suffixEnabled){
														mentionMember.setNickname(mentionMember.user.username+teamProps[args[0]].suffix)
															.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message+" | Member has higher permission/role than bot"))
													}
												})
												.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
											return
										}
									}
									else{
										return channel.send("⛔ You are not allowed to use this command "+member+", only **Team Leads**/**CoLeads**!")
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
								}
								else{
									member.addRole(daTeamRole)
										.then(()=>{
											embedMSG={
												"embed": {
													"color": teamProps[args[0]].color,
													"title": "Welcome \""+member.user.username+"\"!!!",
													"thumbnail": {"url": imgSrc+teamProps[args[0]].name+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
													"description": member+" has joined team **"+teamProps[args[0]].name+"**!"
												}
											};
											channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
											if(serverSettings.servers[sid].teamRoles.suffixEnabled){
												member.setNickname(member.user.username+teamProps[args[0]].suffix)
													.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message+" | Member has higher permission/role than me"))
											}
										})
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
									return
								}
							}
							if(serverSettings.servers[sid].teamRoles.channelID===channel.id){
								return channel.send("⚠ A channel was assigned for team **"+args[0].charAt(0).toUpperCase()+args[0].slice(1)+"**. "
									+"Head over to: <#"+serverSettings.servers[sid].teamRoles[args[0]].channelID+"> and try again, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							return
						}
					}
					if(serverSettings.servers[sid].teamRoles.channelID===channel.id){
						member.addRole(daTeamRole)
							.then(()=>{
								embedMSG={
									"embed": {
										"color": teamProps[args[0]].color,
										"title": "Welcome \""+member.user.username+"\"!!!",
										"thumbnail": {"url": imgSrc+teamProps[args[0]].name+imgAmt[Math.floor(Math.random()*imgAmt.length)]},
										"description": member+" has joined team **"+teamProps[args[0]].name+"**!"
									}
								};
								channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								if(serverSettings.servers[sid].teamRoles.suffixEnabled){
									member.setNickname(member.user.username+teamProps[args[0]].suffix)
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message+" | Member has higher permission/role than me"))
								}
							})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						return
					}
					return
				}
				if(args.length>2 && args[0].startsWith("r")){
					if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
						if(!mentionMember.id){
							return channel.send("Syntax: `"+botConfig.cmdPrefix+"team remove <@mention>` | Removes any team role, "+member)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							let daTeamRoles=["Valor","valor","Instinct","instinct","Mystic","mystic"];
							for(var x="0";x<daTeamRoles.length;x++){
								rRole=guild.roles.find(role=>role.name===daTeamRoles[x]);
								if(rRole){
									if(mentionMember.roles.has(rRole.id)){
										mentionMember.removeRole(rRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
									}
								}
							}
							return channel.send("✅ "+member+", I've removed `ALL` **team** roles from user: "+mentionMember)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
				}
			}
		}
	}
};
