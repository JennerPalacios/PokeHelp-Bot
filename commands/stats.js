module.exports={
	name: "stats",
	aliases: [],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		// GRAB ARGUMENTS 
		let guild=message.guild,channel=message.channel;
		
		let onlineM=guild.members.filter(user=>user.presence.status==="online").size;
		let idleM=guild.members.filter(user=>user.presence.status==="idle").size;
		let busyM=guild.members.filter(user=>user.presence.status==="dnd").size;
		let offlineM=guild.members.filter(user=>user.presence.status==="offline").size;
		let totalM=onlineM+idleM+busyM;
		
		let embedMSG={
			"embed": {
				"color": 0x00FF00,
				"title": "📊 Server Stats: "+guild.name+" 📈",
				"description": ""
					+"🗨 **Online** members: **"+onlineM+"**\n"
					+"📵 **Idle** members: **"+idleM+"**\n"
					+"🔴 **Busy** members: **"+busyM+"**\n"
					+"🚫 **Invisible/Offline** members: **"+offlineM+"**\n"
					+"❤ **Total Online** members: **"+totalM+"**\n"
					+"📋 **Total** members __Today__: **"+guild.members.size+"**\n"
					+"📜 **Registered** members: **"+guild.memberCount+"**"
			}
		};
		return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
	}
};