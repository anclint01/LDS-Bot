import {  Client, Message, Guild, GuildMember, PermissionResolvable, TextBasedChannels, ButtonInteraction, InteractionCollector, MessageButton, MessageComponent, TextChannel, CommandInteraction, User, Interaction, MessageActionRow } from 'discord.js';
import { token } from '../../config.json';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'] 
})

export const login = async () => {
  try {
    console.log("Logging into Discord.");
    // this is an invalid token
    await client.login("ODc4MDI3NjY3Njc1NDE4Njk2.YR7M_A.XRXa5ILUYGx6GITiE9a8AxP1DeE");
    console.log("Successfully logged into discord.")
  } catch (err) {
    console.log(`Couldn't login to Discord: ${err}`)
  }
}

export const delete_button = async (member: GuildMember): Promise<MessageActionRow> => { 
  return new MessageActionRow().addComponents(
              new MessageButton()
               .setCustomId(`delete_${member.user.id}`)
               .setLabel("✖️")
               .setStyle("DANGER"));
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

export const LDSBot_Embed_Push = (array: Array<object>, title: string, description: string, footer?: string) => {
  array.push({
    color: 0x086587,
    title: title,
    description: description,
    footer: {
      text: "LDS-Bot" + (footer ? " | " + footer : ""),
      icon_url: client.user!.displayAvatarURL()
    }
  });
}

export const LDSBot_Embed_Send = async (message: Message, title: string, description: string, footer: string) => {
  let button = await delete_button(message.member!);
  await message.channel.send({ embeds: [{
    color: 0x086587,
    title: title,
    description: description,
    footer: {
      text: footer,
      icon_url: client.user!.displayAvatarURL()
    }
  }], components: [button]}).catch((error: any)=> {
    console.log("Something went wrong: " + error);
  });
}

export const codeBlock = (language: string, code: string): string => {
  return `\`\`\`${language}\n${code}\`\`\``;
}
