module.exports={
	name: "ahelp",
	aliases: [],
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
			let cmds="🤔 Admin commands comming soon!";
			/*
			cmds += "`"+botConfig.cmdPrefix+"stats` » server members statistics\n";
			cmds += "`"+botConfig.cmdPrefix+"info <server/@mention/id>` » general information\n";
			cmds += "`"+botConfig.cmdPrefix+"seen <@mention/id>` » member's last seen \n";
			cmds += "`"+botConfig.cmdPrefix+"quote <#channel> <id>` » quote a message \n";
			cmds += "`"+botConfig.cmdPrefix+"role <@mention/id>` » assing role to member \n";
			cmds += "`"+botConfig.cmdPrefix+"roleall` » role management for members \n";
			cmds += "`"+botConfig.cmdPrefix+"temprole` » assing temporary role to member \n";
			cmds += "`"+botConfig.cmdPrefix+"reactions` » listen to reactions to assign roles \n";
			cmds += "`"+botConfig.cmdPrefix+"del <#>` » delete messages from channel \n";
			cmds += "`"+botConfig.cmdPrefix+"warn <@mention/id>` » issue a warning to member \n";
			cmds += "`"+botConfig.cmdPrefix+"mute <@mention/id>` » mute member in channel\n";
			cmds += "`"+botConfig.cmdPrefix+"unmute <@mention/id>` » unmute member in channel \n";
			cmds += "`"+botConfig.cmdPrefix+"kick <@mention/id>` » kick member from server \n";
			cmds += "`"+botConfig.cmdPrefix+"ban <@mention/id>` » ban member from server \n";
			cmds += "`"+botConfig.cmdPrefix+"unban <id>` » unban member from server\n";
			cmds += "🤔 most commands provide more info or options by typing a blank command, try it 👍";
			
			
			
			/*
			if(serverSettings.servers[sid].mapPokemon){
				if(serverSettings.servers[sid].mapPokemon.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"del <#>` » delete messages from channel\n"
				}
			}
			else if(serverSettings.selfLvlRoles){
				if(serverSettings.selfLvlRoles.enabled==="yes"){
					cmds += "`"+botConfig.cmdPrefix+"level <level>` » to define your level\n"
				}
			}
			if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
				cmds += "*→ for mod commands, type:* `"+botConfig.cmdPrefix+"mhelp`"
				if(member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
					cmds += "*→ for admin commands, type:* `"+botConfig.cmdPrefix+"ahelp`"
				}
			}
			*/
			
			if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
				return channel.send(cmds).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
		}
	}
};
