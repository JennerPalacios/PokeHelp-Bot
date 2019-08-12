const Discord=require("discord.js");

module.exports={
	name: "reactions",
	aliases: ["rt","rl","reaction","reactiontracker","reactionlistener"],
	execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		const sqlite=require("sqlite"); sqlite.open("./database/data.sqlite");
		
		// GRAB ARGUMENTS
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),channel=message.channel,member=message.member,guild=message.guild;
		
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
		
		
		//
		//
		
		let nmStatus="enabled", nmCountWelcomed=67, nmCountAgreed=68, nmCountTeamed=69;
				
		let reactionsStatus="";
		let [rChannel,rMessage,rName,rID,rRoleName,rRoleID,rTitle,rDisplay]=["","","","","","","",""];
		if(serverSettings.servers[sid].trackReactions==="yes"){reactionsStatus="enabled"}else{reactionsStatus="disabled"}
		
		//
		//
		
		
		
		if(member.roles.has(modRole.id) || member.roles.has(adminRole.id) || member.id===botConfig.ownerID){
			if(args.length<1){
				channel.send("What would you like to do, "+member+"?\n[`status`] , [`add`] , [`del`] , [`count`]").then(()=>{
					let commander=member, availableOptions=["status","add","del","count"];
					let correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.toLowerCase().includes(option))){return true}};
					let reactionFilter=(reaction,user)=>{return ["⬅","➡"].includes(reaction.emoji.name) && user.id===commander.id};
					channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
					.then(messages=>{
						if(messages.first().content.toLowerCase().includes("status")){
							channel.send(commander+", `ReactionsListener` is currently: **"+reactionsStatus+"**\n`"+botConfig.cmdPrefix+"rl status`")
						}
						else if(messages.first().content.toLowerCase().includes("del")){
							/*
							let tempBody="";if(fakeDB.length>10){tempBody=fakeDB.slice(0,10).join("\n")}else{tempBody=fakeDB.join("\n")}
							channel.send(commander+", pick `id` to **delete**?",{
								"embed": {
									"color": 0x00FF00,
									"description": "id | channel | msg | emoji | role\n"+tempBody
								}
							})
							
							"`1` <#407337948745564162> [msg](https://discordapp.com/channels/271531913381019648/443257941605220352/608177877313388544) <:type_bug:412651021240631316> Buggy",
							id | serverID | serverName | channelID | channelName | messageID | emojiName | emojiID | roleName | roleID | title | display
							*/
							
							availableOptions=[];
							sqlite.all(`SELECT * FROM messageReactions WHERE serverID="${guild.id}"`)
							.then(rows=>{
								if(rows.length<1){
									return channel.send("⛔ There aren't any reaction listeners in the database, "+commander)
								}
								else{
									var dbPage=1,dbAmount=10,dbStart=0,dbEnd=0,dbOutput="",reactionSelected="",dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);availableOptions=[];
									if(rows.length>dbAmount){dbEnd=dbAmount}else{dbEnd=rows.length}
									for(dbStart=0;dbStart<dbEnd;dbStart++){
										let tempEmoji="";if(rows[dbStart].emojiID==="utf8"){tempEmoji=rows[dbStart].emojiName}else{tempEmoji="<:"+rows[dbStart].emojiName+":"+rows[dbStart].emojiID+">"}
										dbOutput=dbOutput+"`"+rows[dbStart].id+"` <#"+rows[dbStart].channelID+"> "
										+"[msg](https://discordapp.com/channels/"+rows[dbStart].serverID+"/"+rows[dbStart].channelID+"/"+rows[dbStart].messageID+") "
										+tempEmoji+" "+rows[dbStart].roleName+"\n"
										availableOptions.push(rows[dbStart].id);
									}
									embedMSG={"embed":{"color":0x00FF00,"description": "id | channel | msg | emoji | role\n"+dbOutput.slice(0,-1)}};
									channel.send(commander+", pick `id` to **delete**?",embedMSG)
									.then(sqlEntries=>{
										sqlEntries.react("⬅").then(()=>{sqlEntries.react("➡").catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
										correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.includes(option))){return true}};
										
										sqlEntries.awaitReactions(reactionFilter,{max:1,time:60000,errors:["time"]})
										.then(collected=>{reactionSelected=collected.first();
											if(reactionSelected.emoji.name==="⬅"){
												sqlEntries.reactions.get("⬅").remove(commander.user);//console.info("back");
											}
											else{
												sqlEntries.reactions.get("➡").remove(commander.user);//console.info("forward");
											}
										})
										.catch(err=>console.info(timeStamp+" "+cc.hlblue+" EXPIRED "+cc.reset+" Paging through DB timedOut"))
										
										channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
										.then(messages=>{
											sqlite.run(`DELETE FROM messageReactions WHERE id="${messages.first().content.split(/ +/)[0]}" AND serverID="${guild.id}"`)
											.then(()=>{
												channel.send("✅ `#"+messages.first().content.split(/ +/)[0]+"` was **deleted** successfully, "+commander)
											})
											.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.cyan+"DELETE FROM"+cc.reset+" \"messageReactions\" database | "+err.message))
										})
										.catch(err=>{
											channel.send("⚠ Your request timed out, "+commander)
										})
									})
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								}
							})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						else if(messages.first().content.toLowerCase().includes("count")){
							embedMSG={
								"embed": {
									"color": 0x00FF00,
									"description":
										"📜 Read Welcome: **"+nmCountWelcomed+"** members\n"+
										"📋 Read Rules: **"+nmCountAgreed+"** members\n"+
										"📝 Picked a team: **"+nmCountTeamed+"** members"
								}
							};
							return channel.send(embedMSG).catch(err=>console.info(err.message));
						}
						else if(messages.first().content.toLowerCase().split(/ +/)[0]==="add"){
							channel.send(commander+", what `channel` you want to track?\n⚠ Filter: `#channel` I can see").then(()=>{
								correctOption=userInput=>{if(userInput.member.id===commander.id && userInput.mentions.channels.first()){return true}};
								channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
								.then(messages=>{
									rChannel=messages.first().mentions.channels.first();
									availableOptions=[];botChannels.get(rChannel.id).fetchMessages({limit:10})
									.then(msg=>{
										msg=msg.map(msg=>availableOptions.push(msg.id));
										if(availableOptions.length<1){return channel.send("⛔ That channel is `empty`; I have terminated your request, "+commander)}
										channel.send(commander+", what `messageID` you want to track from `#"+rChannel.name+"`?\n⚠ Filter: any of last `10 messages`").then(()=>{
											correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.includes(option))){return true}};
											channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
											.then(messages=>{
												rMessage=messages.first().content.split(/ +/)[0];
												let possibleReactions=["👍","💪","✅","☑","💯","❤","🏃","🎉","📍","🚩","🔔","📣"];let UTF8emojis=["👍","💪","✅","☑","💯","❤","🏃","🎉","📍","🚩","🔔","📣"]; let guildEmojis=guild.emojis.map(e=>{e.name;possibleReactions.push(e.name)});
												channel.send(commander+", what `reaction` should I pay attention to?\nYou may use any of the `"+guildEmojis.length+"` emojis found in this server or any of these `handpicked` UTF8-emojis:\n"+UTF8emojis.join(" ")).then(()=>{
													correctOption=userInput=>{if(userInput.member.id===commander.id && possibleReactions.some(option=>userInput.content.includes(option))){return true}};
													channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
													.then(messages=>{
														let emoji=messages.first().content.split(/ +/)[0];emoji=emoji.toString();emoji=Discord.Util.parseEmoji(emoji);let availableOptions=guild.roles.map(r=>r.name)
														rName=emoji.name;if(emoji.id===null){rID="utf8"}else{rID=emoji.id}
														channel.send(commander+", what `role` you want to bind?\n⚠ Filter: existing `roleName`").then(()=>{
															correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.includes(option))){return true}};
															channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
															.then(messages=>{
																let guildRole=guild.roles.find(role=>role.name===messages.first().content);
																if(!guildRole){return channel.send("⛔ Only type the `roleName`; I have terminated your request, "+commander)}
																rRoleName=guildRole.name,rRoleID=guildRole.id;
																channel.send(commander+", now give this __reaction listener__ a random **name**, for displaying count purposes\nIE: `\"Read Welcome\" 69 members`\n⚠ Your next input will be **unfiltered**").then(()=>{
																	correctOption=userInput=>{if(userInput.member.id===commander.id && userInput.content){return true}};
																	channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
																	.then(messages=>{
																		rTitle=messages.first().content;availableOptions=["yes","no"];
																		channel.send(commander+", one last thing: Do you want to **display** the number of people that **reacted** to this role in `"+botConfig.cmdPrefix+"rl count`?\n[`yes`] , [`no`]").then(()=>{
																			correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.toLowerCase().includes(option))){return true}};
																			channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
																			.then(messages=>{
																				rDisplay=messages.first().content.split(/ +/)[0];
																				let tempEmoji="";if(rID==="utf8"){tempEmoji=rName}else{tempEmoji="<:"+rName+":"+rID+">"}
																				sqlite.get(`SELECT * FROM messageReactions WHERE channelID="${rChannel.id}" AND messageID="${rMessage}" AND roleID="${rRoleID}"`)
																				.then(row=>{
																					if (!row){
																						let botReaction="";if(rID==="utf8"){botReaction=rName}else{botReaction=guild.emojis.get(rID)}
																						rChannel.fetchMessage(rMessage).then(msg=>{msg.react(botReaction).catch(err=>console.info(err.message))}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
																						
																						sqlite.run("INSERT INTO messageReactions (serverID, serverName, channelID, channelName, messageID, emojiName, emojiID, roleName, roleID, title, display) VALUES (?,?,?,?,?,?,?,?,?,?,?)", 
																							[guild.id, guild.name, rChannel.id, rChannel.name, rMessage, rName, rID, rRoleName, rRoleID, rTitle, rDisplay]);
																						return channel.send("✅ Alright "+member+", all set! I will keep an eye out for people in **channel**: `#"
																							+rChannel.name+"("+rChannel.id+")` on **message**: `id:"+rMessage+"` for people **reacting** with: "
																							+tempEmoji+", I will add or remove their **role**: `"+rRoleName+"("+rRoleID+")`");
																					}
																					else{
																						return channel.send("⛔ This channel's message with this `role` is already being tracked, "+member);
																					}
																				})
																				.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
																			})
																			.catch(err=>{
																				channel.send("⚠ Your request timed out, "+commander); console.info("TimedOut: "+err.message)
																			})
																		})
																	})
																	.catch(err=>{
																		channel.send("⚠ Your request timed out, "+commander); console.info("TimedOut: "+err.message)
																	})
																})
															})
															.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
														})
													})
													.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
												})
											})
											.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
										})
									})
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								})
								.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
							})
						}
					})
					.catch(err=>{
						channel.send("⚠ Your request timed out, "+commander); console.info("TimedOut: "+err.message)
					})
				}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			else{
				if(args[0]==="status"){
					channel.send(member+", `ReactionsListener` is currently: **"+reactionsStatus+"**")
				}
				if(args[0]==="count"){
					sqlite.all(`SELECT * FROM messageReactions WHERE serverID="${guild.id}" AND display="yes"`)
					.then(async rows=>{
						if(rows.length<1){
							return channel.send("⛔ There aren't any reaction listeners with **display** enabled in this server, "+commander)
						}
						else{
							var dbPage=1,dbAmount=10,dbStart=0,dbEnd=0,dbOutput="",reactionSelected="",dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);availableOptions=[];
							if(rows.length>dbAmount){dbEnd=dbAmount}else{dbEnd=rows.length}
							for(dbStart=0;dbStart<dbEnd;dbStart++){
								await guild.channels.get(rows[dbStart].channelID).fetchMessage(rows[dbStart].messageID).then(async tempMSG=>{
									dbOutput=await dbOutput+rows[dbStart].title+": **"+tempMSG.reactions.get(rows[dbStart].emojiName).count+"** members\n"
								})
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
							}
							channel.send({"embed":{"color":0x00FF00,"title": "ℹ Reactions Counter ℹ","description": dbOutput.slice(0,-1)}})
						}
					})
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(args[0]==="del" || args[0]==="delete"){
					let commander=member, availableOptions=[],correctOption="";
					let reactionFilter=(reaction,user)=>{return ["⬅","➡"].includes(reaction.emoji.name) && user.id===commander.id};
					
					sqlite.all(`SELECT * FROM messageReactions WHERE serverID="${guild.id}"`)
					.then(rows=>{
						if(rows.length<1){
							return channel.send("⛔ There aren't any reaction listeners in the database, "+commander)
						}
						else{
							var dbPage=1,dbAmount=10,dbStart=0,dbEnd=0,dbOutput="",reactionSelected="",dbPages=(rows.length * 1)/10;dbPages=Math.floor(dbPages+1);availableOptions=[];
							if(rows.length>dbAmount){dbEnd=dbAmount}else{dbEnd=rows.length}
							for(dbStart=0;dbStart<dbEnd;dbStart++){
								let tempEmoji="";if(rows[dbStart].emojiID==="utf8"){tempEmoji=rows[dbStart].emojiName}else{tempEmoji="<:"+rows[dbStart].emojiName+":"+rows[dbStart].emojiID+">"}
								dbOutput=dbOutput+"`"+rows[dbStart].id+"` <#"+rows[dbStart].channelID+"> "
								+"[msg](https://discordapp.com/channels/"+rows[dbStart].serverID+"/"+rows[dbStart].channelID+"/"+rows[dbStart].messageID+") "
								+tempEmoji+" "+rows[dbStart].roleName+"\n"
								availableOptions.push(rows[dbStart].id);
							}
							embedMSG={"embed":{"color":0x00FF00,"description": "id | channel | msg | emoji | role\n"+dbOutput.slice(0,-1)}};
							channel.send(commander+", pick `id` to **delete**?",embedMSG)
							.then(sqlEntries=>{
								sqlEntries.react("⬅").then(()=>{sqlEntries.react("➡").catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
								correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.includes(option))){return true}};
								
								sqlEntries.awaitReactions(reactionFilter,{max:1,time:60000,errors:["time"]})
								.then(collected=>{reactionSelected=collected.first();
									if(reactionSelected.emoji.name==="⬅"){
										sqlEntries.reactions.get("⬅").remove(commander.user);//console.info("back");
									}
									else{
										sqlEntries.reactions.get("➡").remove(commander.user);//console.info("forward");
									}
								})
								.catch(err=>console.info(timeStamp+" "+cc.hlblue+" EXPIRED "+cc.reset+" Paging through DB timedOut"))
								
								channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
								.then(messages=>{
									sqlite.run(`DELETE FROM messageReactions WHERE id="${messages.first().content.split(/ +/)[0]}" AND serverID="${guild.id}"`)
									.then(()=>{
										channel.send("✅ `#"+messages.first().content.split(/ +/)[0]+"` was **deleted** successfully, "+commander)
									})
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Could not "+cc.cyan+"DELETE FROM"+cc.reset+" \"messageReactions\" database | "+err.message))
								})
								.catch(err=>{
									channel.send("⚠ Your request timed out, "+commander)
								})
							})
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					})
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(args[0]==="add"){
					if(args.length<2){
						let commander=member, correctOption="";
						channel.send(commander+", what `channel` you want to track? \n`"+botConfig.cmdPrefix+"rl add`").then(()=>{
							correctOption=userInput=>{if(userInput.member.id===commander.id && userInput.mentions.channels.first()){return true}};
							channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
							.then(messages=>{
								rChannel=messages.first().mentions.channels.first();
								availableOptions=[];botChannels.get(rChannel.id).fetchMessages({limit:10})
								.then(msg=>{
									msg=msg.map(msg=>availableOptions.push(msg.id));
									if(availableOptions.length<1){return channel.send("⛔ That channel is `empty`; I have terminated your request, "+commander)}
									channel.send(commander+", what `messageID` you want to track from `#"+rChannel.name+"`?").then(()=>{
										correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.includes(option))){return true}};
										channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
										.then(messages=>{
											rMessage=messages.first().content.split(/ +/)[0];
											let possibleReactions=["👍","💪","✅","☑","💯","❤","🏃","🎉","📍","🚩","🔔","📣"];let UTF8emojis=["👍","💪","✅","☑","💯","❤","🏃","🎉","📍","🚩","🔔","📣"];
											let guildEmojis=guild.emojis.map(e=>{e.name;possibleReactions.push(e.name)});
											channel.send(commander+", what `reaction` should I pay attention to?\nYou may use any of the `"+guildEmojis.length
											+"` emojis found in this server or any of these `handpicked` UTF8-emojis:\n"+UTF8emojis.join(" ")).then(()=>{
												correctOption=userInput=>{if(userInput.member.id===commander.id && possibleReactions.some(option=>userInput.content.includes(option))){return true}};
												channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
												.then(messages=>{
													let emoji=messages.first().content.split(/ +/)[0];emoji=emoji.toString();emoji=Discord.Util.parseEmoji(emoji);let availableOptions=guild.roles.map(r=>r.name)
													rName=emoji.name;if(emoji.id===null){rID="utf8"}else{rID=emoji.id}
													channel.send(commander+", what `role` you want to bind?").then(()=>{
														correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.includes(option))){return true}};
														channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
														.then(messages=>{
															let guildRole=guild.roles.find(role=>role.name===messages.first().content);
															if(!guildRole){return channel.send("⛔ Only type the `roleName`; I have terminated your request, "+commander)}
															rRoleName=guildRole.name,rRoleID=guildRole.id;
															channel.send(commander+", now give this *reaction listener* a random **name**.\nIE: `Read Welcome` ...for displaying count purposes\n⚠ Your next input will be unfiltered").then(()=>{
																correctOption=userInput=>{if(userInput.member.id===commander.id && userInput.content){return true}};
																channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
																.then(messages=>{
																	rTitle=messages.first().content;availableOptions=["yes","no"];
																	channel.send(commander+", one last thing: Do you want to **display** the number of people that **reacted** to this role in `"+botConfig.cmdPrefix+"rl count`?\n[`yes`] , [`no`]").then(()=>{
																		correctOption=userInput=>{if(userInput.member.id===commander.id && availableOptions.some(option=>userInput.content.toLowerCase().includes(option))){return true}};
																		channel.awaitMessages(correctOption,{time:60000,maxMatches:1,errors:["time"]})
																		.then(messages=>{
																			rDisplay=messages.first().content.split(/ +/)[0];
																			let tempEmoji="";if(rID==="utf8"){tempEmoji=rName}else{tempEmoji="<:"+rName+":"+rID+">"}
																			sqlite.get(`SELECT * FROM messageReactions WHERE channelID="${rChannel.id}" AND messageID="${rMessage}" AND roleID="${rRoleID}"`)
																			.then(row=>{
																				if (!row){
																				let botReaction="";if(rID==="utf8"){botReaction=rName}else{botReaction=guild.emojis.get(rID)}
																				rChannel.fetchMessage(rMessage).then(msg=>{msg.react(botReaction).catch(err=>console.info(err.message))}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
																				
																				sqlite.run("INSERT INTO messageReactions (serverID, serverName, channelID, channelName, messageID, emojiName, emojiID, roleName, roleID, title, display) VALUES (?,?,?,?,?,?,?,?,?,?,?)", 
																						[guild.id, guild.name, rChannel.id, rChannel.name, rMessage, rName, rID, rRoleName, rRoleID, rTitle, rDisplay]);
																					return channel.send("✅ Alright "+member+", all set! I will keep an eye out for people in **channel**: `#"
																						+rChannel.name+"("+rChannel.id+")` on **message**: `id:"+rMessage+"` for people **reacting** with: "
																						+tempEmoji+", I will add or remove their **role**: `"+rRoleName+"("+rRoleID+")`");
																				}
																				else{
																					return channel.send("⛔ This channel's message with this `role` is already being tracked, "+member);
																				}
																			})
																			.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
																		})
																		.catch(err=>{
																			channel.send("⚠ Your request timed out, "+commander); console.info("TimedOut: "+err.message)
																		})
																	})
																})
																.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
															})
														})
														.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
													})
												})
												.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
											})
										})
										.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
									})
								})
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							})
							.catch(err=>{channel.send("⚠ Your request timed out, "+commander)})
						})
					}
					else{
						//  x   0	  1			2	   3   4
						// !rt add #channel 1234567890 :D VIP
						let availableMessages=[];let availableReactions=["👍","💪","✅","☑","💯","❤","🏃","🎉","📍","🚩","🔔","📣"];
						let guildEmojis=guild.emojis.map(e=>{e.name;availableReactions.push(e.name)}),guildRoles=guild.roles.map(r=>r.name);
						let incompleteData="⛔ Incomplete data, try using `"+botConfig.cmdPrefix+"rl add` prompt system instead..."+member+"\n"
							+"ℹ **S**yntax & **A**rguments **required**:\n**"+botConfig.cmdPrefix+"rl add** `#channel` `msgID` `emoji` `roleName`";
						let syntaxNarguments="\nℹ **S**yntax & **A**rguments **required**:\n**"+botConfig.cmdPrefix+"rl add** `#channel` `msgID` `emoji` `roleName`";
						
						if(args[1]){
							if(args[1].startsWith("<#")){
								if(message.mentions){
									if(message.mentions.channels.first()){
										rChannel=message.mentions.channels.first();
										botChannels.get(rChannel.id).fetchMessages({limit:10})
										.then(messages=>{
											availableMessages=messages.map(msg=>msg.id)
											if(availableMessages.length<1){
												return channel.send("⛔ I couldn't find any messages, "+member)
											}
											else{
												if(args[2]){
													if(Number.isInteger(parseInt(args[2]))){
														if(availableMessages.some(msgID=>args[2]===msgID)){
															rMessage=args[2];
															if(args[3]){
																if(availableReactions.some(emoji=>args[3].includes(emoji))){
																	let emojiMSG=args[3].toString(); emojiMSG=Discord.Util.parseEmoji(emojiMSG);
																	rName=emojiMSG.name;if(emojiMSG.id===null){rID="utf8"}else{rID=emojiMSG.id}
																	if(args[4]){
																		if(args[4].startsWith("\"")){
																			console.info("role has quotes");//
																			let [tempMSG,tempRoleName,start,end]=["","","",""];
																			tempMSG=message.content;start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
																			end=tempMSG.indexOf("\"");tempMSG=tempMSG.slice(0,end);ARGS[4]=tempMSG;
																		}
																		if(guildRoles.some(role=>ARGS[4]===role)){
																			let guildRole=guild.roles.find(role=>role.name===ARGS[4]);
																			if(!guildRole){return channel.send("⛔ Cannot find role in server, "+member)}
																			else{
																				rRoleName=guildRole.name,rRoleID=guildRole.id,rTitle="None",rDisplay="no";
																				let tempEmoji="";if(rID==="utf8"){tempEmoji=rName}else{tempEmoji="<:"+rName+":"+rID+">"}
																				//messageReactions
																				// id | serverID | serverName | channelID | channelName | messageID | emojiName | emojiID | roleName | roleID | title | display
																				sqlite.get(`SELECT * FROM messageReactions WHERE channelID="${rChannel.id}" AND messageID="${rMessage}" AND roleID="${rRoleID}"`)
																				.then(row=>{
																					if (!row){
																						let botReaction="";if(rID==="utf8"){botReaction=rName}else{botReaction=guild.emojis.get(rID)}
																						rChannel.fetchMessage(rMessage).then(msg=>{msg.react(botReaction).catch(err=>console.info(err.message))}).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message));
																						
																						sqlite.run("INSERT INTO messageReactions (serverID, serverName, channelID, channelName, messageID, emojiName, emojiID, roleName, roleID, title, display) VALUES (?,?,?,?,?,?,?,?,?,?,?)", 
																							[guild.id, guild.name, rChannel.id, rChannel.name, rMessage, rName, rID, rRoleName, rRoleID, rTitle, rDisplay]);
																						return channel.send("✅ Alright "+member+", all set! I will keep an eye out for people in **channel**: `#"
																							+rChannel.name+"("+rChannel.id+")` on **message**: `id:"+rMessage+"` for people **reacting** with: "
																							+tempEmoji+", I will add or remove their **role**: `"+rRoleName+"("+rRoleID+")`");
																					}
																					else{
																						return channel.send("⛔ This channel's message with this `role` is already being tracked, "+member);
																					}
																				})
																				.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
																			}
																		}
																		else{return channel.send("⛔ I could not find role: `"+args[4]+"`, try again "+member+syntaxNarguments)}
																	}
																	else{return channel.send(incompleteData)}
																}
																else{return channel.send(incompleteData)}
															}
															else{return channel.send(incompleteData)}
														}
														else{return channel.send("⛔ The messageID: `"+args[2]+"` does not match any from that channel, "+member+syntaxNarguments)}
													}
													else{return channel.send("⛔ Third value `must` be number, a `messageID` from that channel, "+member+syntaxNarguments)}
												}
												else{return channel.send(incompleteData)}
											}
										})
										.catch(err=>{
											return channel.send("⛔ I couldn't fetch any messages...\n"+err.message)
										})
									}
									else{return channel.send("⛔ Second value `must` be a **channel** tag, "+member+syntaxNarguments)}
								}
								else{return channel.send("⛔ Second value `must` be a **channel** tag, "+member+syntaxNarguments)}
							}
							else{return channel.send("⛔ Second value `must` be a **channel** tag, "+member+syntaxNarguments)}
						}
					}
				}
				/*
				if(args[0]==="test"){
					
					console.info(message.content); let emoji=message.content.split(/ +/).slice(2); emoji=emoji.toString();
					console.info(Discord.Util.parseEmoji(emoji));
					
					let tempMSG="", tempRoleName="", start="", end="";
					if(args[4].startsWith("\"")){
						tempMSG=message.content;start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);end=tempMSG.indexOf("\"");tempMSG=tempMSG.slice(0,end);args[4]=tempMSG;
						channel.send(args[4])
					}
				}
				*/
			}
		}
	}
};