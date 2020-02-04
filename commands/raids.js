module.exports={
	name: "raids",
	aliases: ["raid","raidmap","mapraid"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member;
			
		if(serverSettings.servers[sid].mapRaids){
			if(serverSettings.servers[sid].mapRaids.url){
				if(serverSettings.servers[sid].mapRaids.enabled==="yes"){
					return channel.send("[**Our Live Raids Map**] "+serverSettings.servers[sid].mapRaids.url)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
		if(serverSettings.mapRaids){
			if(serverSettings.mapRaids.url){
				if(serverSettings.mapRaids.enabled==="yes"){
					return channel.send("[**Our Live Raids Map**] "+serverSettings.mapRaids.url)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
	}
};