import {  Client, GatewayIntentBits, Message, Guild, GuildMember, PermissionResolvable, TextBasedChannel, ChannelType, ButtonBuilder, ActionRowBuilder, APIEmbed, JSONEncodable }  from 'discord.js';
import { topical_guide } from '../../tg.json';
import { bible_dictionary } from '../../bd.json';

const request = require("request");
const stringSimilarity = require("string-similarity");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

export const login = async () => {
  try {
    console.log("Logging into Discord.");
    await client.login("");
    console.log("Successfully logged into discord.")
  } catch (err) {
    console.log(`Couldn't login to Discord: ${err}`)
  }
}

export const find_entry = async(query: string, type: string): Promise<{ result: { name: string, link: string, }, result_array: Array<{name: string, link: string, similarity: number}> }> => {
  let obj = type === "Topical Guide" ? topical_guide : bible_dictionary;

  let result_array: Array<{name: string, link: string, similarity: number}> = [];
  let name: string = "";
  let link: string = "";

  return new Promise<void>((resolve, reject) => {
    obj.forEach((v: any, index: any, array: any)=>{
      let n: string = v["name"], l: string = v["link"];

      let similarity: number;
      if (query.trim().length > 0) {
        similarity = stringSimilarity.compareTwoStrings(query.replace(/\s/g, "").toLowerCase(), n.replace(/\s/g, "").toLowerCase());
      } else similarity = 0;

      if (query.replace(/\s/g, "").toLowerCase() === n.replace(/\s/g, "").toLowerCase()) {
        link = l;
        name = n;
      }

      if (similarity >= 0.4 && result_array.length < 25) {
        result_array.push({name: n, link: l, similarity});
      }

      if (index === array.length-1) resolve();
    });
  }).then(()=> {
    return { result: {name, link}, result_array };
  });  
}

export const get_result = async (query: string, link: string, type: string): Promise<APIEmbed | JSONEncodable<APIEmbed>[] | string | undefined> => {  
  if (query === "") {
    return `I couldn't find a ${type} entry with that name`;
  }

  let data: any;
  let e: APIEmbed | JSONEncodable<APIEmbed>[] | string | undefined ;
  return new Promise<void>((resolve, reject) => {
    request(link, function (error: any, response: any, body: any) {
      if (error) {
        console.log(response)
        console.log("oh no, " + error)
        e = undefined;
      } else {
        console.log(body)
        data = body.match(/(?:<div class="body-block">\s*?)(.*?)(?:<\/div>)/gmis)[0];

        let final = data.replace(/<\/?(?:div|small|nav|ul|li|span|sup).*?>/gmis, "");

        if (final.match(/<a.*?>.*?<\/a>/gmis)) {
          final = final.replace(/(?:<a.*? href="(.*?)">)(.*?)(?:<\/a>)/gmis, '[$2](https://www.churchofjesuschrist.org$1)');
        }

        if (final.match(/<\/?em.*?>/gmis)) {
          final = final.replace(/<\/?em.*?>/gmis, "*");
        }

        final = final.replace(/(" ?data-scroll-id="note\d.*?)/gmis, "");
        
        final = final.replace(/&amp;/gmis, "&");

        final = [...final.match(/(?:<p.*?>\s*?)(.*?)(?:<\/p>)/gmsi)].join("\n\n");

        if (final.match(/<\/?p.*?>/gmis)) {
          final = final.replace(/<\/?p.*?>/gmis, '');
        }

        if (final.length > 2500) {
          final = final.replace(/^\s+|\s+$/g, '');
          
          let splits: any[];
          let page_array: Array<any> = [];
          if (final.match(/\r?\n/)) {
            splits = final.split(/\r?\n/);
            let des_s: string = "";
            for (let i = 0; i < splits.length; i++) {
              let new_s: string = "";
              new_s = des_s + splits[i].trim() + "\n";
              
              if (new_s.length <= 2500) des_s = new_s; 
              else {
                page_array.push({
                  title: query,
                  author: {
                    name: type
                  },
                  color: 0x086587,
                  description: des_s,
                  footer: {
                      text: `LDS-Bot | ${type} (churchofjesuschrist.org)`,
                      icon_url: getClient().user?.displayAvatarURL()
                  }
                })
                des_s = splits[i].trim() + "\n";
              }               
            }
            if (des_s.length > 0) {
              page_array.push({
                title: query,
                author: {
                  name: type
                },
                color: 0x086587,
                description: des_s,
                footer: {
                    text: `LDS-Bot | ${type} (churchofjesuschrist.org)`,
                    icon_url: getClient().user?.displayAvatarURL()
                }
              })                
            }              
          } else {
            splits = final.match(/.{1,2000}(?<!\d)(?:\.|!|\?)(?!\b(org|churchofjesuschrist)\b)(?!\s?[\d])/gmis);
            for (let i = 0; i < splits.length; i++) {
              page_array.push({
                title: query,
                author: {
                  name: type
                },
                color: 0x086587,
                description: splits[i],
                footer: {
                    text: `LDS-Bot | ${type} (churchofjesuschrist.org)`,
                    icon_url: getClient().user?.displayAvatarURL()
                }
              })
            }
          }

          e = page_array as JSONEncodable<APIEmbed>[];
          resolve();
        } else {
          e = {
            title: query,
            author: {
              name: type
            },
            color: 0x086587,
            description: final,
            footer: {
                text: `LDS-Bot | ${type} (churchofjesuschrist.org)`,
                icon_url: getClient().user?.displayAvatarURL()
            }
          } as APIEmbed;
          resolve();
        }
      }
    })
  }).then(()=>{
    return e;
  })
}

export const delete_button = async (member: GuildMember): Promise<ActionRowBuilder<ButtonBuilder>> => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder({ customId: `delete_${member.user.id}`, label: "✖️", style: 4}))
}

export const getClient = (): Client => client;

export const getChannelByID = (guild: Guild, id: string) => guild.channels.cache.get(id);

export const getChannelByMention = (guild: Guild, mention: string) => {
  const id = mention.startsWith("<#") && mention.endsWith(">") ? mention.slice(2, -1) : mention

  return getChannelByID(guild, id);
}

export const isTextChannel = (channel: TextBasedChannel) : Boolean => channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildPublicThread || channel.type === ChannelType.GuildPrivateThread;

export const checkPerms = (author: GuildMember, perms: PermissionResolvable) => {
  if (author.permissions.has(perms)) return true;
  else return false;
}

export function getRanges (array: number[]) {
  for (var ranges = [], rend, i = 0; i < array.length;) {
    ranges.push((rend = array[i]) + ((function (rstart) {
      while (++rend === array[++i]);
      return --rend === rstart;
    })(rend) ? '' : '-' + rend)); 
  }
  return ranges;
}

export function extendRanges (str: string) {
  let arr: string[] = str.split(",");
  let place_holder: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    let val: string = arr[i].trim();

    if (val.includes("-") || val.includes("–")) {
      let first: string = val.split(/[-–]/g)[0];
      let last: string = val.split(/[-–]/g)[1];

      if (last === "") {
        place_holder.push(parseInt(first))
        place_holder.push(999);
        return place_holder.sort((a: number, b: number) => a - b);;
      }

      if (parseInt(first) === parseInt(last)) place_holder.push(parseInt(first))
      if (parseInt(first) > parseInt(last)) last = [first, first = last][0];
      
      for (let y = parseInt(first); y <= parseInt(last); y++) {
        place_holder.push(y);
      } 
    } else {
      place_holder.push(parseInt(val));
    }
  }

  place_holder = place_holder.filter(function(item, pos, self) {return self.indexOf(item) == pos});

  return place_holder.sort((a: number, b: number) => a - b);
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
