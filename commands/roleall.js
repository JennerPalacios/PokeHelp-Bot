module.exports={
	name: "roleall",
	aliases: ["ra"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ADMINS AND MODERATORS
		let adminRole=message.guild.roles.find(role=>role.name===serverSettings.servers[sid].adminRoleName);
			if(!adminRole){
				adminRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"adminRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].adminRoleName+cc.reset+" for server: "
					+cc.lblue+message.guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
		let modRole=message.guild.roles.find(role=>role.name===serverSettings.servers[sid].modRoleName);
			if(!modRole){
				modRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"modRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].modRoleName+cc.reset+" for server: "
					+cc.lblue+message.guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
		
		if(message.member.roles.has(modRole.id) || message.member.roles.has(adminRole.id) || message.member.id===botConfig.ownerID){
			/*
			const roleToAdd = message.guild.roles.find(role => role.id === "601540949516222474");
			
			let membersWithCorrectRole = message.guild.members.filter(member => member.roles.has("570677254078595083"));
			let mappedMembers = membersWithCorrectRole.map(member => member);
			
			let currentSecs = 1000, secsToAdd = 1000, currentUser=0, memberCount=0;
			
			console.info("I found  "+mappedMembers.length+"  users with the correct role...");
			message.channel.send("I'm about to add role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members");
			
			for (var i = 0; i < mappedMembers.length; i++) {
				setTimeout(function(){
					memberCount++;
					
					console.info("["+memberCount+"] Adding role: "+roleToAdd.name+" to member: "+mappedMembers[currentUser].user.username);
					
					//mappedMembers[currentUser].addRole(roleToAdd)
					//.then(() => console.info("Role successfully added!"))
					//.catch(err => console.info("Error while adding role...: "+err.message))
					
					if(memberCount===mappedMembers.length){
						message.channel.send("Done! I have added role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members.")
					}
					
					currentUser++
				}, currentSecs);
				currentSecs = currentSecs+secsToAdd
			}
			*/
		}
	}
};