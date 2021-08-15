
import { Message } from 'discord.js'
import BaseCommand from '../../../command'
import { getClient } from '../../../other/func';
const client = getClient();

class Command extends BaseCommand {
  constructor () {
    super ("users", "about", "number of users accross servers LDS-Bot is on")
  }
  execute (message: Message, args: string[]) {
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
