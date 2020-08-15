module.exports={
	name: "unmute",
	aliases: [],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember="notMentioned",guild=message.guild,channel=message.channel,member=message.member;
		
		// CHECK IF SOMEONE WAS mentionMember AND THAT USER EXIST WITHIN MY OWN SERVER
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
				"description": "```md\n"+botConfig.cmdPrefix+"unmute <@mention/id>```"
			}
		};
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(args[0]==="all"){
					console.info(timeStamp+" Unmuting ALL members from: "+cc.purple+"#"+channel.name+cc.reset)
					let i=0, chanPerms=await channel.permissionOverwrites.map(perms=>perms.id);
					for(id in chanPerms){
						if(channel.permissionOverwrites.get(chanPerms[id]).type==="member"){
							channel.permissionOverwrites.get(chanPerms[id]).delete()
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							if(botConfig.consoleLog==="all"){
								console.info(timeStamp+" "+cc.cyan+botUsers.get(chanPerms[id]).username+cc.reset+" has been "
									+cc.green+"unmuted"+cc.reset+" from channel: "+cc.purple+"#"+channel.name+cc.reset)
							}
						}
					}
					return channel.send("✅ All members on this channel have been **unmuted**, "+member)
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(Number.isInteger(parseInt(args[0]))){if(args[0].length>17){mentionMember=await guild.fetchMember(botUsers.get(args[0]))}}
				if(!mentionMember.id){
					return channel.send("⚠ Please `@mention` a person you want me to **unmute**, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else{
					if(!channel.permissionOverwrites.get(mentionMember.id)){
						return channel.send("⛔ <@"+mentionMember.id+"> has not been muted in this channel, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					else{
						return channel.permissionOverwrites.get(mentionMember.id).delete()
						.then(()=>{
							console.info(timeStamp+" "+cc.cyan+mentionMember.user.username+cc.reset+" has been "+cc.green+"unmuted"
								+cc.reset+" from channel: "+cc.purple+"#"+channel.name+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.user.id+")")
							return channel.send("✅ "+mentionMember+" can now **type/send** messages again 👍 ... but **don't** abuse it!")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						})
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Member already removed/unmuted?\n"+err.message))
					}
				}
			}
		}
	}
};