import { Awaited, ButtonInteraction, Client, Interaction, InteractionCollector, Message, MessageComponent, MessageComponentCollectorOptions, MessageComponentInteraction } from 'discord.js'
import BaseCommand from '../../../command'
import { randomVOTD, votd } from '../../..';
import { checkPerms, getClient } from '../../../other/func';
import voftheday from "../../../../votd.json";
import { Job } from 'node-schedule';
const client: Client = getClient();

class Command extends BaseCommand {
  constructor () {  
    super ("votd", "util", "Send VOTD.\n`votd setchannel <channel>` sets channel VOTD will be sent to (perm dependent)\n`votd settime <time>` sets time VOTD is sent (in UTC, 00:00-23:59, perm dependent)\n‎‎‎‎‎‎‎`votd disable` this will stop LDS-Bot from sending a VOTD (perm dependent)\n`votd channel` tells you what channel the VOTD will be sent to (if you have one set)\n`votd time` tells you what time the VOTD will be sent to (if you a time set)")
  }
  async execute (message: Message, args: string[]) {
    let ChosenChannel: {guildID: string, channelID: string}, 
        ChosenTime:    {guildID: string, time: string}; 
    switch (args[0]) {
      case "settime":
        if (!args[1]) {
          return message.channel.send({content: "Please provide a UTC time. (E.G 16:30)"}).catch((err: any) => {
            console.log("Something went wrong: " + err);
          });
        }
        if (!checkPerms(message.member!, "MANAGE_GUILD")) {
          return message.channel.send({ content: "Looks like you don't have permission to do that."}).catch((err: any) => {
            console.log("Something went wrong: " + err);
          });
        }
        let regex: RegExp = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!args[1].match(regex)) {
          return message.channel.send({ content: "Please enter a valid time."}).catch((err: any) => {
            console.log("Something went wrong: " + err);
          });
        }

        ChosenTime = await votd.getTime.get(message.guild!.id);
        if (!ChosenTime) {
          ChosenTime = {
            guildID: message.guild!.id,
            time: args[1]
          }
          
          try {
            votd.VOTDTimes.set(message.guild!.id, args[1]);
            await votd.setTime.run(ChosenTime)
          } catch (err) {
            console.log(err)
          }
        } else {
          if (votd.currentJob) {
            let my_job = await votd.currentJob;
            my_job.cancel(false)                    
          }

          try {
            votd.VOTDTimes.set(message.guild!.id, args[1]);               
            await votd.updateTime.run(args[1], message.guild!.id)
          } catch (err) {
            console.log(err)
          }        
        }
        ChosenTime = await votd.getTime.get(message.guild!.id);
        if (!ChosenTime) {
          return message.channel.send({ content: "Oh no! There seems to have been an issue and I wasn't able to set the time" }).catch((err: any) => {
            console.log("Something went wrong: " + err);
          });
        } else {
          message.channel.send({ content: "Successfully set VOTD time to: " + ChosenTime.time }).catch((err: any) => {
            console.log("Something went wrong: " + err);
          });
        }
        votd.currentJob = votd.startVOTD(votd.VOTDTimes, votd.VOTDChannels);
      break;
      case "channel":
        ChosenChannel = await votd.getChannel.get(message.guild!.id);
        if (!ChosenChannel) {
          return message.channel.send("There is currently no VOTD channel set for this server.").catch((err: any) => {
            console.log("Something went wrong: " + err);
          });
        }
        return message.channel.send("The VOTD channel set for this server is: <#" + ChosenChannel.channelID + ">").catch((err) => {
          console.log("Something went wrong: " + err);
        });
      break;
      case "time":
        ChosenTime = await votd.getTime.get(message.guild!.id);
        if (!ChosenTime) {
          return message.channel.send({ content: "There is currently no daily VOTD time set for this server."}).catch((err: any) => {
            console.log("Something went wrong: " + err)
          })
        }
        return message.channel.send("The daily time set for a VOTD is set to: " + ChosenTime.time).catch((err: any) => {
          console.log("Something went wrong: " + err);
        });
      break;
      case "setchannel":
          if (!checkPerms(message.member!, "MANAGE_GUILD")) {
            return message.channel.send({ content: "Looks like you don't have permission to do that."}).catch((err: any) => {
              console.log("Something went wrong: " + err)
            })
          }
          ChosenChannel = await votd.getChannel.get(message.guild!.id);
  
          let VOTDChannel: string;
          if (message.mentions.channels.first()) VOTDChannel = message.mentions.channels.first()!.id;
          else VOTDChannel = args[1];

          if (!VOTDChannel) {
            return message.channel.send({content: "Something went wrong, make sure you are inputting a valid channel."}).catch((err: any) => {
              console.log("Something went wrong: " + err)
            })
          }
          if (!message.guild!.channels.cache.has(VOTDChannel)) {
            return message.channel.send({ content: "Please enter a valid channel mention or ID."}).catch((err: any) => {
              console.log("Something went wrong: " + err);
            });
          }

          if (!ChosenChannel) {
            ChosenChannel = {
              guildID: message.guild!.id,
              channelID: VOTDChannel
            }

            try {
              votd.setChannel.run(ChosenChannel)
              votd.VOTDChannels.set(message.guild!.id, args[1]);            
            } catch (error) {
              console.log(error);
            }
          } else {
            if (votd.currentJob) {
              let my_job: Job = await votd.currentJob;
              my_job.cancel(false);                    
            }

            try {
              votd.VOTDChannels.set(message.guild!.id, args[1]);                                        
              votd.updateChannel.run(VOTDChannel, message.guild!.id) 
            } catch (error) {
              console.log(error);
            }
          }
          ChosenChannel = await votd.getChannel.get(message.guild!.id);
          if (!ChosenChannel) {
            return message.channel.send({content:"Oh no! There seems to have been an issue and I wasn't able to set the channel"}).catch((err: any) => {
              console.log("Something went wrong: " + err);
            });
          } else {
            message.channel.send({ content: "Successfully set VOTD channel to: " + args[1] }).catch((err: any) => {
              console.log("Something went wrong: " + err);
            });
          }
          votd.currentJob = votd.startVOTD(votd.VOTDTimes, votd.VOTDChannels);
          break;
      case "disable":
        if (!checkPerms(message.member!, "MANAGE_GUILD")) {
          return message.channel.send({ content: "Looks like you don't have permission to do that." }).catch((err: any) => {
            console.log("Something went wrong: " + err);
          });
        }
        const buttons: Array<any> = [
          {
            type: "ACTION_ROW", // MessageActionRow
            components: [
              {
                type: "BUTTON", // MessageButton
                customId: "yes",
                label: "Yes",
                style: "PRIMARY"
              },
              {
                type: "BUTTON", // MessageButton
                customId: "no",
                label: "No",
                style: "DANGER"
              }
            ]
          }
        ];
        let m: Message | void = await message.channel.send({ content: "Are you sure you want to disable VOTD? You will have to re-enter your chosen Channel & Time to continue using this service.", components: buttons }).catch((err) => {
          console.log("Something went wrong: " + err);
        });                  
        let filter = (i: Interaction): boolean => !i.user.bot && i.user.id == message.author.id && i.isButton();
        
        if (!m) return;
        let collector: InteractionCollector<MessageComponentInteraction> = m.channel.createMessageComponentCollector({filter,  time: 15000 });
        collector.on('collect', (i: ButtonInteraction): Awaited<void> => {
          if (i.customId == "yes") {         
            i.deferUpdate();                               
            i.reply({content: "Successfuly disabled.", ephemeral: true});

            votd.deleteChannel.run(message.guild!.id);
            votd.deleteTime.run(message.guild!.id);
            votd.VOTDChannels.delete(message.guild!.id);
            votd.VOTDTimes.delete(message.guild!.id);

            return collector.stop();
          } else if (i.customId == "no") {
            i.deferUpdate();
            i.reply({content: "Cancelled", ephemeral: true})
            return collector.stop();
          }
        })
        collector.on("end", (): Awaited<void> => {
          if (!m) return;
          m.delete();
        })
      break;
      default:
        message.channel.send({content: "‎‎‎", embeds: [{
            color: 0x00AA00,
            title: voftheday.verses[randomVOTD-1].reference,
            description: voftheday.verses[randomVOTD-1].text,
            footer: {
              text: "Verse of the Day",
              icon_url: client.user?.displayAvatarURL()
            }
          }]
        }).catch((err) => {
          console.log("Something went wrong: " + err);
        });
      break;
    }
  }
}

export = Command