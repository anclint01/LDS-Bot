import { CommandInteraction, Message } from 'discord.js'
import { Manager } from '../../..';
import BaseCommand from '../../../types/command'
import { getClient } from '../../../constants/func'

const client = getClient();
class Command extends BaseCommand {
  constructor () {
    super ("help", "info", "Returns info on LDS-Bot commands", {
      name: "help",
      description: "Send info on LDS-Bot Commands"
    })
  }
  async execute_slash (interaction: CommandInteraction) {
    let desc: string = "";

    if (!Manager) {
      return await interaction.reply({content: "Failed to retrieve Command info", ephemeral: true}).catch((err: any) => {
        console.log("Something went wrong: " + err)
      })
    }    
    desc = Manager.helpInfo();

    if (desc === "") {
      return await interaction.reply({content: "For some reason I couldn't generate your help message :/", ephemeral: true}).catch((err: any) => {
        console.log("Something went wrong: " + err)
      })
    }  

    await interaction.reply({embeds:[{
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

  async execute (message: Message, args: string[]) {
    let desc: string = "";
    
    if (!Manager) {
      return message.channel.send({content: "Failed to retrieve Command info"}).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    }

    if (args[0]) {
       desc = Manager.helpInfo(args[0]);
      
       await message.channel.send({embeds:[{
        color: 0x086587,
        author: {
          name: "LDS-Bot Help Menu",
        },
        description: desc,
        footer: {
            text: "LDS-Bot",
            icon_url: client.user?.displayAvatarURL()
        }
       }]
      }).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    } else {
      desc = Manager.helpInfo();
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
    if (desc === "") {
      return message.channel.send({content: "For some reason I couldn't generate your help message :/"}).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    }
  }  
}

export = Command