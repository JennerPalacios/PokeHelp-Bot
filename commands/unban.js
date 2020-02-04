module.exports={
	name: "unban",
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
				"description": "```md\n"+botConfig.cmdPrefix+"unban <id>```"
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
					else{
						return channel.send("⚠ Invalid id number, 18 digites minimum, "+member).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
				if(!mentionMember.id){
					return channel.send("⚠ Please input the **ID** number of the person you want me to **unban**, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else{
					message.delete(); let sendToChannelTyped="yes";
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
						channel.send("✅ <@"+mentionMember.id+"> has been **unBanned**.")
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					console.log(timeStamp+" "+cc.lblue+mentionMember.id+cc.reset+" has been "+cc.green+"unBanned"+cc.reset+" from server: "
						+cc.purple+guild.name+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
					return guild.unban(mentionMember.id,"By: "+member.user.username).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message+" | Member isn't banned"))
				}
			}
		}
	}
};