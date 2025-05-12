import { ButtonInteraction, ChatInputCommandInteraction, ComponentType, GuildMember, Interaction, InteractionCollector, Message, ActionRowBuilder, ButtonBuilder } from 'discord.js'
import { bible } from '../../..';
import BaseCommand from '../../../types/command'
import { checkPerms } from '../../../constants/func';

class Command extends BaseCommand {
  constructor () {
    super ("bible", "util", "enable/disable bible support", {
      name: "bible",
      description: "Enable/Disable bible support for the server"
    })
  }
  async execute_slash (interaction: ChatInputCommandInteraction ) {
    if (!checkPerms(interaction.member as GuildMember, "ManageGuild")) {
      await interaction.reply({content: "You do not have the ManageGuild permission and cannot edit this setting", ephemeral: true}).catch((err: any) => {
        console.log("Something went wrong: " + err)
      })

      return;
    }

    let bible_option = await bible.get(interaction.guild!.id);
    if (!bible_option) {
      await bible.set(interaction.guild!.id, "no");

      bible_option = await bible.get(interaction.guild!.id);
    }
    
    const buttons: Array<ActionRowBuilder<ButtonBuilder>> = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder({ customId: `enable/disable`, label: `${bible_option === "no" ? "Enable" : "Disable"}`, style: 1}),
        new ButtonBuilder({ customId: `cancel_bible`, label: "Cancel", style: 4})
        )
    ];

    await interaction.reply({content: `Bible support for this Guild is currently ${bible_option === "no" ? "disabled (note that enabling it could interfere with BibleBot if you also have it on your server)" : "enabled"} if you would like to ${bible_option === "no" ? "enable" : "disable"} it, click the appropiate button.\n\nNOTE: You can only enable/disable this feature if you have the MANAGE_GUILD permission.`, components: buttons, ephemeral: true }).catch((err) => {
      console.log("Something went wrong: " + err);
    });

    let filter = (i: Interaction) => !i.user.bot && i.user.id === interaction.user.id && i.isButton();
    let collector: InteractionCollector<ButtonInteraction> = interaction.channel?.createMessageComponentCollector({filter, componentType: ComponentType.Button,  time: 15000 })!;
    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.customId == "enable/disable") {          
        bible.set(interaction.guild!.id, bible_option === "no" ? "yes" : "no");                            
        await i.reply({content: `Successfuly ${bible_option === "no" ? "enabled" : "disabled"}`, ephemeral: true}).catch((err: any) => {
          console.log("Something went wrong: 1" + err);
        });
        return collector.stop();
      } else if (i.customId == "cancel_bible") {
        await i.reply({content: "Cancelled", ephemeral: true}).catch((err: any) => {
          console.log("Something went wrong: 1" + err);
        });
        return collector.stop();
      }
    })

    collector.on("end", async (i, reason) => {
      if (reason == "messageDeleted") return;
      await interaction.editReply({content: "Done.", components: []}).catch((err: any) => {
        console.log("Something went wrong:" + err);
      });;
    })    
  }

  async execute (message: Message, args: string[]) {
    if (!checkPerms(message.member!, "ManageGuild")) {
      return message.channel.send({content: "You do not have the ManageGuild permission and cannot edit this setting"}).catch((err: any) => {
        console.log("Something went wrong: 1" + err);
      });
    }

    let bible_option = await bible.get(message.guild!.id);
    if (!bible_option) {
      await bible.set(message.guild!.id, "no");

      bible_option = await bible.get(message.guild!.id);
    } 
    
    const buttons: Array<ActionRowBuilder<ButtonBuilder>> = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder({ customId: `enable/disable`, label: `${bible_option === "no" ? "Enable" : "Disable"}`, style: 1}),
        new ButtonBuilder({ customId: `cancel_bible`, label: "Cancel", style: 4})
        )
    ];

    let m: Message | void = await message.channel.send({content: `Bible support for this Guild is currently ${bible_option === "no" ? "disabled (note that enabling it could interfere with BibleBot if you also have it on your server)" : "enabled"} if you would like to ${bible_option === "no" ? "enable" : "disable"} it, click the appropiate button.\n\nNOTE: You can only enable/disable this feature if you have the ManageGuild permission.`, components: buttons }).catch((err) => {
      console.log("Something went wrong: 2" + err);
    });  

    let filter = (i: Interaction) => !i.user.bot && i.user.id == message.author.id && i.isButton();
    
    if (!m) return;
    let collector: InteractionCollector<ButtonInteraction> = m.channel.createMessageComponentCollector({filter, componentType: ComponentType.Button,  time: 15000 });
    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.customId == "enable/disable") {          
        bible.set(message.guild!.id, bible_option === "no" ? "yes" : "no");                            
        await i.reply({content: `Successfuly ${bible_option === "no" ? "enabled" : "disabled"}`, ephemeral: true});
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
