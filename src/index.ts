import { getClient, login } from './constants/func';
import { messageHandler } from './handlers/message';
import voftheday from "../votd.json";
import { VOTD } from './handlers/VOTD';
import fs from "fs";
import schedule from "node-schedule";
import Database from 'better-sqlite3';
import CommandManager from './handlers/commands';
import { Client, GuildMember, Message } from 'discord.js';

const client: Client = getClient();
export const Manager: CommandManager = new CommandManager(client);
Manager.loadCommands("./src/components/commands");
export const commands = Manager.commands;

export const options = new Database('./src/database/options');
export const votd: VOTD = new VOTD();

export const votdverse = fs.readFileSync('./votdverse.txt', 'utf8');
export let randomVOTD: number;

if (votdverse != '') randomVOTD = parseInt(votdverse);
else {
  randomVOTD = Math.floor(Math.random() * voftheday.verses.length+1); 
  fs.writeFileSync('./votdverse.txt', randomVOTD.toString());
}
schedule.scheduleJob('0 0 * * *', () => {
  randomVOTD = Math.floor(Math.random() * voftheday.verses.length+1); 
  fs.writeFileSync('./votdverse.txt', randomVOTD.toString());
});

async function main () {
  client
  .on('ready', async () => {
    votd.setup();    
    let options_table;
    try {
      options_table = await options.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'options';").get();
    } catch (err) {
      console.log(err)
    }
    if (!options_table['count(*)']) {
      try {
        options.prepare("CREATE TABLE options (guildID TEXT, bible TEXT);").run();              
      } catch (err) {
        console.log(err)
      }      
    }
    console.log("READY!");
  })
  .on('messageCreate', messageHandler)
  .on('interactionCreate', async (i) => {
    if (i.isButton()) {
      if (i.customId.startsWith("delete")) {
        if (!i.member) return;
        let member = await (i.member as GuildMember).fetch();
        let user_id = i.customId.split("_")[1];
        if (member.permissions.has("MANAGE_MESSAGES") || member.user.id === user_id) {
          let m = await (i.message as Message).fetch();
          m.delete();
        } else {
          i.reply({content: "You cannot delete this reference as you were not the one to reference it OR you don't have MANAGE_MESSAGE perms", ephemeral: true})
        }
      }
    }

    if (!i.isCommand()) return;
    const commandName = i.commandName;
    if (commands.has(commandName.toLowerCase()) || commands.find((cmd: any) => cmd.aliases && cmd.aliases.includes(commandName.toLowerCase()))) {
      const command = commands.get(commandName.toLowerCase()) || commands.find((cmmd: any) => cmmd.aliases && cmmd.aliases.includes(commandName.toLowerCase()))
      
      if (!command) return;

      try {
        command.execute_slash(i);
      } catch (error) {
        console.error(error);
        await i.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    } else return
  });
  login();
}

main();
