module.exports={
	name: "settings",
	aliases: ["set","setting"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),guild=message.guild,channel=message.channel,member=message.member;
		
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
				"description": "```md\n"+botConfig.cmdPrefix+"del <numberOfMessages>```"
			}
		};
		
		/*
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

		if(!args.length){
			let cmds="";
			if(serverSettings.servers[sid].mapPokemon){
				if(serverSettings.servers[sid].mapPokemon.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"map` » for the link to our **Live Web Map**\n"
				}
			}
			else if(serverSettings.mapPokemon){
				if(serverSettings.mapPokemon.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"map` » for the link to our **Live Web Map**\n"
				}
			}
			if(serverSettings.servers[sid].mapRaids){
				if(serverSettings.servers[sid].mapRaids.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"raids` » for the link to our **Raids Web Map**\n"
				}
			}
			else if(serverSettings.mapRaids){
				if(serverSettings.mapRaids.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"raids` » for the link to our **Raids Web Map**\n"
				}
			}
			if(serverSettings.servers[sid].mapCoverage){
				if(serverSettings.servers[sid].mapCoverage.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"coverage`/`"+botConfig.cmdPrefix+"zones` » for a map of our **coverage/zones**\n"
				}
			}
			else if(serverSettings.mapCoverage){
				if(serverSettings.mapCoverage.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"coverage`/`"+botConfig.cmdPrefix+"zones` » for a map of our **coverage/zones**\n"
				}
			}
			if(serverSettings.servers[sid].invite){
				if(serverSettings.servers[sid].invite.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"invite` » for our discord **invite** link\n"
				}
			}
			else if(serverSettings.invite){
				if(serverSettings.invite.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"invite` » for our discord **invite** link\n"
				}
			}
			if(serverSettings.servers[sid].patreon){
				if(serverSettings.servers[sid].patreon.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"subscribe`/`"+botConfig.cmdPrefix+"patreon` » for a link to our **Patreon** [to subscribe]\n"
				}
			}
			else if(serverSettings.patreon){
				if(serverSettings.patreon.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"subscribe`/`"+botConfig.cmdPrefix+"patreon` » for a link to our **Patreon** [to subscribe]\n"
				}
			}
			if(serverSettings.servers[sid].paypal){
				if(serverSettings.servers[sid].paypal.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"donate`/`"+botConfig.cmdPrefix+"paypal` » for a link to our **PayPal** [for extra support]\n"
				}
			}
			else if(serverSettings.paypal){
				if(serverSettings.paypal.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"donate`/`"+botConfig.cmdPrefix+"paypal` » for a link to our **PayPal** [for extra support]\n"
				}
			}
			if(serverSettings.servers[sid].selfTempRoles){
				if(serverSettings.servers[sid].selfTempRoles.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"tag <days> <role>` » to get temporary role\n"
				}
			}
			else if(serverSettings.selfTempRoles){
				if(serverSettings.selfTempRoles.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"tag <days> <role>` » to get temporary role\n"
				}
			}
			if(serverSettings.servers[sid].teamRoles){
				if(serverSettings.servers[sid].teamRoles.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"team <team_name>` » to define your team\n"
				}
			}
			else if(serverSettings.teamRoles){
				if(serverSettings.teamRoles.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"team <team_name>` » to define your team\n"
				}
			}
			if(serverSettings.servers[sid].selfLvlRoles){
				if(serverSettings.servers[sid].selfLvlRoles.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"level <level>` » to define your level\n"
				}
			}
			else if(serverSettings.selfLvlRoles){
				if(serverSettings.selfLvlRoles.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"level <level>` » to define your level\n"
				}
			}
			if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
				cmds += "*... for mod commands, type:* `"+botConfig.cmdPrefix+"helpMods`"
			}
			return channel.send(cmds).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
		}
		*/
	}
};
