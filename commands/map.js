module.exports={
	name: "map",
	aliases: [],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member;
			
		if(serverSettings.servers[sid].mapPokemon){
			if(serverSettings.servers[sid].mapPokemon.url){
				if(serverSettings.servers[sid].mapPokemon.enabled==="yes"){
					return channel.send("[**Our LiveMap**] "+serverSettings.servers[sid].mapPokemon.url)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
		if(serverSettings.mapPokemon){
			if(serverSettings.mapPokemon.url){
				if(serverSettings.mapPokemon.enabled==="yes"){
					return channel.send("[**Our LiveMap**] "+serverSettings.mapPokemon.url)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
			}
		}
	}
};