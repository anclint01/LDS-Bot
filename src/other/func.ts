import {  Client, Message, Guild, GuildMember, PermissionResolvable, TextBasedChannels, ButtonInteraction, InteractionCollector, MessageButton, MessageComponent } from 'discord.js';
import { token } from '../../config.json';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'] 
})

export const login = async () => {
  try {
    console.log("Logging into Discord.");
    await client.login(token);
    console.log("Successfully logged into discord.")
  } catch (err) {
    console.log(`Couldn't login to Discord: ${err}`)
  }
}

export const getClient = (): Client => client;

export const getChannelByID = (guild: Guild, id: string) => guild.channels.cache.get(id);

export const getChannelByMention = (guild: Guild, mention: string) => {
  const id = mention.startsWith("<#") && mention.endsWith(">") ? mention.slice(2, -1) : mention

  return getChannelByID(guild, id);
}

export const isTextChannel = (channel: TextBasedChannels) : Boolean => channel.type === "GUILD_TEXT" || channel.type === "GUILD_PUBLIC_THREAD" || channel.type === "GUILD_PRIVATE_THREAD";

export const checkPerms = (author: GuildMember, perms: PermissionResolvable) => {
  if (author.permissions.has(perms)) return true;
  else return false;
}

export const isToday = (dateParameter: Date) => {
  let today: Date = new Date();
  if (dateParameter.getUTCHours() <= today.getUTCHours()) {
    if (dateParameter.getUTCHours() == today.getUTCHours()) {
      return dateParameter.getMinutes() > today.getMinutes();    
    }
    if (dateParameter.getUTCHours() < today.getUTCHours()) {
      return false;
    }
  }
  if (dateParameter.getUTCHours() > today.getUTCHours()) return true;
}

export const sortDates = (arr: any) => {
  let today = new Date();

  let year:  number  = today.getUTCFullYear(),
      month: number  = today.getUTCMonth(),
      day:   number  = today.getUTCDate();
      
  let dates: Array<Date> = [];
  
  for (var i = 0; i < arr.length; i++) {
    let minute: number = parseInt(arr[i].split(":")[1]),
        hour:   number = parseInt(arr[i].split(":")[0]),
        toDate: Date;
    if (isToday(new Date(Date.UTC(year, month, day, hour, minute)))) {
      toDate = new Date(Date.UTC(year, month, day, hour, minute));
    } else toDate = new Date(Date.UTC(year, month, day+1, hour, minute));
    dates.push(toDate);
  }
  
  let temp: Array<number> = dates.map(d => Math.abs(today.getTime() - d.getTime())),
      idx:  number        = temp.indexOf(Math.min(...temp));

  return [arr[idx], idx];
}

export const LDSBot_Embed_Push = (array: Array<object>, title: string, description: string) => {
  array.push({
    color: 0x086587,
    title: title,
    description: description,
    footer: {
      text: "LDS-Bot",
      icon_url: "https://cdn.discordapp.com/avatars/639271772818112564/9018140725fae7be51306737f75fbf68.webp"
    }
  });
}

export const embed_page = async (message: Message, inital_embed: any, edited_embeds: any) => {
  let page: number = 0;
  const buttons: Array<any> = [
    {
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          customId: "PREVIOUS",
          label: "Prev.",
          style: "PRIMARY"
        },
        {
          type: "BUTTON", 
          customId: "NEXT",
          label: "Next.",
          style: "PRIMARY"
        }
      ]
    }
  ];

  let embed = await message.channel.send({ content: "‎‎‎", embeds: [inital_embed], components: buttons }).catch((err: any) => {
    console.log("Something went wrong: " + err)
  });

  if (!embed) return;
  const filter = (interaction: ButtonInteraction) => interaction.isButton() && interaction.user.id != getClient().user!.id;
  const paginator: InteractionCollector<ButtonInteraction> = embed.createMessageComponentCollector({filter, time: 120000});
  
  paginator.on('collect', async i => {
    let ACTION: string = i.customId; // Action the bot is to take ("PREVIOUS", "NEXT")
    i.deferUpdate();
    if (page === 0 && ACTION === "PREVIOUS" || (page === edited_embeds.length - 1 && ACTION === "NEXT")) {
      page = (ACTION == "PREVIOUS" ? edited_embeds.length : -1);
    }

    ACTION === "PREVIOUS" ? page -- : page ++;
    if (!embed) return;
    embed.edit({embeds: [edited_embeds[page]]}).catch((err: any) => {
      console.log("Something went wrong: " + err)
    });
  })
}

export const codeBlock = (language: string, code: string): string => {
  return `\`\`\`${language}\n${code}\`\`\``;
}