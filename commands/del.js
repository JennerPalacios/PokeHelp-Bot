module.exports={
	name: "del",
	aliases: ["delete"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),channel=message.channel,member=message.member,guild=message.guild;
		
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
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(Number.isInteger(parseInt(args[0]))){
					let amt=parseFloat(args[0])+1;
					if(amt>100){
						return channel.send("⛔ I can only delete **99** messages at a time, "+member)
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					return channel.bulkDelete(amt,true)
						.catch(err=>channel.send("⛔ I've found some messages older than **14** days, you'll have to delete them manually! "+member));
				}
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
		}
	}
};