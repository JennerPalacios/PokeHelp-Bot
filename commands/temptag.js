module.exports={
	name: "temptag",
	aliases: ["temptags","tag","tags"],
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
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember="notMentioned",guild=message.guild,channel=message.channel,member=message.member;
		
		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.users.first()){mentionMember=await guild.fetchMember(message.mentions.users.first())}
		
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
				"description": "```md\n"+botConfig.cmdPrefix+"tag check\n"
					+botConfig.cmdPrefix+"tag <numberOfDays> <roleName>\n"
					+"[FOR]: Mods/Staff/Admins\n"
					+botConfig.cmdPrefix+"tag remove <@mention/id> <roleName>```"
			}
		};
		
		
		if(!serverSettings.servers[sid].selfTempRoles){ return; }
		if(serverSettings.servers[sid].selfTempRoles.enabled==="no"){ return; }
		if(!serverSettings.servers[sid].selfTempRoles.channelID){ return; }
		if(!Number.isInteger(parseInt(serverSettings.servers[sid].selfTempRoles.channelID))){ return; }
		if(serverSettings.servers[sid].selfTempRoles.channelID!==channel.id){ return; }
		if(!serverSettings.servers[sid].selfTempRoles.tempRoleIDs){ return; }
		if(!Array.isArray(serverSettings.servers[sid].selfTempRoles.tempRoleIDs)){ return; }
		if(serverSettings.servers[sid].selfTempRoles.tempRoleIDs.length<1){ return }
		
		
		if(args.length<1){
			return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
		}
		else{
			let dateMultiplier=86400000;
			
			if(args[0]==="check"){
				if(myDB!=="disabled"){
					myDB.query(`SELECT * FROM PokeHelp_bot.temporarySelfTag WHERE userID="${member.id}" AND guildID="${serverSettings.servers[sid].id}";`,async (error,results)=>{
						if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporarySelfTag"+cc.reset+" table\nRAW: "+error);}
						else{
							if(results.length<1){
								return channel.send("⚠ You **DO NOT** have any `selfAssigned Tag(s)`, "+member)
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							else{
								let daRolesFindings="✅ "+member+"'s selfAssigned Tag(s):\n";
								for(rowNumber="0"; rowNumber<results.length; rowNumber++){
									let startDateVal=new Date(); startDateVal.setTime(results[rowNumber].startDate);
									startDateVal=(startDateVal.getMonth()+1)+"/"+startDateVal.getDate()+"/"+startDateVal.getFullYear();
									let endDateVal=new Date(); endDateVal.setTime(results[rowNumber].endDate);
									finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
									daRolesFindings+="**"+results[rowNumber].temporaryTag+"**, ends:`"+finalDate+"`, added on:`"+startDateVal+"`\n";
								}
								return channel.send(daRolesFindings).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
						}
					});
				}
				else{
					sqlite.all(`SELECT * FROM temporarySelfTag WHERE userID="${member.id}" AND guildID="${serverSettings.servers[sid].id}";`)
					.then(rows=>{
						if(rows.length<1){
							return channel.send("⚠ You **DO NOT** have any `selfAssigned Tag(s)`, "+member)
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else{
							let daRolesFindings="✅ "+member+"'s selfAssigned Tag(s):\n";
							for(rowNumber="0"; rowNumber<rows.length; rowNumber++){
								let startDateVal=new Date(); startDateVal.setTime(rows[rowNumber].startDate);
								startDateVal=(startDateVal.getMonth()+1)+"/"+startDateVal.getDate()+"/"+startDateVal.getFullYear();
								let endDateVal=new Date(); endDateVal.setTime(rows[rowNumber].endDate);
								finalDate=(endDateVal.getMonth()+1)+"/"+endDateVal.getDate()+"/"+endDateVal.getFullYear();
								daRolesFindings+="**"+rows[rowNumber].temporaryTag+"**, ends:`"+finalDate+"`, added on:`"+startDateVal+"`\n";
							}
							return channel.send(daRolesFindings).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					})
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message)); return;
				}
				return;
			}
			
			if(args[0]==="remove"){
				let roleSearched=ARGS.slice(1).join(" ");
				if(args.length<2){
					return channel.send("⛔ "+member+", you forgot to include what tag to **remove**...")
				}
				if(myDB!=="disabled"){
					myDB.query(`SELECT * FROM PokeHelp_bot.temporarySelfTag WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}";`,async (error,results)=>{
						if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporarySelfTag"+cc.reset+" table\nRAW: "+error);}
						else{
							if(results.length<1){
								return channel.send("⛔ You dont appear to have this **tag** in my `DataBase`, "+member);
							}
							else{
								let theirRole=guild.roles.find(role=>role.name===roleSearched);
								if(member.roles.has(theirRole.id)){
									member.removeRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
								myDB.query(`DELETE FROM PokeHelp_bot.temporarySelfTag WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}";`,async (error,results)=>{
									if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporarySelfTag"+cc.reset+" table\nRAW: "+error);}
									else{
										return channel.send("⚠ "+member+" have **lost** their tag: **"+theirRole.name+"** and has been removed from my `DataBase`")
									}
								});
							}
						}
					});
				}
				else{
					sqlite.get(`SELECT * FROM temporarySelfTag WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}"`)
					.then(row=>{
						if(!row){
							return channel.send("⛔ You dont appear to have this **tag** in my `DataBase`, "+member);
						}
						else{
							let theirRole=guild.roles.find(role=>role.name===row.temporaryTag);
							if(member.roles.has(theirRole.id)){
								member.removeRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							sqlite.get(`DELETE FROM temporarySelfTag WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}"`)
							.then(row=>{
								return channel.send("⚠ "+member+" have **lost** their tag: **"+theirRole.name+"** and has been removed from my `DataBase`");
							});
						}
					})
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
				}
				return;
			}
			
			if(!Number.isInteger(parseInt(args[0]))){
				return channel.send("⛔ "+member+", you forgot to include how **many** days do you want to have this tag")
			}
			if(args.length<2){
				return channel.send("⛔ "+member+", you forgot to include what **temporary** tag to you wanted to have...")
			}
			
			let roleSearched=ARGS.slice(1).join(" ");
			
			let guildRole=guild.roles.find(role=>role.name===roleSearched);
			if(!guildRole){
				return channel.send("⛔ I couldn't find this role in the server, "+member+"! Please contact a Moderator or an Administrator...");
			}
			
			if(!serverSettings.servers[sid].selfTempRoles.tempRoleIDs.some(roleID=>roleID===guildRole.id)){
				return channel.send("⛔ This **tag** is not `selfAssignable`, "+member+"! Please review the list of self assignable tags...")
			}
			
			console.info("SELECT * FROM PokeHelp_bot.temporarySelfTag WHERE userID="+member.id+" AND temporaryTag="+roleSearched+" AND guildID="+serverSettings.servers[sid].id);
			
			// userID TEXT, userName TEXT, temporaryTag TEXT, guildID TEXT, guildName TEXT, startDate TEXT, endDate TEXT
			if(myDB!=="disabled"){
				myDB.query(`SELECT * FROM PokeHelp_bot.temporarySelfTag WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}";`,async (error,results)=>{
					if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporarySelfTag"+cc.reset+" table\nRAW: "+error);}
					else{
						if(results.length>0){
							let newFinalDate=((args[0])*(dateMultiplier)); newFinalDate=((results[0].endDate*1)+(newFinalDate*1));
							myDB.query(`UPDATE PokeHelp_bot.temporarySelfTag SET endDate=? WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}";`,
								[newFinalDate],error=>{
									if(error){
										console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporarySelfTag"+cc.reset+" table\nRAW: "+error);
									}
									else{
										return channel.send("✅ You already have this **temporary** tag, "+member+". But don't worry, I have added **"+args[0]+"** more days!");
									}
								}
							);
						}
						else{
							let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
							let finalDate=((args[0])*(dateMultiplier)); finalDate=((curDate)+(finalDate));
							finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
							myDB.query(`INSERT INTO PokeHelp_bot.temporarySelfTag (userID, userName, temporaryTag, guildID, guildName, startDate, endDate) VALUES (?,?,?,?,?,?,?)`, 
								[member.id, member.user.username, roleSearched, guild.id, guild.name, curDate, finalDate],async (error,results)=>{
								if(error){console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"SELECT * FROM"+cc.cyan+" temporarySelfTag"+cc.reset+" table\nRAW: "+error);}
							});
							let theirRole=guild.roles.find(role=>role.name===roleSearched);
							member.addRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							console.log(timeStamp+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset
								+") was given a "+cc.green+"temporary"+cc.reset+" role: "+cc.green+roleSearched+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
							return channel.send("🎉 "+member+" has been given a **temporary** tag: **"+roleSearched+"**, enjoy! They will lose this role on: `"+finalDateDisplay+"`");
						}
					}
				});
			}
			else{
				sqlite.get(`SELECT * FROM temporarySelfTag WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}";`)
				.then(row=>{
					if(row){
						let newFinalDate=((args[0])*(dateMultiplier)); newFinalDate=((row.endDate*1)+(newFinalDate*1));
						sqlite.run(`UPDATE temporarySelfTag SET endDate=? WHERE userID="${member.id}" AND temporaryTag="${roleSearched}" AND guildID="${serverSettings.servers[sid].id}";`,
							[newFinalDate])
						.catch(error=>console.info(timeStamp()+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.yellow+"UPDATE"+cc.cyan+" temporarySelfTag"+cc.reset+" table | "+error.message));
						
						return channel.send("✅ You already have this **temporary** tag, "+member+". But don't worry, I have added **"+args[0]+"** more days!");
					}
					else{
						let curDate=new Date().getTime(); let finalDateDisplay=new Date(); 
						let finalDate=((args[0])*(dateMultiplier)); finalDate=((curDate)+(finalDate));
						finalDateDisplay.setTime(finalDate); finalDateDisplay=(finalDateDisplay.getMonth()+1)+"/"+finalDateDisplay.getDate()+"/"+finalDateDisplay.getFullYear();
						sqlite.run(`INSERT INTO temporarySelfTag (userID, userName, temporaryTag, guildID, guildName, startDate, endDate) VALUES (?,?,?,?,?,?,?)`, 
							[member.id, member.user.username, roleSearched, guild.id, guild.name, curDate, finalDate]);
						let theirRole=guild.roles.find(role=>role.name===roleSearched);
						member.addRole(theirRole).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
						console.log(timeStamp+" "+cc.cyan+member.user.username+cc.reset+"("+cc.lblue+member.id+cc.reset
							+") was given a "+cc.green+"temporary"+cc.reset+" role: "+cc.green+roleSearched+cc.reset+", by: "+cc.red+member.user.username+cc.reset+"("+member.id+")");
						return channel.send("🎉 "+member+" has been given a **temporary** role: **"+roleSearched+"**, enjoy! They will lose this role on: `"+finalDateDisplay+"`");
					}
				})
				.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message)); return;
			}
		}
	}
};