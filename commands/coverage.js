module.exports={
	name: "coverage",
	aliases: ["coveragemap","covermap","mapcover","mapcoverage"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member;
			
		if(serverSettings.servers[sid].mapCoverage){
			if(serverSettings.servers[sid].mapCoverage.url){
				if(serverSettings.servers[sid].mapCoverage.enabled==="yes"){
					return channel.send("[**Our Coverage Map**] "+serverSettings.servers[sid].mapCoverage.url)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
		if(serverSettings.mapCoverage){
			if(serverSettings.mapCoverage.url){
				if(serverSettings.mapCoverage.enabled==="yes"){
					return channel.send("[**Our Coverage Map**] "+serverSettings.mapCoverage.url)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
	}
};