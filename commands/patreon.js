module.exports={
	name: "patreon",
	aliases: ["subscribe","subscription"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member;
		
		if(serverSettings.servers[sid].patreon){
			if(serverSettings.servers[sid].patreon.url){
				if(serverSettings.servers[sid].patreon.img){
					if(serverSettings.servers[sid].patreon.enabled==="yes"){
						let embedMSG={
							"embed": {
								"color": 0x00FF00,
								"title": "\u00BB\u00BB Click HERE to Subscribe \u00AB\u00AB",
								"url": serverSettings.servers[sid].patreon.url,
								"thumbnail": {"url": serverSettings.servers[sid].patreon.img},
								"description": "(>^.^)> .! Thank you !. <(^.^<)\nYour support is greatly appreciated"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
			}
		}
		if(serverSettings.patreon){
			if(serverSettings.patreon.url){
				if(serverSettings.patreon.img){
					if(serverSettings.patreon.enabled==="yes"){
						let embedMSG={
							"embed": {
								"color": 0x00FF00,
								"title": "\u00BB\u00BB Click HERE to Subscribe \u00AB\u00AB",
								"url": serverSettings.patreon.url,
								"thumbnail": {"url": serverSettings.patreon.img},
								"description": "(>^.^)> .! Thank you !. <(^.^<)\nYour support is greatly appreciated"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
			}
		}
	}
};