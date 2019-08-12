module.exports={
	name: "paypal",
	aliases: ["donate","contribute"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			guild=message.guild,channel=message.channel,member=message.member;
		
		if(serverSettings.servers[sid].paypal){
			if(serverSettings.servers[sid].paypal.url){
				if(serverSettings.servers[sid].paypal.img){
					if(serverSettings.servers[sid].paypal.enabled==="yes"){
						let embedMSG={
							"embed": {
								"color": 0x00FF00,
								"title": "\u00BB\u00BB Click HERE to Subscribe \u00AB\u00AB",
								"url": serverSettings.servers[sid].paypal.url,
								"thumbnail": {"url": serverSettings.servers[sid].paypal.img},
								"description": "(>^.^)> .! Thank you !. <(^.^<)\nYour support is greatly appreciated"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
			}
		}
		if(serverSettings.paypal){
			if(serverSettings.paypal.url){
				if(serverSettings.paypal.img){
					if(serverSettings.paypal.enabled==="yes"){
						let embedMSG={
							"embed": {
								"color": 0x00FF00,
								"title": "\u00BB\u00BB Click HERE to Subscribe \u00AB\u00AB",
								"url": serverSettings.paypal.url,
								"thumbnail": {"url": serverSettings.paypal.img},
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