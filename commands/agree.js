module.exports={
	name: "agree",
	aliases: [],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		var myDB="disabled", sqlite="disabled";
		if(serverSettings.myDBserver){
			if(serverSettings.myDBserver.enabled==="yes"){
				const mySQL=require("mysql");
				myDB=mySQL.createConnection(serverSettings.myDBserver);
				myDB.connect(error=>{
					if(error){
						console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"ACCESS"+cc.cyan+" Database "+cc.reset+"(invalid login)\nRAW: "+error.sqlMessage)
					}
				});
			}
			else{
				sqlite=require("sqlite"); sqlite.open("./database/data.sqlite");
			}
		}
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),guild=message.guild,channel=message.channel,member=message.member,dateTS=new Date().toDateString();
		
		if(serverSettings.servers[sid].newMember){
			if(serverSettings.servers[sid].newMember.rulesChannelID){
				if(serverSettings.servers[sid].newMember.roleAgreementName){
					if(serverSettings.servers[sid].newMember.roleAgreementRequired==="yes"){
						if(serverSettings.servers[sid].newMember.rulesChannelID===channel.id){
							message.delete();
							let agreeRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].newMember.roleAgreementName); 
							if(!agreeRole){
								console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role: "+cc.cyan+serverSettings.servers[sid].newMember.roleAgreementName+cc.reset
									+" was "+cc.red+"not"+cc.reset+" found in server: "+cc.yellow+member.guild.name+cc.reset+", as it was input in "+cc.purple+"serverSettings.json"+cc.reset
									+" > "+cc.purple+"newMember"+cc.reset+" > "+cc.purple+"roleAgreementName"+cc.reset)
							}
							else{
								member.addRole(agreeRole)
								.then(()=>{
									if(myDB!=="disabled"){
										myDB.query(`SELECT * FROM PokeHelp_bot.agreedMembers WHERE userID="${member.id}" AND serverID="${guild.id}"`,(error,results)=>{
											if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" agreedMembers"+cc.reset+" table\nRAW: "+error);}
											else{
												if(results.length<1){
													myDB.query(`INSERT INTO PokeHelp_bot.agreedMembers (userID, userName, serverID, serverName, dateAccepted) VALUES (?,?,?,?,?)`,
														[member.id, member.user.username, guild.id, guild.name, dateTS],error=>{
															if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"INSERT INTO"+cc.cyan+" agreedMembers"+cc.reset+" table\nRAW: "+error);}
														}
													);
												}
											}
										});
									}
									else{
										sqlite.get(`SELECT * FROM agreedMembers WHERE userID="${member.id}" AND serverID="${guild.id}"`)
										.then(row=>{
											if(!row){
												sqlite.run(`INSERT INTO agreedMembers (userID, userName, serverID, serverName, dateAccepted) VALUES (?,?,?,?,?)`,
													[member.id, member.user.username, guild.id, guild.name, dateTS])
												.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
											}
										})
										.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
									}
								})
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							let starterRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].newMember.roleOnJoinName); 
							if(!starterRole){
								console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role: "+cc.cyan+serverSettings.servers[sid].newMember.roleOnJoinName+cc.reset
									+" was "+cc.red+"not"+cc.reset+" found in server: "+cc.yellow+member.guild.name+cc.reset+", as it was input in "+cc.purple+"serverSettings.json"+cc.reset
									+" > "+cc.purple+"newMember"+cc.reset+" > "+cc.purple+"roleOnJoinName"+cc.reset)
							}
							else{
								member.removeRole(starterRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							channel.send("Thank you for accepting our **RULES**, "+member+"! You have been given `read`-access to more channels in our server; enjoy your stay, have fun, and keep safe!")
							.then(tempMSG=>{setTimeout(function(){tempMSG.delete()},15000)})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							//channel.overwritePermissions(member,{SEND_MESSAGES:false}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						}
					}
				}
			}
		}
	}
};