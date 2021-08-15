
import { Message } from 'discord.js'
import BaseCommand from '../../../command'
import { getClient } from '../../../other/func';
const client = getClient();

class Command extends BaseCommand {
  constructor () {
    super ("servers", "about", "number of servers LDS-Bot is on")
  }
  execute (message: Message, args: string[]) {
    message.channel.send({ content: "‎‎‎",
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
