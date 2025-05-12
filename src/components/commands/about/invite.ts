
import { CommandInteraction, Message } from 'discord.js'
import BaseCommand from '../../../types/command'

class Command extends BaseCommand {
  constructor () {
    super ("invite", "about", "links invite for LDS-Bot", {
      description: "links to invite for LDS-Bot",
      name: "invite"
    })
  }
  async execute_slash (interaction: CommandInteraction) {
    await interaction.reply({ content: "<https://discord.com/api/oauth2/authorize?client_id=639271772818112564&permissions=0&scope=bot%20applications.commands>", ephemeral: true}).catch((err) => {
      console.log("Something went wrong: " + err);
    });
  }  
  async execute (message: Message, args?: string[]) {
		await message.channel.send({ content: "<https://discordapp.com/oauth2/authorize?permissions=93184&scope=bot&client_id=639271772818112564>" }).catch((err) => {
      console.log("Something went wrong: " + err);
    });
  }
}

export = Command
