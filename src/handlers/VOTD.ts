import { Guild, TextChannel } from 'discord.js';
import { randomVOTD, votd } from '..';
import { getClient, isToday, sortDates } from '../other/func';
import schedule, { Job } from "node-schedule"; // npm i --save-dev @types/node-schedule

const voftheday = require("../../votd.json"),
Database = require('better-sqlite3'),
votdchannels = new Database('database/votdchannels'),
votdtimes = new Database('database/votdtimes');

const client = getClient();
export class VOTD {
  ChannelTable: any;
  TimesTable: any;
  getChannel: any;
  updateChannel: any;
  setChannel: any;
  deleteChannel: any;
  getTime: any;
  updateTime: any;
  setTime: any;
  deleteTime: any;
  VOTDChannels: Map<string, string>;
  VOTDTimes: Map<string, string>;
  currentJob: any;
  scheduledJobs: any;

  constructor () {
    this.ChannelTable = votdchannels.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'channels';").get();
    this.TimesTable = votdtimes.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'times';").get();  

    this.getChannel = votdchannels.prepare("SELECT * FROM channels WHERE guildID = ?"),
    this.updateChannel = votdchannels.prepare("UPDATE channels SET channelID = ? WHERE guildID = ?"),
    this.setChannel = votdchannels.prepare("INSERT INTO channels (guildID, channelID) VALUES (@guildID, @channelID);"),   
    this.deleteChannel = votdchannels.prepare("DELETE FROM channels WHERE guildID = ?;"),
    this.getTime = votdtimes.prepare("SELECT * FROM times WHERE guildID = ?"),
    this.updateTime = votdtimes.prepare("UPDATE times SET time = ? WHERE guildID = ?"),
    this.setTime = votdtimes.prepare("INSERT INTO times (guildID, time) VALUES (@guildID, @time);"),
    this.deleteTime = votdtimes.prepare("DELETE FROM times WHERE guildID = ?;")

    this.VOTDChannels = new Map();
    this.VOTDTimes = new Map();
  }

  async setup () {
    if (!this.ChannelTable['count(*)']) votdchannels.prepare("CREATE TABLE channels (guildID TEXT, channelID TEXT);").run();              
    if (!this.TimesTable['count(*)']) votdtimes.prepare("CREATE TABLE times (guildID TEXT, time TEXT);").run();
    if (this.ChannelTable['count(*)'] && this.TimesTable['count(*)']) {      
      let ChannelRows = votdchannels.prepare("SELECT * FROM channels").all();
      let TimeRows = votdtimes.prepare("SELECT * FROM times").all();
      for (var x = 0; x < ChannelRows.length; x++) {
        if (!this.VOTDChannels.has(ChannelRows[x].guildID)) {
          this.VOTDChannels.set(ChannelRows[x].guildID, ChannelRows[x].channelID)
        }
        if (!this.VOTDTimes.has(TimeRows[x].time)) {
          this.VOTDTimes.set(TimeRows[x].guildID, TimeRows[x].time)
        }
      }
      this.currentJob = await this.startVOTD(this.VOTDTimes, this.VOTDChannels);
    }
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
  
    let hr:      number              = parseInt((closestTime as string).split(":")[0]),
        min:     number              = parseInt((closestTime as string).split(":")[1]),
        server:  Guild | undefined   = client.guilds.cache.get(guildIDS[index]),
        channel: string              = channelsIDs[index];
    
    if (!server) return;
    if (typeof server.channels == "undefined") return;
    
    let VOTDTime: Date = new Date(Date.UTC(year, month, (isToday(new Date(Date.UTC(year, month, day, hr, min)))?day:day+1), hr, min))

    let job: Job = schedule.scheduleJob(VOTDTime, async () => {
      (server!.channels.cache.get(channel) as TextChannel)?.send({content: "‎‎‎", 
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
      this.startVOTD(this.VOTDTimes, this.VOTDChannels);
    });

    return job;
  }

}