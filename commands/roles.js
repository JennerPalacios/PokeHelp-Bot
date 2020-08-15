module.exports={
	name: "roles",
	aliases: ["r","role"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember="notMentioned",mentionChannel={},guild=message.guild,channel=message.channel,member=message.member;
		
		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.users.first()){mentionMember=await guild.fetchMember(message.mentions.users.first())}
		
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
				"description": "```md\n"+botConfig.cmdPrefix+"roles count\n"
					+botConfig.cmdPrefix+"roles list\n"
					+botConfig.cmdPrefix+"roles search <roleName>\n"
					+botConfig.cmdPrefix+"role info <roleName>\n"
					+botConfig.cmdPrefix+"role <@mention/id> <roleName>\n"
					+botConfig.cmdPrefix+"role remove <@mention/id> <roleName>```"
			}
		};
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(args[0]==="count" || args[0]==="c"){
					return channel.send("✅ There are **"+guild.roles.size+"** roles on this server, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(args[0]==="list" || args[0]==="l"){
					let rolesList=await guild.roles.map(r=>r.name);rolesList=rolesList.slice(1);
					return channel.send("✅ Role List: ```md\n"+rolesList.join(", ")+"```")
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(args[0]==="info" || args[0]==="i"){
						let actualRoles=guild.roles.map(r=>r.name),actualRolesLowerCase=guild.roles.map(r=>r.name.toLowerCase()),roleSearched=ARGS.slice(1).join(" "),meantThis=[];
						
						let roleFound=guild.roles.find(role=>role.name===roleSearched);
						if(!roleFound){
							let startWord=args[1].slice(0,3).toLowerCase();
							for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
							if(meantThis.length<1){
								startWord=args[1].slice(0,2).toLowerCase();
								for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
							}
							if(meantThis.length<1){
								startWord=args[1].slice(0,1).toLowerCase();
								for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
							}
							if(meantThis.length>0){
								return channel.send("⛔ I couldn't find such role, but I found these **roles**: `"+meantThis.join("`, `")+"`, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							return channel.send("⛔ I couldn't find such role, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							let membersWithRole=[];let searchForMembers=await guild.members.map(m=>{if(m.roles.has(roleFound.id)){membersWithRole.push(m.user.id)}});
							embedMSG={
								"embed":{
									"color": 0x00FF00,
									"title": "📊 Role: "+roleSearched+" » Info 📈",
									"fields": [
										{"name": "ℹ️ Role ID:", "value": "`"+roleFound.id+"`", "inline": false},
										{"name": "🗨️ Mentionable:", "value": "`"+roleFound.mentionable+"`", "inline": false},
										{"name": "👥 MembersWithRole:", "value": "`"+membersWithRole.length+"`", "inline": false}
									]
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
				}
				if(args[0]==="search" || args[0]==="find" || args[0]==="s" || args[0]==="f"){
					if(args.length<2){
						embedMSG={
							"embed": {
								"color": 0xFF0000,
								"title": "ℹ Available Syntax and Arguments ℹ",
								"description": "```md\n"+botConfig.cmdPrefix+"roles search <roleName>```"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					else{
						let actualRoles=guild.roles.map(r=>r.name),actualRolesLowerCase=guild.roles.map(r=>r.name.toLowerCase()),roleSearched=ARGS.slice(1).join(" "),meantThis=[];
						
						let roleFound=guild.roles.find(role=>role.name===roleSearched);
						if(!roleFound){
							let startWord=args[1].slice(0,3).toLowerCase();
							for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
							if(meantThis.length<1){
								startWord=args[1].slice(0,2).toLowerCase();
								for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
							}
							if(meantThis.length<1){
								startWord=args[1].slice(0,1).toLowerCase();
								for(var i=0;i<actualRolesLowerCase.length;i++){if(actualRolesLowerCase[i].startsWith(startWord)){meantThis.push(actualRoles[i])}}
							}
							if(meantThis.length>0){
								return channel.send("⛔ I couldn't find such role, but I found these **roles**: `"+meantThis.join("`, `")+"`, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							return channel.send("⛔ I couldn't find such role, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							return channel.send("✅ I found it, "+member+"! Who would you like to assign this **role** to? Just type: ```md\n"+botConfig.cmdPrefix+"role <@mention/id> "+roleSearched+"```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
				}
				if(args[0]==="remove" || args[0]==="r"){
					if(args.length<3){
						embedMSG={
							"embed": {
								"color": 0xFF0000,
								"title": "ℹ Available Syntax and Arguments ℹ",
								"description": "```md\n"+botConfig.cmdPrefix+"role remove <@mention/id> <roleName>```"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					else{
						if(Number.isInteger(parseInt(args[1]))){if(args[1].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[1]))}}
						if(!mentionMember.id){
							return channel.send("⛔ Please `@mention` a person you want me to remove `"+botConfig.cmdPrefix+"role` from... "+member)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						if(!args[2]){
							return channel.send("🤔 What role do you want me to remove from "+mentionMember+"? "+member)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						let roleSearched=ARGS.slice(2).join(" ");
						let actualRole=guild.roles.find(role=>role.name===roleSearched); 
						if(!actualRole){
							return channel.send("⛔ I couldn't find such role, "+member+"! Please try searching for it first!```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						if(!mentionMember.roles.has(actualRole.id)){
							return channel.send("⛔ This member doesn't have this role, "+member)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							mentionMember.removeRole(actualRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							return channel.send("⚠ "+mentionMember+" have **lost** their role: **"+roleSearched+"** 😅 ")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
				}
				if(Number.isInteger(parseInt(args[0]))){if(args[0].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[0]))}}
				if(!mentionMember.id){
					return channel.send("⚠ Please `@mention` a person you want me to give/remove `"+botConfig.cmdPrefix+"role` to/from...")
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else if(args.length>=2){
					let roleSearched=ARGS.slice(1).join(" ");
					let actualRole=guild.roles.find(role=>role.name===roleSearched); 
					if(!actualRole){
						return channel.send("⚠ I couldn't find such role, please try searching for it first! "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					mentionMember.addRole(actualRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
					return channel.send("👍 "+mentionMember+" has been given the role of: **"+roleSearched+"**, enjoy! 🎉");
				}
			}
		}
	}
};