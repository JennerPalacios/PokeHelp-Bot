module.exports={
	name: "post",
	aliases: [],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member,mentionChannel="notMentioned";
		
		// DEFAULT EMBED MESSAGE
		let embedMSG={
			"embed": {
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "```md\n[▼]( for plain message )\n"
					+botConfig.cmdPrefix+"post <#channel> <message>\n"
					+"[▼]( for embed message )\n"
					+botConfig.cmdPrefix+"post <#channel> embed <message>\n"
					+"[▼]( define embed color )\n"
					+botConfig.cmdPrefix+"post <#channel> color:<Hex-color> <message>\n"
					+"[IMPORTANT]: HEX COLOR: NO # SIGN!\n"
					+"# Alternatives for embed #\n"
					+"1. Include (3xAcutes+md) <message>\n"
					+"2. Include <text> (3xAcutes+md) <message>```"
			}
		};
		
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
		
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(serverSettings.servers[sid].mainChannel){
				if(serverSettings.servers[sid].mainChannel.enabled==="yes"){
					if(serverSettings.servers[sid].mainChannel.channelID===channel.id){
						return channel.send("⛔ You can't use that command here, "+member)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
			}
			if(serverSettings.servers[sid].ignoreChannels){
				if(serverSettings.servers[sid].ignoreChannels.enabled==="yes"){
					if(serverSettings.servers[sid].ignoreChannels.channelIDs.some(chan=>chan===channel.id)){
						return
					}
				}
			}
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(message.mentions.channels.first()){mentionChannel=message.mentions.channels.first()}
				if(mentionChannel==="notMentioned"){
					return channel.send("⚠ Please mention a `#channel` to make a post on, "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else{
					let daColor="00FF00", msgContent="", tempMSG="", msgText="", start="", end="", embedEnabled="no";
					start=message.content.indexOf(">");start=start+2;msgContent=message.content.slice(start);
					if(msgContent.indexOf("color:")>-1){
						embedEnabled="yes";tempMSG=msgContent;start=tempMSG.indexOf("color:");end=start+6;
						let colorText=tempMSG.slice(start,end); tempMSG=tempMSG.slice(6); daColor=tempMSG.slice(0,6);
						msgContent=msgContent.replace("color:"+daColor+" ","");
					}
					if(args[1].startsWith("embed")){
						embedEnabled="yes";msgContent=msgContent.replace(" embed","");msgContent=msgContent.replace(" embed\n","");
						msgContent=msgContent.replace("embed\n","");msgContent=msgContent.replace("embed ","");
					}
					
					if(msgContent.indexOf("```md")>-1){
						tempMSG=msgContent;start=tempMSG.indexOf("```md");end=start+6;msgText=tempMSG.slice(0,start);msgContent=tempMSG.slice(end,-3);
						
						embedMSG={
							"embed": {
								"color": parseInt("0x"+daColor),
								"description": msgContent
							}
						};
						if(msgText.length>0){
							mentionChannel.send(msgText,embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
						else{
							mentionChannel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
					}
					else{
						if(embedEnabled==="yes"){
							embedMSG={
								"embed": {
									"color": parseInt("0x"+daColor),
									"description": msgContent
								}
							};
							return mentionChannel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
						else{
							mentionChannel.send(msgContent).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
					}
					
				}
			}
		}
	}
};
