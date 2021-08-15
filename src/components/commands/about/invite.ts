
import { Message } from 'discord.js'
import BaseCommand from '../../../command'

class Command extends BaseCommand {
  constructor () {
    super ("invite", "about", "links invite for LDS-Bot")
  }
  execute (message: Message, args: string[]) {
		message.channel.send({ content: "<https://discordapp.com/oauth2/authorize?permissions=93184&scope=bot&client_id=639271772818112564>" }).catch((err) => {
      console.log("Something went wrong: " + err);
    });
  }
}

export = Command
