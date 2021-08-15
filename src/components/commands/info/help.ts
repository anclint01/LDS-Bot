import { Message } from 'discord.js'
import BaseCommand from '../../../command'
import { Manager } from '../../../handlers/message'
import { getClient } from '../../../other/func'

const client = getClient();
class Command extends BaseCommand {
  constructor () {
    super ("help", "info", "Returns info on LDS-Bot commands")
  }
  async execute (message: Message, args: string[]) {
    let desc: string = "";
    
    if (!Manager) {
      return message.channel.send({content: "Failed to retrieve Command info"}).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    }

    if (args[0]) desc = Manager.helpInfo(args[0]);
    else desc = Manager.helpInfo();
    
    if (desc === "") {
      return message.channel.send({content: "For some reason I couldn't generate your help message :/"}).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    }
    await message.channel.send({embeds:[{
      color: 0x086587,
      title: "LDS-Bot by anclint#9255",
      author: {
        name: "LDS-Bot Help Menu",
      },
      description: "**Commands:**\n" + desc,
      fields: [
          {
              name: "Links",
              value: "Support Server: https://discord.gg/G6P6Pq8 \n Github: https://github.com/anclint01/LDS-Bot \n Invite: https://bit.ly/2KoBoPr",
              inline: false
          }
      ],
      footer: {
          text: "LDS-Bot",
          icon_url: client.user?.displayAvatarURL()
      }
  }]
    }).catch((err: any) => {
      console.log("Something went wrong: " + err);
    });
  }
}

export = Command