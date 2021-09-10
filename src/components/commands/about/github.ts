import { CommandInteraction, Message } from 'discord.js'
import BaseCommand from '../../../types/command'

class Command extends BaseCommand {
  constructor () {
    super ("github", "about", "links to github repository", {
      description: "links to github repository",
      name: "github",
    })
  }
  async execute_slash (interaction: CommandInteraction) {
    await interaction.reply({ content: "<https://github.com/anclint01/LDS-Bot>", ephemeral: true });
  }  
  async execute (message: Message) {
    await message.channel.send({ content: "https://github.com/anclint01/LDS-Bot" });
  }
}

export = Command
