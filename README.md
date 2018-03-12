<img src="https://raw.githubusercontent.com/JennerPalacios/PokeHelp-Bot/master/img/screenShots/infoBot.png" />

# VISIT THE WIKI FOR INFO, AND SCREENSHOTS

For suggestions, concerns, troubleshoot, new features, updates, etc, join my discord server: 

https://discord.gg/fJvqFGP

# PokéHelp[bot] 2.0

A Discord bot - written in JavaScript - for Pokémon Go discord servers. This bot contains a plethora of usefull features... and more to come!

-Disclaimer: I am **NOT** a ["python","javascript","discord.js"] expert so I bet there are people out there that can make something better.

A **Notepad++** style theme included: `DiscordJs.xml`
Installation:
   * Copy this file to "`%APPDATA%\Notepad++\themes`"
      * ▲ [WIN]+[R] Shortcut to open up RUN prompt, and paste: `%APPDATA%\Notepad++\themes`
   * Open Notepad++, Task Menu Bar » `Settings` » `Style Configurator` » Select Theme: `DiscorJs`

# REQUIREMENTS:

1) Node.js (https://nodejs.org/en/download/ `ver 8.4+`)

2) Discord.js (`npm install discord.js` « should be `ver 11.3+`) 

3) SQLite (`npm install sqlite`) 

4) File-System (`npm install fs`) 

5) Request (`npm install request`) 

6) Bot Token: https://discordapp.com/developers/applications/me  

7) And assign bot access to your server: https://finitereality.github.io/permissions/?v=0
-with **Admin** role access, or... permissions to manage roles, channels, and messages... it's your bot, so it is safe!

<hr />

# SETTING IT UP:

1. Download `Node.js` (you probably have it already if running RocketMap/Monocle)

2. Run command: `git clone https://github.com/JennerPalacios/PokeHelp-Bot.git`, once done cloning, open the folder.

3. Open command prompt in this location or click on the handy batch file: `0---start-cmd-here---0` and type the following commands:
   * `npm install discord.js` and
   * `npm install sqlite` and
   * `npm install fs` and
   * `npm install request`

4. Create an applicaiton and get the your bot's secret token, and application ID at:
   * https://discordapp.com/developers/applications/me 

5. Get your application/bot to join your server by going here:
   * https://discordapp.com/developers/tools/permissions-calculator
   * Check the boxes for whatever level of power (permissions) you want your bot to have
     * Minimum requirements: manage roles, mannage channels, and manage messages
     * Manage roles, it will only be able to manage roles that are **below** his role/permissions
   * Use the URL that page generates and go to it, and you will be asked to log into your discord, have **Admin** access in order to get the bot to join that server.

5. Fill out the information needed in `files/config.json` (use example or spm as example), and launch each module!

<hr />

# LAUNCHING IT:

Using command prompt or bash: `node adminBot.js`
  * and then: `node userBot.js`

-If you close that window, the bot connection will be terminated!

**Optional**: you can install pm2 to have it run in the background

<hr />

# PM2:

PM2 allows you to run processes in the background, you can access PM2 from anywhere, but for a process to start it needs to come from the folder where the file is located.

`npm install pm2 -g`

`pm2 start adminBot.js`
`pm2 start userBot.js`

To modify the file and keep bot up-to-date (auto reloading):

`pm2 start adminBot.js --watch`

Other Commands:

`pm2 log` (display log)

`pm2 list` (display a list of running processes)

`pm2 stop NAME/ID`
