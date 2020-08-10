//
// FUNCTION: TIME STAMP
//
function ts(cc){
	let CurrTime=new Date();
	let mo=CurrTime.getMonth()+1;if(mo<10){mo="0"+mo;}let da=CurrTime.getDate();if(da<10){da="0"+da;}let yr=CurrTime.getFullYear();
	let hr=CurrTime.getHours();if(hr<10){hr="0"+hr;}let min=CurrTime.getMinutes();if(min<10){min="0"+min;}let sec=CurrTime.getSeconds();if(sec<10){sec="0"+sec;}
	return cc.blue+yr+"/"+mo+"/"+da+" "+hr+":"+min+":"+sec+cc.reset+" |";
}

module.exports={
	name: "roleall",
	aliases: ["ra"],
	async execute(timeStamp,timeStampEmbed,cc,message,sid,botGuilds,botChannels,botUsers,botConfig,serverSettings,globalSettings,discordVersion,processVersion){
		
		// GRAB ARGUMENTS 
		let args=message.content.toLowerCase().split(/ +/).slice(1),ARGS=message.content.split(/ +/).slice(1),
			mentionMember="notMentioned",mentionChannel={},guild=message.guild,channel=message.channel,member=message.member;
		
		// CHECK IF SOMEONE WAS MENTIONED AND THAT USER EXIST WITHIN MY OWN SERVER
		if(message.mentions.users.first()){mentionMember=await guild.fetchMember(message.mentions.users.first())}
		
		// GRAB ADMINS AND MODERATORS
		let adminRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].adminRoleName);
			if(!adminRole){
				adminRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"adminRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].adminRoleName+cc.reset+" for server: "
					+cc.lblue+message.guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
		let modRole=guild.roles.find(role=>role.name===serverSettings.servers[sid].modRoleName);
			if(!modRole){
				modRole={"id":"10101"};console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" I could not find "
					+cc.red+"modRoleName"+cc.reset+": "+cc.cyan+serverSettings.servers[sid].modRoleName+cc.reset+" for server: "
					+cc.lblue+message.guild.name+cc.reset+" in "+cc.purple+"serverSettings.json"+cc.reset)}
		
		// DEFAULT EMBED MESSAGE
		let embedMSG={
			"embed": {
				"color": 0xFF0000,
				"title": "ℹ Available Syntax and Arguments ℹ",
				"description": "```md\n"+botConfig.cmdPrefix+"roleAll <roleName>\n"
					+botConfig.cmdPrefix+"roleAll <roleName> if no role\n"
					+botConfig.cmdPrefix+"roleAll <roleName> if <roleName>\n"
					+botConfig.cmdPrefix+"roleAll <roleName> if not <roleName>```",
				"footer": { "text": "More commands in → "+botConfig.cmdPrefix+"roleAll remove" }
			}
		};
		
		if(message.member.roles.has(modRole.id) || message.member.roles.has(adminRole.id) || message.member.id===botConfig.ownerID){
			let [roleToAdd,roleToRemove,roleConditions,tempMSG,tempRole,start,end,argsToSlice]=["","",[],"","","","",""];
			if(args.length<1){
				return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			
			//
			// REMOVE ROLE FROM ALL MEMBERS
			//
			if(args[0]==="remove"){
				if(args.length<2){
					embedMSG={
						"embed": {
							"color": 0xFF0000,
							"title": "ℹ Available Syntax and Arguments ℹ",
							"description": "```md\n"+botConfig.cmdPrefix+"roleAll remove <roleName>\n"
								+botConfig.cmdPrefix+"roleAll remove <roleName> if only role\n"
								+botConfig.cmdPrefix+"roleAll remove <roleName> if <roleName>\n"
								+botConfig.cmdPrefix+"roleAll remove <roleName> if not <roleName>\n"
								+botConfig.cmdPrefix+"roleAll remove allRoles <@mention/id>\n"
								+botConfig.cmdPrefix+"roleAll remove allRoles if not <roleName>```",
							"footer": { "text": "More commands in → "+botConfig.cmdPrefix+"roleAll" }
						}
					};
					return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(args[1]==="allroles"){
					let protectedMembers=[],protectedRoles=[];protectedMembers.push(botConfig.ownerID, adminRole.id, modRole.id);
					if(serverSettings.servers[sid].protectedRoles){
						if(serverSettings.servers[sid].protectedRoles.skipMemberIfRoleIDs){
							if(serverSettings.servers[sid].protectedRoles.skipMemberIfRoleIDs.length>0){
								protectedMembers.push(serverSettings.servers[sid].protectedRoles.skipMemberIfRoleIDs)
							}
						}
						if(serverSettings.servers[sid].protectedRoles.skipRemovingRoleIDs){
							if(serverSettings.servers[sid].protectedRoles.skipRemovingRoleIDs.length>0){
								protectedRoles=serverSettings.servers[sid].protectedRoles.skipRemovingRoleIDs;
							}
						}
					}
					if(args.length<3){
						embedMSG={
							"embed": {
								"color": 0xFF0000,
								"title": "ℹ Available Syntax and Arguments ℹ",
								"description": "```md\n"+botConfig.cmdPrefix+"roleAll remove allRoles <@mention/id>\n"
									+botConfig.cmdPrefix+"roleAll remove allRoles if not <roleName>```"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					if(args[2].startsWith("<@") || Number.isInteger(parseInt(args[2]))){
						if(!args[2].startsWith("<@") && args[2].length>17){
							mentionMember=await guild.fetchMember(botUsers.get(args[2]));
						}
						console.info("protectedMembers: "+protectedMembers);//
						if(protectedMembers.some(roleID=>mentionMember.roles.has(roleID))){
							console.info(ts(cc)+" Unable to remove roles from "+cc.cyan+mentionMember.user.username+cc.reset+"("+cc.lblue+mentionMember.id+cc.reset
								+") has a "+cc.green+"HIGH"+cc.reset+" level role");
							return channel.send("⛔ I'm unable to remove **any** roles from "+mentionMember+", they have a **HIGH** level role protecting them, "+member);
						}
						else{
							channel.send("✅ Okay "+member+", I will **remove** `ALL` roles, except protected roles, from "+mentionMember);
							let tempRoleExeption=[], roleExeption="";
							if(protectedRoles.length>0){
								for(let r=0;r<protectedRoles.length;r++){
									if(mentionMember.roles.has(protectedRoles[r])){
										tempRoleExeption.push(protectedRoles[r])
									}
								}
							}
							if(tempRoleExeption.length<1){
								//member did not have any exeption roles
								//console.info("The member below will not keep any roles");//
							}
							else{
								roleExeption=", "+cc.green+"exept "+tempRoleExeption.length+cc.reset+" protected roles,"
								//console.info("The member below gets to keep: "+tempRoleExeption.join(", "));//
							}
							console.info(ts(cc)+" Removing "+cc.yellow+"ALL"+cc.reset
								+" roles"+roleExeption+" from member: "+cc.cyan+mentionMember.user.username+cc.reset+"("+cc.lblue+mentionMember.id+cc.reset+")");						
							mentionMember.setRoles(tempRoleExeption)
							.then(()=>channel.send("✅ I'm done "+member+"! I have removed `ALL` roles from "+mentionMember))
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}						
						return;
					}
					
					
					if(args[4].startsWith("\"")){
						start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
						end=tempMSG.indexOf("\"");tempRole=tempMSG.slice(0,end);end++;tempMSG=tempMSG.slice(end);roleConditions.push(tempRole);
						args=tempMSG.toLowerCase().split(/ +/).slice(1),ARGS=tempMSG.split(/ +/).slice(1);
						args.unshift("remove","fakeArg");ARGS.unshift("remove","fakeArg");
						
					}
					else{
						roleConditions.push(ARGS[4]);tempMSG=message.content;tempRole=ARGS[4];
					}
					if(roleConditions.length<2){
						//
						// REMOVE ALL ROLES IF NOT A CERTAIN ROLE
						//
						roleCondition=guild.roles.find(role=>role.name===roleConditions[0]) || "notFound";
						if(roleCondition==="notFound"){
							return channel.send("⛔ I couldn't find role: `"+tempRole+"`, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						console.info(ts(cc)+" Removing "+cc.lblue+"ALL"+cc.reset+" roles from "+cc.green+"ALL"+cc.reset+" members "+cc.yellow+"if"+cc.reset
							+" they don't have "+cc.cyan+"@"+roleConditions[0]+cc.reset);
						let membersWithCorrectRole=message.guild.members.filter(member=>!member.roles.has(roleCondition.id));
						let mappedMembers=membersWithCorrectRole.map(member=>member);
						let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
						channel.send("✅ Okay, I will **remove** `ALL` from **"+mappedMembers.length+"** members that **don't have** `@"+roleCondition.name+"` role, "+member);
						//
						//if(mappedMembers.length>50){mappedMembers.length=50}//
						//
						for(var i=0;i<mappedMembers.length;i++){
							setTimeout(function(){
								if(protectedMembers.some(roleID=>mappedMembers[currentUser].roles.has(roleID))){
									console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Skipped: "
										+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset
										+"), member has a "+cc.green+"HIGH"+cc.reset+" level role");
								}
								else{
									let tempRoleExeption=[], roleExeption="";
									if(protectedRoles.length>0){
										for(let r=0;r<protectedRoles.length;r++){
											if(mappedMembers[currentUser].roles.has(protectedRoles[r])){
												tempRoleExeption.push(protectedRoles[r])
											}
										}
									}
									if(tempRoleExeption.length<1){
										//member did not have any exeption roles
										//console.info("The member below will not keep any roles");//
									}
									else{
										roleExeption=", "+cc.green+"exept "+tempRoleExeption.length+cc.reset+" protected roles,"
										//console.info("The member below gets to keep: "+tempRoleExeption.join(", "));//
									}
									console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Removing "+cc.yellow+"ALL"+cc.reset
										+" roles"+roleExeption+" from member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
									mappedMembers[currentUser].setRoles(tempRoleExeption).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was removed, but console could not keep up | "+err.message))
								}
								if(memberCount===mappedMembers.length){
									channel.send("✅ Done! I have removed `ALL` roles from **"+mappedMembers.length+"** members, "+member)
								}
								currentUser++;memberCount++
							}, currentMilliseconds);
							currentMilliseconds=currentMilliseconds+millisecondsToAdd
						}
						return
					}
				}
				if(args[1].startsWith("\"")){
					tempMSG=message.content;start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
					end=tempMSG.indexOf("\"");tempRole=tempMSG.slice(0,end);end++;tempMSG=tempMSG.slice(end);roleToRemove=tempRole;
					args=tempMSG.toLowerCase().split(/ +/).slice(1),ARGS=tempMSG.split(/ +/).slice(1);
					args.unshift("remove","fakeArg");ARGS.unshift("remove","fakeArg");
				}
				else{
					roleToRemove=ARGS[1];tempMSG=message.content;tempRole=ARGS[1];
				}
				roleToRemove=guild.roles.find(role=>role.name===roleToRemove) || "notFound";
				if(roleToRemove==="notFound"){
					return channel.send("⛔ I couldn't find role: `"+tempRole+"`, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
						.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(args.length<3){
					//
					// REMOVE ROLE FROM ALL MEMBERS
					//
					console.info(ts(cc)+" Removing role: "+cc.lblue+"@"+roleToRemove.name+cc.reset+" from "+cc.green+"ALL"+cc.reset+" members that have it");
					let membersWithCorrectRole=message.guild.members.filter(member=>member.roles.has(roleToRemove.id));
					let mappedMembers=membersWithCorrectRole.map(member=>member);
					let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
					channel.send("✅ Okay, I will **remove** role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members that have it, "+member);
					for(var i=0;i<mappedMembers.length;i++){
						setTimeout(function(){
							console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Removing role: "+cc.yellow+"@"+roleToRemove.name+cc.reset
								+" from member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
							mappedMembers[currentUser].removeRole(roleToRemove).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was removed, but console could not keep up | "+err.message))
							if(memberCount===mappedMembers.length){
								channel.send("✅ Done! I have removed role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members, "+member)
							}
							currentUser++;memberCount++
						}, currentMilliseconds);
						currentMilliseconds=currentMilliseconds+millisecondsToAdd
					}
					return
				}
				if(args[2]==="if"){
					if(args.length<4){
						embedMSG={
							"embed": {
								"color": 0xFF0000,
								"title": "ℹ Available Syntax and Arguments ℹ",
								"description": "```md\n"+botConfig.cmdPrefix+"roleAll remove <roleName> if only role\n"
									+botConfig.cmdPrefix+"roleAll remove <roleName> if <roleName>\n"
									+botConfig.cmdPrefix+"roleAll remove <roleName> if not <roleName>```"
							}
						};
						return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					//roleall remove NAME if no NAME
					if(args[3]==="no" || args[3]==="not" || args[3]==="only"){
						if(args[4]==="role"){
							//
							// REMOVE ROLE IF NO ROLE
							//
							console.info(ts(cc)+" Removing role: "+cc.lblue+"@"+roleToRemove.name+cc.reset+" from "+cc.green+"ALL"+cc.reset+" members "+cc.yellow+"if"+cc.reset
								+" they don't have "+cc.cyan+"any other role"+cc.reset);
							let membersWithCorrectRole=message.guild.members.filter(member=>{return member.roles.size===2 && member.roles.has(roleToRemove.id)});
							let mappedMembers=membersWithCorrectRole.map(member=>member);
							let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
							channel.send("✅ Okay, I will **remove** role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members that **don't have** `any` role, "+member);
							for(var i=0;i<mappedMembers.length;i++){
								setTimeout(function(){
									console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Removing role: "+cc.yellow+"@"+roleToRemove.name+cc.reset
										+" from member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
									mappedMembers[currentUser].removeRole(roleToRemove).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was removed, but console could not keep up | "+err.message))
									if(memberCount===mappedMembers.length){
										channel.send("✅ Done! I have removed role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members, "+member)
									}
									currentUser++;memberCount++
								}, currentMilliseconds);
								currentMilliseconds=currentMilliseconds+millisecondsToAdd
							}
							return
						}
						if(args[4].startsWith("\"")){
							start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
							end=tempMSG.indexOf("\"");tempRole=tempMSG.slice(0,end);end++;tempMSG=tempMSG.slice(end);roleConditions.push(tempRole);
							args=tempMSG.toLowerCase().split(/ +/).slice(1),ARGS=tempMSG.split(/ +/).slice(1);
							args.unshift("remove","fakeArg");ARGS.unshift("remove","fakeArg");
							
						}
						else{
							roleConditions.push(ARGS[4]);tempMSG=message.content;tempRole=ARGS[4];
						
						}
						if(roleConditions.length<2){
							//
							// REMOVE ROLE IF NOT A CERTAIN ROLE
							//
							roleCondition=guild.roles.find(role=>role.name===roleConditions[0]) || "notFound";
							if(roleCondition==="notFound"){
								return channel.send("⛔ I couldn't find role: `"+tempRole+"`, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
									.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
							}
							console.info(ts(cc)+" Removing role: "+cc.lblue+"@"+roleToRemove.name+cc.reset+" from "+cc.green+"ALL"+cc.reset+" members "+cc.yellow+"if"+cc.reset
								+" they don't have "+cc.cyan+"@"+roleConditions[0]+cc.reset);
							let membersWithCorrectRole=message.guild.members.filter(member=>{return member.roles.has(roleToRemove.id) && !member.roles.has(roleCondition.id)});
							let mappedMembers=membersWithCorrectRole.map(member=>member);
							let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
							channel.send("✅ Okay, I will **remove** role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members that **don't have** `@"+roleCondition.name+"` role, "+member);
							for(var i=0;i<mappedMembers.length;i++){
								setTimeout(function(){
									console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Removing role: "+cc.yellow+"@"+roleToRemove.name+cc.reset
										+" from member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
									mappedMembers[currentUser].removeRole(roleToRemove).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was removed, but console could not keep up | "+err.message))
									if(memberCount===mappedMembers.length){
										channel.send("✅ Done! I have removed role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members, "+member)
									}
									currentUser++;memberCount++
								}, currentMilliseconds);
								currentMilliseconds=currentMilliseconds+millisecondsToAdd
							}
							return
						}
					}
					if(args[3].startsWith("\"")){
						start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
						end=tempMSG.indexOf("\"");tempRole=tempMSG.slice(0,end);end++;tempMSG=tempMSG.slice(end);roleConditions.push(tempRole);
						args=tempMSG.toLowerCase().split(/ +/).slice(1),ARGS=tempMSG.split(/ +/).slice(1);
						args.unshift("remove","fakeArg");ARGS.unshift("remove","fakeArg");
					}
					else{
						roleConditions.push(ARGS[3]);tempMSG=message.content;
					}
					if(roleConditions.length<2){
						//
						// REMOVE ROLE IF A CERTAIN ROLE
						//
						roleCondition=guild.roles.find(role=>role.name===roleConditions[0]) || "notFound";
						if(roleCondition==="notFound"){
							return channel.send("⛔ I couldn't find role: `"+tempRole+"`, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						console.info(ts(cc)+" Removing role: "+cc.lblue+"@"+roleToRemove.name+cc.reset+" from "+cc.green+"ALL"+cc.reset+" members "+cc.yellow+"if"+cc.reset
							+" they have "+cc.cyan+"@"+roleConditions[0]+cc.reset);
						let membersWithCorrectRole=message.guild.members.filter(member=>{return member.roles.has(roleToRemove.id) && member.roles.has(roleCondition.id)});
						let mappedMembers=membersWithCorrectRole.map(member=>member);
						let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
						channel.send("✅ Okay, I will **remove** role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members that **have** `@"+roleCondition.name+"` role, "+member);
						for(var i=0;i<mappedMembers.length;i++){
							setTimeout(function(){
								console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Removing role: "+cc.yellow+"@"+roleToRemove.name+cc.reset
									+" from member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
								mappedMembers[currentUser].removeRole(roleToRemove).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was removed, but console could not keep up | "+err.message))
								if(memberCount===mappedMembers.length){
									channel.send("✅ Done! I have removed role: `@"+roleToRemove.name+"` from **"+mappedMembers.length+"** members, "+member)
								}
								currentUser++;memberCount++
							}, currentMilliseconds);
							currentMilliseconds=currentMilliseconds+millisecondsToAdd
						}
						return
						roleCondition=guild.roles.find(role=>role.name===roleConditions[0]) || "notFound";
						if(roleCondition==="notFound"){
							return channel.send("⛔ I couldn't find such role, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
					}
				}
				return
			}
			
			//
			// ADD ROLES TO MEMBER
			//
			if(args[0].startsWith("\"")){
				tempMSG=message.content;start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
				end=tempMSG.indexOf("\"");tempRole=tempMSG.slice(0,end);end++;tempMSG=tempMSG.slice(end);roleToAdd=tempRole;
				args=tempMSG.toLowerCase().split(/ +/).slice(1),ARGS=tempMSG.split(/ +/).slice(1);
				args.unshift("fakeArg");ARGS.unshift("fakeArg");
			}
			else{
				roleToAdd=ARGS[0];tempMSG=message.content;tempRole=ARGS[0]
			}
			roleToAdd=guild.roles.find(role=>role.name===roleToAdd) || "notFound";
			if(roleToAdd==="notFound"){
				return channel.send("⛔ I couldn't find role: `"+tempRole+"`, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
					.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
			}
			if(args.length<2){
				//
				// ADD ROLE TO ALL MEMBERS
				//
				console.info(ts(cc)+" Adding role: "+cc.lblue+"@"+roleToAdd.name+cc.reset+" to "+cc.green+"ALL"+cc.reset+" members that don't have it.");
				let membersWithCorrectRole=message.guild.members.filter(member=>!member.roles.has(roleToAdd.id));
				let mappedMembers=membersWithCorrectRole.map(member=>member);
				let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
				channel.send("✅ Okay, I will **add** role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members that **don't** have it, "+member);
				for(var i=0;i<mappedMembers.length;i++){
					setTimeout(function(){
						console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Adding role: "+cc.yellow+"@"+roleToAdd.name+cc.reset
							+" to member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
						mappedMembers[currentUser].addRole(roleToAdd).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was added, but console could not keep up | "+err.message))
						if(memberCount===mappedMembers.length){
							channel.send("✅ Done! I have added role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members, "+member)
						}
						currentUser++;memberCount++
					}, currentMilliseconds);
					currentMilliseconds=currentMilliseconds+millisecondsToAdd
				}
				return
			}
			if(args[1]==="if"){
				if(args.length<3){
					embedMSG={
						"embed": {
							"color": 0xFF0000,
							"title": "ℹ Available Syntax and Arguments ℹ",
							"description": "```md\n"+botConfig.cmdPrefix+"roleAll <roleName> if no role\n"
								+botConfig.cmdPrefix+"roleAll <roleName> if <roleName>\n"
								+botConfig.cmdPrefix+"roleAll <roleName> if not <roleName>```"
						}
					};
					return channel.send(embedMSG).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
				}
				if(args[2]==="no" || args[2]==="not"){
					if(args[3]==="role"){
						//
						// ADD ROLE IF NO ROLE
						//
						console.info(ts(cc)+" Adding role: "+cc.lblue+"@"+roleToAdd.name+cc.reset+" to "+cc.green+"ALL"+cc.reset+" members "+cc.yellow+"if"+cc.reset
							+" they don't have "+cc.cyan+"any role"+cc.reset);
						let membersWithCorrectRole=message.guild.members.filter(member=>member.roles.size===1);
						let mappedMembers=membersWithCorrectRole.map(member=>member);
						let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
						channel.send("✅ Okay, I will **add** role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members that **don't have** `any` role, "+member);
						for(var i=0;i<mappedMembers.length;i++){
							setTimeout(function(){
								console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Adding role: "+cc.yellow+"@"+roleToAdd.name+cc.reset
									+" to member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
								mappedMembers[currentUser].addRole(roleToAdd).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was added, but console could not keep up | "+err.message))
								if(memberCount===mappedMembers.length){
									channel.send("✅ Done! I have added role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members, "+member)
								}
								currentUser++;memberCount++
							}, currentMilliseconds);
							currentMilliseconds=currentMilliseconds+millisecondsToAdd
						}
						return
					}
					if(args[3].startsWith("\"")){
						start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
						end=tempMSG.indexOf("\"");tempRole=tempMSG.slice(0,end);end++;tempMSG=tempMSG.slice(end);roleConditions.push(tempRole);
						args=tempMSG.toLowerCase().split(/ +/).slice(1),ARGS=tempMSG.split(/ +/).slice(1);
						args.unshift("fakeArg");ARGS.unshift("fakeArg");
						
					}
					else{
						roleConditions.push(ARGS[3]);tempMSG=message.content;tempRole=ARGS[3]
					}
					if(roleConditions.length<2){
						//
						// ADD ROLE IF NOT A CERTAIN ROLE
						//
						roleCondition=guild.roles.find(role=>role.name===roleConditions[0]) || "notFound";
						if(roleCondition==="notFound"){
							return channel.send("⛔ I couldn't find role: `"+tempRole+"`, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
								.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
						}
						console.info(ts(cc)+" Adding role: "+cc.lblue+"@"+roleToAdd.name+cc.reset+" to "+cc.green+"ALL"+cc.reset+" members "+cc.yellow+"if"+cc.reset
							+" they don't have "+cc.cyan+"@"+roleConditions[0]+cc.reset);
						let membersWithCorrectRole=message.guild.members.filter(member=>{return !member.roles.has(roleToAdd.id) && !member.roles.has(roleCondition.id)});
						let mappedMembers=membersWithCorrectRole.map(member=>member);
						let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
						channel.send("✅ Okay, I will **add** role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members that **don't have** `"+roleCondition.name+"` role, "+member);
						for(var i=0;i<mappedMembers.length;i++){
							setTimeout(function(){
								console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Adding role: "+cc.yellow+"@"+roleToAdd.name+cc.reset
									+" to member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
								mappedMembers[currentUser].addRole(roleToAdd).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was added, but console could not keep up | "+err.message))
								if(memberCount===mappedMembers.length){
									channel.send("✅ Done! I have added role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members, "+member)
								}
								currentUser++;memberCount++
							}, currentMilliseconds);
							currentMilliseconds=currentMilliseconds+millisecondsToAdd
						}
						return
					}
				}
				if(args[2].startsWith("\"")){
					start=tempMSG.indexOf("\"");start++;tempMSG=tempMSG.slice(start);
					end=tempMSG.indexOf("\"");tempRole=tempMSG.slice(0,end);end++;tempMSG=tempMSG.slice(end);roleConditions.push(tempRole);
					args=tempMSG.toLowerCase().split(/ +/).slice(1),ARGS=tempMSG.split(/ +/).slice(1);
					args.unshift("fakeArg");ARGS.unshift("fakeArg");
				}
				else{
					roleConditions.push(ARGS[2]);tempMSG=message.content;
				}
				if(roleConditions.length<2){
					//
					// ADD ROLE IF A CERTAIN ROLE
					//
					roleCondition=guild.roles.find(role=>role.name===roleConditions[0]) || "notFound";
					if(roleCondition==="notFound"){
						return channel.send("⛔ I couldn't find role: `"+tempRole+"`, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
					console.info(ts(cc)+" Adding role: "+cc.lblue+"@"+roleToAdd.name+cc.reset+" to "+cc.green+"ALL"+cc.reset+" members "+cc.yellow+"if"+cc.reset
						+" they have "+cc.cyan+"@"+roleConditions[0]+cc.reset);
					let membersWithCorrectRole=message.guild.members.filter(member=>{return !member.roles.has(roleToAdd.id) && member.roles.has(roleCondition.id)});
					let mappedMembers=membersWithCorrectRole.map(member=>member);
					let currentMilliseconds=1500,millisecondsToAdd=1500,currentUser=0,memberCount=1;
					channel.send("✅ Okay, I will **add** role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members that **have** `@"+roleCondition.name+"` role, "+member);
					for(var i=0;i<mappedMembers.length;i++){
						setTimeout(function(){
							console.info(ts(cc)+" ["+cc.yellow+memberCount+cc.reset+"/"+cc.green+mappedMembers.length+cc.reset+"] Adding role: "+cc.yellow+"@"+roleToAdd.name+cc.reset
								+" to member: "+cc.cyan+mappedMembers[currentUser].user.username+cc.reset+"("+cc.lblue+mappedMembers[currentUser].id+cc.reset+")");						
							mappedMembers[currentUser].addRole(roleToAdd).catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" Role was added, but console could not keep up | "+err.message))
							if(memberCount===mappedMembers.length){
								channel.send("✅ Done! I have added role: `@"+roleToAdd.name+"` to **"+mappedMembers.length+"** members, "+member)
							}
							currentUser++;memberCount++
						}, currentMilliseconds);
						currentMilliseconds=currentMilliseconds+millisecondsToAdd
					}
					return
					roleCondition=guild.roles.find(role=>role.name===roleConditions[0]) || "notFound";
					if(roleCondition==="notFound"){
						return channel.send("⛔ I couldn't find such role, please try again "+member+"```md\n"+botConfig.cmdPrefix+"roles search <roleName>```")
							.catch(err=>console.info(timeStamp+" "+cc.hlred+" ERROR "+cc.reset+" "+err.message))
					}
				}
			}
		}
	}
};