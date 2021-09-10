import { CommandInteraction, Message, TextChannel, User } from 'discord.js'
import BaseCommand from '../../../types/command'
import { topical_guide } from '../../../../tg.json'
import { getClient } from '../../../constants/func';
import { Paginator } from '../../../handlers/paginator';

const request = require("request");

class Command extends BaseCommand {
  constructor () {
    super ("tg", "util", "searches Topical Guide provided by churchofjesuschrist.org", {
      name: "tg",
      description: "searches Topical Guide provided by churchofjesuschrist.org",
      options: [{
        type: 3,
        name: "query",
        description: "topical guide term to search for",
        required: true
      }]
    })
  }

  execute_slash (interaction: CommandInteraction) {
    let obj = topical_guide;
    let search = interaction.options.getString("query", true);

    let result: string = "";
    let result_name: string = "";
    let prms = new Promise<void>((resolve, reject) => {
      obj.forEach((v: any, index: any, array: any)=>{
          let name: string = v["name"], link: string = v["link"];

          if (name.replace(/\s/g, "").toLowerCase() === search) {
            result = link;
            result_name = name;
          }

          if (index === array.length-1) resolve();
      });
    });    
    
    
    prms.then(async () => { 
      
      if (result === "") {
        return interaction.reply({content: "I couldn't find a Topical Guide entry with that name", ephemeral: true}).catch((err: any) => {
          console.log("Something went wrong: " + err)
        })
      }

      let data: any;
      request("https://www.churchofjesuschrist.org/" + result, function (error: any, response: any, body: any) {
        if (error) {
          console.log(response)
          console.log("oh no, " + error)
        } else {
          data = body.match(/(?:<div class=body-block>\s*?)(.*?)(?:<\/div>)/gmis)[0];

          let final = data.replace(/<\/?(?:div|small|nav|ul|li|span).*?>/gmis, "");

          if (final.match(/<a.*?>.*?<\/a>/gmis)) {
            final = final.replace(/(?:<a.*? href="(.*?)">)(.*?)(?:<\/a>)/gmis, '[$2](https://www.churchofjesuschrist.org$1)');
          }

          if (final.match(/<\/?p.*?>/gmis)) {
            final = final.replace(/<\/?p.*?>/gmis, '\n');
          }

          if (final.match(/<\/?em.*?>/gmis)) {
            final = final.replace(/<\/?em.*?>/gmis, "*");
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
                    title: result_name,
                    author: {
                      name: "Topical Guide"
                    },
                    color: 0x086587,
                    description: des_s,
                    footer: {
                        text: "LDS-Bot | Topical Guide (churchofjesuschrist.org)",
                        icon_url: getClient().user?.displayAvatarURL()
                    }
                  })
                  des_s = splits[i].trim() + "\n";
                }               
              }
              if (des_s.length > 0) {
                page_array.push({
                  title: result_name,
                  author: {
                    name: "Topical Guide"
                  },
                  color: 0x086587,
                  description: des_s,
                  footer: {
                      text: "LDS | Topical Guide (churchofjesuschrist.org)",
                      icon_url: getClient().user?.displayAvatarURL()
                  }
                })                
              }              
            } else {
              splits = final.match(/.{1,2000}(?<!\d)(?:\.|!|\?)(?!\b(org|churchofjesuschrist)\b)(?!\s?[\d])/gmis);
              for (let i = 0; i < splits.length; i++) {
                page_array.push({
                  title: result_name,
                  author: {
                    name: "Topical Guide"
                  },
                  color: 0x086587,
                  description: splits[i],
                  footer: {
                      text: "LDS-Bot | Topical Guide (churchofjesuschrist.org)",
                      icon_url: getClient().user?.displayAvatarURL()
                  }
                })
              }
            }

            new Paginator(interaction.user as User, page_array[0], page_array, undefined, interaction)._new()
          } else {
            interaction.reply({ embeds:[{
              title: result_name,
              author: {
                name: "Topical Guide"
              },
              color: 0x086587,
              description: final,
              footer: {
                  text: "LDS-Bot",
                  icon_url: getClient().user?.displayAvatarURL()
              }
            }]})
          }
        }
      })
    })
  }

  execute (message: Message, args: string[]) {
    let obj = topical_guide;
    let search = args.join("").toLowerCase();

    let result: string = "";
    let result_name: string = "";
    let prms = new Promise<void>((resolve, reject) => {
      obj.forEach((v: any, index: any, array: any)=>{
          let name: string = v["name"], link: string = v["link"];

          if (name.replace(/\s/g, "").toLowerCase() === search) {
            result = link;
            result_name = name;
          }

          if (index === array.length-1) resolve();
      });
    });    
    
    
    prms.then(async () => { 
      
      if (result === "") {
        return message.channel.send({content: "I couldn't find a Topical Guide entry with that name"}).catch((err: any) => {

        })
      }

      let data: any;
      request("https://www.churchofjesuschrist.org/" + result, function (error: any, response: any, body: any) {
        if (error) {
          console.log(response)
          console.log("oh no, " + error)
        } else {
          data = body.match(/(?:<div class=body-block>\s*?)(.*?)(?:<\/div>)/gmis)[0];

          let final = data.replace(/<\/?(?:div|small|nav|ul|li|span).*?>/gmis, "");

          if (final.match(/<a.*?>.*?<\/a>/gmis)) {
            final = final.replace(/(?:<a.*? href="(.*?)">)(.*?)(?:<\/a>)/gmis, '[$2](https://www.churchofjesuschrist.org$1)');

          }

          if (final.match(/<\/?p.*?>/gmis)) {
            final = final.replace(/<\/?p.*?>/gmis, '\n');

          }

          if (final.match(/<\/?em.*?>/gmis)) {
            final = final.replace(/<\/?em.*?>/gmis, "*");
          }

          if (final.length > 2500) {
            final = final.replace(/^\s+|\s+$/g, '');
            console.log(final)
            
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
                    title: result_name,
                    author: {
                      name: "Topical Guide"
                    },
                    color: 0x086587,
                    description: des_s,
                    footer: {
                        text: "LDS-Bot | Topical Guide (churchofjesuschrist.org)",
                        icon_url: getClient().user?.displayAvatarURL()
                    }
                  })
                  des_s = splits[i].trim() + "\n";
                }               
              }
              if (des_s.length > 0) {
                page_array.push({
                  title: result_name,
                  author: {
                    name: "Topical Guide"
                  },
                  color: 0x086587,
                  description: des_s,
                  footer: {
                      text: "LDS | Topical Guide (churchofjesuschrist.org)",
                      icon_url: getClient().user?.displayAvatarURL()
                  }
                })                
              }              
            } else {
              splits = final.match(/.{1,2000}(?<!\d)(?:\.|!|\?)(?!\b(org|churchofjesuschrist)\b)(?!\s?[\d])/gmis);
              for (let i = 0; i < splits.length; i++) {
                page_array.push({
                  title: result_name,
                  author: {
                    name: "Topical Guide"
                  },
                  color: 0x086587,
                  description: splits[i],
                  footer: {
                      text: "LDS-Bot | Topical Guide (churchofjesuschrist.org)",
                      icon_url: getClient().user?.displayAvatarURL()
                  }
                })
              }
            }

            new Paginator(message.author as User, page_array[0], page_array, message as Message)._new()
          } else {
            message.channel.send({ embeds:[{
              title: result_name,
              author: {
                name: "Topical Guide"
              },
              color: 0x086587,
              description: final,
              footer: {
                  text: "LDS-Bot",
                  icon_url: getClient().user?.displayAvatarURL()
              }
            }]})
          }
        }
      })
    })
  }
}

export = Command