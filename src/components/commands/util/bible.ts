import { Statement } from 'better-sqlite3';
import { ButtonInteraction, CommandInteraction, GuildManager, GuildMember, Interaction, InteractionCollector, Message, MessageComponentInteraction } from 'discord.js'
import { options } from '../../..';
import BaseCommand from '../../../types/command'
import { checkPerms } from '../../../constants/func';

class Command extends BaseCommand {
  constructor () {
    super ("bible", "util", "enable/disable bible support", {
      name: "bible",
      description: "Enable/Disable bible support for the server"
    })
  }
  async execute_slash (interaction: CommandInteraction) {
    if (!checkPerms(interaction.member as GuildMember, "MANAGE_GUILD")) {
      await interaction.reply({content: "You do not have the MANAGE_GUILD permission and cannot edit this setting", ephemeral: true}).catch((err: any) => {
        console.log("Something went wrong: " + err)
      })

      return;
    }

    let option = await options.prepare(`SELECT bible FROM options WHERE guildID = ?`).get(interaction.guild?.id);
    if (!option) {
      options.prepare(`INSERT INTO options (guildID, bible) VALUES (?, ?);`).run(interaction.guild?.id, "no");

      option = await options.prepare(`SELECT bible FROM options WHERE guildID = ?`).get(interaction.guild?.id);
    } 
    
    const buttons: Array<any> = [
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            customId: "enable/disable",
            label: `${option.bible === "no" ? "Enable" : "Disable"}`,
            style: "PRIMARY"
          },
          {
            type: "BUTTON",
            customId: "cancel_bible",
            label: "Cancel",
            style: "DANGER"
          }
        ]
      }
    ];

    let action = options.prepare("UPDATE options SET bible = ? WHERE guildID = ?");
    await interaction.reply({content: `Bible support for this Guild is currently ${option.bible === "no" ? "disabled (note that enabling it could interfere with BibleBot if you also have it on your server)" : "enabled"} if you would like to ${option.bible === "no" ? "enable" : "disable"} it, click the appropiate button.\n\nNOTE: You can only enable/disable this feature if you have the MANAGE_GUILD permission.`, components: buttons, ephemeral: true }).catch((err) => {
      console.log("Something went wrong: " + err);
    });
    
    let filter = (i: Interaction) => !i.user.bot && i.user.id === interaction.user.id && i.isButton();
    let collector: InteractionCollector<MessageComponentInteraction> = interaction.channel?.createMessageComponentCollector({filter,  time: 15000 })!;
    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.customId == "enable/disable") {          
        action.run(option.bible === "no" ? "yes" : "no", interaction.guild?.id);                            
        await i.reply({content: `Successfuly ${option.bible === "no" ? "enabled" : "disabled"}`, ephemeral: true});
        return collector.stop();
      } else if (i.customId == "cancel_bible") {
        await i.reply({content: "Cancelled", ephemeral: true})
        return collector.stop();
      }
    })
  }

  async execute (message: Message, args: string[]) {
    if (!checkPerms(message.member!, "MANAGE_GUILD")) {
      return message.channel.send({content: "You do not have the MANAGE_GUILD permission and cannot edit this setting"}).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    }

    let option = await options.prepare(`SELECT bible FROM options WHERE guildID = ?`).get(message.guild?.id);
    if (!option) {
      options.prepare(`INSERT INTO options (guildID, bible) VALUES (?, ?);`).run(message.guild?.id, "no");

      option = await options.prepare(`SELECT bible FROM options WHERE guildID = ?`).get(message.guild?.id);
    } 
    
    const buttons: Array<any> = [
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            customId: "enable/disable",
            label: `${option.bible === "no" ? "Enable" : "Disable"}`,
            style: "PRIMARY"
          },
          {
            type: "BUTTON",
            customId: "cancel_bible",
            label: "Cancel",
            style: "DANGER"
          }
        ]
      }
    ];

    let action = options.prepare("UPDATE options SET bible = ? WHERE guildID = ?");
    let m: Message | void = await message.channel.send({content: `Bible support for this Guild is currently ${option.bible === "no" ? "disabled (note that enabling it could interfere with BibleBot if you also have it on your server)" : "enabled"} if you would like to ${option.bible === "no" ? "enable" : "disable"} it, click the appropiate button.\n\nNOTE: You can only enable/disable this feature if you have the MANAGE_GUILD permission.`, components: buttons }).catch((err) => {
      console.log("Something went wrong: " + err);
    });  

    let filter = (i: Interaction) => !i.user.bot && i.user.id == message.author.id && i.isButton();
    
    if (!m) return;
    let collector: InteractionCollector<MessageComponentInteraction> = m.channel.createMessageComponentCollector({filter,  time: 15000 });
    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.customId == "enable/disable") {          
        action.run(option.bible === "no" ? "yes" : "no", message.guild?.id);                            
        await i.reply({content: `Successfuly ${option.bible === "no" ? "enabled" : "disabled"}`, ephemeral: true});
        return collector.stop();
      } else if (i.customId == "cancel_bible") {
        await i.reply({content: "Cancelled", ephemeral: true})
        return collector.stop();
      }
    })
    
    collector.on("end", () => {
      if (!m) return;
      m.delete();
    })
  }
}

export = Command
