import { Guild, Snowflake, TextChannel } from 'discord.js';
import { randomVOTD } from '..';
import { getClient, isToday, sortDates } from '../constants/func';
import schedule, { Job } from "node-schedule";
import { KeyvFile } from 'keyv-file';
import { Store } from '../constants/keyv';
const voftheday = require("../../votd.json");

const client = getClient();
export class VOTD {
  ChannelTable: any;
  TimesTable: any;
  VOTDChannels: Map<string, string>;
  VOTDTimes: Map<string, string>;
  currentJob: any;
  scheduledJobs: any;

  constructor () {
    this.ChannelTable = new Store({ 
      store: new KeyvFile({
        filename: "../src/database/votdchannels.json", 
        writeDelay: 100, 
        encode: JSON.stringify,
        decode: JSON.parse 
      })
    })

    this.TimesTable = new Store({ 
      store: new KeyvFile({
        filename: "../src/database/votdtimes.json",
        writeDelay: 100, 
        encode: JSON.stringify,
        decode: JSON.parse 
      })
    })  

    this.VOTDChannels = new Map();
    this.VOTDTimes = new Map();
  }

 async setup () {
    if (await this.ChannelTable.values().length === 0 || await this.TimesTable.values().length === 0) 
      return "There are no VOTD processes currently running";

    let ChannelRows = await this.ChannelTable.values();
    let TimeRows = await this.TimesTable.values();

    for (var x = 0; x < ChannelRows.length; x++) {
      if (!this.VOTDChannels.has(ChannelRows[x].key)) {
        this.VOTDChannels.set(ChannelRows[x].key, ChannelRows[x].value);
      }
      if (!this.VOTDTimes.has(TimeRows[x].key)) {
        this.VOTDTimes.set(TimeRows[x].key, TimeRows[x].value)
      }
    }
    this.currentJob = await this.startVOTD(this.VOTDTimes, this.VOTDChannels);
  }

  async deleteVOTD (guildID: Snowflake) {
    await this.ChannelTable.delete(guildID);
    await this.TimesTable.delete(guildID);
    this.VOTDChannels.delete(guildID);
    this.VOTDTimes.delete(guildID);
  }

  startVOTD = async (times: Map<string, string>, channels: Map<string, string>) => {
    let today: Date = new Date();
  
    let year:  number = today.getUTCFullYear(),
        month: number = today.getUTCMonth(),
        day:   number = today.getUTCDate();
  
    let guildIDS:    Array<string> = [...times.keys()],
        channelsIDs: Array<string> = [...channels.values()],   
        time:        Array<string> = [...times.values()];
  
    let closestTime: string = sortDates(time)[0],    
        index:       number = sortDates(time)[1];

    if (!closestTime) return; 

    let hr:      string              = closestTime.split(":")[0],
        min:     string              = closestTime.split(":")[1],
        server:  Guild | undefined   = client.guilds.cache.get(guildIDS[index]),
        channel: string              = channelsIDs[index];
    
    if (!server) {
      await this.deleteVOTD(guildIDS[index]);

      this.currentJob = await this.startVOTD(this.VOTDTimes, this.VOTDChannels);
    }
    
    let VOTDTime: Date = new Date(Date.UTC(year, month, (isToday(new Date(Date.UTC(year, month, day, parseInt(hr), parseInt(min))))?day:day+1), parseInt(hr), parseInt(min)))

    let job: Job = schedule.scheduleJob(VOTDTime, async () => {
      ((<Guild>server).channels.cache.get(channel) as TextChannel).send({content: "‎‎‎", 
        embeds: [{
          color: 0x00AA00,
          title: voftheday.verses[randomVOTD-1].reference,
          description: voftheday.verses[randomVOTD-1].text,
          footer: {
            text: "Verse of the Day",
            icon_url: client.user!.displayAvatarURL()
          }
        }]
      }).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
      this.currentJob = await this.startVOTD(this.VOTDTimes, this.VOTDChannels);
    });

    return job;
  }

}
