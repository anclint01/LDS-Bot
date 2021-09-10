
import { CommandInteraction, Message } from 'discord.js'
import BaseCommand from '../../../types/command'
import { getClient } from '../../../constants/func';
const client = getClient();

class Command extends BaseCommand {
  constructor () {
    super ("users", "about", "number of users across servers LDS-Bot is on", {
      description: "number of users across servers LDS-Bot is on",
      name: "users",
    })
  }

  async execute_slash (interaction: CommandInteraction) {
    await interaction.reply({ content: "‎‎‎",
      embeds: [{
          color: 0x086597,
          title: "LDS-Bot Users",
          description: "The number of users spanning accross all servers LDS-Bot is currently on has reached a concurrent " + `${client.users.cache.size}`
        }]
    }).catch((err) => {
      console.log("Something went wrong: " + err);
    });   
  }   

  execute (message: Message) {
    message.channel.send({ content: "‎‎‎",
      embeds: [{
          color: 0x086597,
          title: "LDS-Bot Users",
          description: "The number of users spanning accross all servers LDS-Bot is currently on has reached a concurrent " + `${client.users.cache.size}`
        }]
    }).catch((err) => {
      console.log("Something went wrong: " + err);
    });
  }
}

export = Command
