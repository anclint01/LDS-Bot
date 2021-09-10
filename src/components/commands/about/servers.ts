
import { CommandInteraction, Message } from 'discord.js'
import BaseCommand from '../../../types/command'
import { getClient } from '../../../constants/func';
const client = getClient();

class Command extends BaseCommand {
  constructor () {
    super ("servers", "about", "number of servers LDS-Bot is on", {
      description: "number of servers LDS-Bot is on",
      name: "servers",
    })
  }

  async execute_slash (interaction: CommandInteraction) {
    await interaction.reply({ content: "‎‎‎",
      embeds: [{
          color: 0x086597,
          title: "LDS-Bot Servers",
          description: "LDS-Bot has reached a total of **" + `${client.guilds.cache.size}` + "** servers"
      }]
    }).catch((err) => {
      console.log("Something went wrong: " + err);
    });    
  }  

  async execute (message: Message) {
    await message.channel.send({ content: "‎‎‎",
      embeds: [{
          color: 0x086597,
          title: "LDS-Bot Servers",
          description: "LDS-Bot has reached a total of **" + `${client.guilds.cache.size}` + "** servers"
      }]
    }).catch((err) => {
      console.log("Something went wrong: " + err);
    });
  }
}

export = Command
