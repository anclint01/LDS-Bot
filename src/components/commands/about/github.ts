import { Message } from 'discord.js'
import BaseCommand from '../../../command'

class Command extends BaseCommand {
  constructor () {
    super ("github", "about", "links to github repository")
  }
  execute (message: Message, args: string[]) {
    message.channel.send({ content: "https://github.com/anclint01/LDS-Bot" });
  }
}

export = Command
