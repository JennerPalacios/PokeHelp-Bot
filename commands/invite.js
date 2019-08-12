module.exports={
	name: "invite",
	aliases: [],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member;
			
		if(serverSettings.servers[sid].invite){
			if(serverSettings.servers[sid].invite.code){
				if(serverSettings.servers[sid].invite.enabled==="yes"){
					return channel.send("[**"+guild.name+"**] https://discord.gg/"+serverSettings.servers[sid].invite.code)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
		if(serverSettings.invite){
			if(serverSettings.invite.code){
				if(serverSettings.invite.enabled==="yes"){
					return channel.send("[**"+guild.name+"**] https://discord.gg/"+serverSettings.invite.code)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
	}
};