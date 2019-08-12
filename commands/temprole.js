module.exports={
	name: "temprole",
	aliases: ["temproles","troles","trole","tr"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		const sqlite=require("sqlite"); sqlite.open("./database/data.sqlite");
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember={},guild=message.guild,channel=message.channel,member=message.member;
		
		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.members.first()){mentionMember=message.mentions.members.first()}
		
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
				"description": "```md\n"+botConfig.cmdPrefix+"tempRole check <@mention>\n"
					+botConfig.cmdPrefix+"tempRole remove <@mention> <roleName>\n"
					+botConfig.cmdPrefix+"tempRole <@mention> <numberOfDays> <roleName>```"
			}
		};
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(!mentionMember.id){
					return channel.send("⚠ Please `@mention` a person you want me to check, add, or remove roles from... "+member)
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				else{
					let dateMultiplier=86400000;
					
					if(args[0]==="check"){
						sqlite.all(`SELECT * FROM temporaryRoles WHERE userID="${mentionMember.id}" AND guildID="${serverSettings.servers[sid].id}"`)
						.then(rows=>{
							if(rows.length<1){
								return channel.send("⚠ "+mentionMember+" is **NOT** in my `DataBase`, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							else{
								let daRolesFindings="✅ "+mentionMember+"'s TemporaryRole(s):\n";
								for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
									let startDateVal=new Date(); startDateVal.setTime(rows[rowNumber].startDate);
									startDateVal=(startDateVal.getMonth()+1)+"/"+startDateVal.getDate()+"/"+startDateVal.getFullYear();
									let endDateVal=new Date(); endDateVal.setTime(rows[rowNumber].endDate);
									finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
									daRolesFindings+="**"+rows[rowNumber].temporaryRole+"**, ends:`"+finalDate+"`, addedBy: <@"+rows[rowNumber].addedByID+"> on:`"+startDateVal+"`\n";
								}
								return channel.send(daRolesFindings).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
						})
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message)); return
					}
					
					if(args[0]==="remove"){
						let roleSearched=ARGS.slice(2).join(" ");
						
						sqlite.get(`SELECT * FROM temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}"`)
						.then(row=>{
							if(!row){
								return channel.send("⛔ "+mentionMember+" is __NOT__ in my `DataBase`, "+member);
							}
							else{
								let theirRole=guild.roles.find(role=>role.name===row.temporaryRole);
								if(mentionMember.roles.has(theirRole)){
									mentionMember.removeRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								sqlite.get(`DELETE FROM temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}"`)
								.then(row=>{
									return channel.send("⚠ "+mentionMember+" have **lost** their role: **"+theirRole.name+"** and has been removed from my `DataBase`, "+member);
								});
							}
						})
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						return
					}
					
					if(args.length<2){
						return channel.send("⛔ "+member+", you forgot to include how **many** days do you want "+mentionMember+" to have this role")
					}
					
					else if(args.length<3){
						return channel.send("⛔ "+member+", you forgot to include what role to **temporary** assign to "+mentionMember+"....")
					}
					
					let roleSearched=ARGS.slice(2).join(" ");
					
					if(!Number.isInteger(parseInt(args[1]))){
						return channel.send("⛔ Second value has to be **X** number of days, "+member+"!```md\n"
							+botConfig.cmdPrefix+"tempRole @"+mentionMember.user.username+" 90 "+roleSearched+"```")
					}
					
					let guildRole=guild.roles.find(role=>role.name===roleSearched);
					if(!guildRole){
						return channel.send("⛔ I couldn't find such role, "+member+"! Please try searching for it first!```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
					}
					
					sqlite.get(`SELECT * FROM temporaryRoles WHERE userID="${mentionMember.id}" AND temporaryRole="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}"`)
					.then(row=>{
						if(!row){
							return channel.send("⛔ This member already has this **temporary** role... try using `!temprole remove @"
								+mentionMember.user.username+" "+roleSearched+"` if you want to **change** their date, "+member);
						}
						else{
							let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
							let finalDate=((args[1])*(dateMultiplier)); finalDate=((curDate)+(finalDate));
							finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
							
							sqlite.run("INSERT INTO temporaryRoles (userID, userName, temporaryRole, guildID, guildName, startDate, endDate, addedByID, addedByName) VALUES (?,?,?,?,?,?,?,?,?)", 
								[mentionMember.id, mentionMember.user.username, roleSearched, guild.id, guild.name, curDate, finalDate, member.id, member.user.username]);
							let theirRole=guild.roles.find(role=>role.name===roleSearched);
							mentionMember.addRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							console.log(timeStamp+" "+cc.cyan+mentionMember.user.username+cc.reset+"("+cc.lblue+mentionMember.id+cc.reset
								+") was given a "+cc.green+"temporary"+cc.reset+" role: "+cc.green+roleSearched+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
							return channel.send("🎉 "+mentionMember+" has been given a **temporary** role: **"+roleSearched+"**, enjoy! They will lose this role on: `"+finalDateDisplay+"`");
						}
					})
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message)); return
				}
			}
		}
	}
};