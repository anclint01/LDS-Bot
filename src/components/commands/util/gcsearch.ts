
import { CommandInteraction, GuildManager, GuildMember, Interaction, InteractionCollector, Message, MessageActionRow, MessageComponentInteraction, MessageSelectMenu, SelectMenuInteraction } from 'discord.js'
import BaseCommand from '../../../types/command'
import {gc_talks} from '../../../../gc.json'
import { getClient } from '../../../constants/func';
import { StringDecoder } from 'string_decoder';
const stringSimilarity = require("string-similarity");

const client = getClient();
class Command extends BaseCommand {
  constructor () {
    super ("gcsearch", "util", "Searches General Conference Talks", {
      name: "gcsearch",
      description: "Search for General Conference Talks",
      options: [
        {
          type: 3,
          name: "title",
          description: "title of talk to search for",
          required: true
        },       
        {
          type: 3,
          name: "speaker",
          description: "filter search results to certain speaker",
          required: false
        },
        {
          type: 4,
          name: "year",
          description: "filter search results to certain year between 1971-2021",
          required: false
        },       
        {
          type: 3,
          name: "month",
          description: "filter search results to certain month",
          required: false,
          choices: [
            {
              name: "April",
              value: "April"
            },
            {
              name: "October",
              value: "October"
            }            
          ]
        },
        {
          type: 4,
          name: "results",
          description: "numer of results to return, between 1-25",
          required: false
        }
      ] 
    })
  }

  async execute_slash (interaction: CommandInteraction) {  
    let query: string = interaction.options.getString("title", true) as string;
    let speaker_filter: string = interaction.options.getString("speaker", false) as string ? interaction.options.getString("speaker", false) as string : "",
        year_filter: number = interaction.options.getInteger("year", false) ? interaction.options.getInteger("year", false) as number : 0 as number,
        month_filter: string = interaction.options.getString("month", false) as string ? interaction.options.getString("month", false) as string : "", 
        num_of_results: number = interaction.options.getInteger("results", false) as number ? interaction.options.getInteger("results", false) as number : 10;
    
    console.log(year_filter)

    console.log(year_filter >= 1971)

    console.log(year_filter <= 2021)
    if (year_filter != 0 && year_filter <= 1971 && year_filter >= 2021) {
      return await interaction.reply({content: `${year_filter} is not a valid year, please try again and provide a year between 1971-2021`, ephemeral: true})
    }

    if (num_of_results > 25 || num_of_results < 1) {
      return await interaction.reply({content: `I can only return between 1-25 results per search`, ephemeral: true})
    }

    let obj: any[] = gc_talks;

    let results: any[] = [];
    let prms = new Promise<void>((resolve, reject) => {
      obj.forEach((v, index, array)=>{
          let title: string = v["title"], speaker: string = v["speaker"], 
              year: string  = v["year"],  month : string  = v["month"];
          
          let similarity: number;
          if (query.trim().length > 0) {
            similarity = stringSimilarity.compareTwoStrings(query.toLowerCase(), title.toLowerCase());
          } else similarity = 0;
    
          if ((year_filter != 0 ? (year_filter).toString().toLowerCase() : year.toLowerCase()) === year.toLowerCase() && (month_filter != "" ? month_filter.toLowerCase() : month.toLowerCase()) === month.toLowerCase() && (speaker_filter != "" ? speaker_filter.toLowerCase() : speaker.toLowerCase()) === speaker.toLowerCase()) {
            results.push({title, speaker, year, month, similarity});
          } 
    
          if (index === array.length-1) resolve();
      });
    });    
    
    
    prms.then(async () => {
    
      if (results.length === 0) return interaction.reply({content: "0 results found.", ephemeral: true}).catch((err: any) => {console.log("Something went wrong: " + err);});
    
      let sorted_results: any[] = results.sort((a, b) => parseFloat(b.similarity) - parseFloat(a.similarity));
      
      let top_ten: any[] = sorted_results.slice(0, num_of_results);
      
      let options: any[] = [];
      for (let i = 0; i < top_ten.length; i++) {
        options.push({
          label: top_ten[i].title,
          description: `By ${top_ten[i].speaker}, ${top_ten[i].month}, ${top_ten[i].year}`,
          value: i.toString()
        })
      }
    
      let row: MessageActionRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
              .setCustomId("search")
              .setPlaceholder(top_ten[0].title + ", by " + top_ten[0].speaker + ", " + top_ten[0].month + ", " + top_ten[0].year)
              .addOptions(options));
      
      await interaction.reply({content: "Search results", components: [row], ephemeral: true});
      
      const filter = (i: MessageComponentInteraction) => i.customId === 'search' && i.isSelectMenu();
      const collector: InteractionCollector<MessageComponentInteraction> = interaction.channel?.createMessageComponentCollector({ filter, time: 120000 , max: 1 })!;
      collector.on("collect", async (i: SelectMenuInteraction) => {
        let choice: number = parseInt(i.values[0]);
    
        let list_occurence = top_ten[choice];
        let c_year: string = list_occurence.year;
        let c_month: string = list_occurence.month;
        let title: string = list_occurence.title;
        let speaker: string = list_occurence.speaker;
        
        if (parseInt(c_year) >= 2019) {
          await interaction.editReply({content: "Search sent", components: []});
          
          await i.reply({content: "Conference talks from 2019 and beyond have differently generated URL's, as a result I cannot generate them with the information I have. I will manually add them at some point."})
          
          return collector.stop();
        }

        let p_title: string = title.replace(/[^a-zA-Z0-9\s]*/gm, "");
        let end_title: string = p_title.replace(/\s/gm, "-");
    
        let construct_link = `https://www.churchofjesuschrist.org/study/general-conference/${c_year}/${c_month === "April" ? "04" : "10"}/${end_title}?lang=eng`
        
        let e = {
          title: title + " by " + speaker + ", " + c_month + ", " + c_year,
          author: {
            name: (interaction.member as GuildMember)?.displayName + ' searched for'
          }, 
          description: construct_link,
          color: 0x086587,
          footer: {
            icon_url: client.user!.displayAvatarURL(),
            text: "LDS-Bot | General Conference Search"
          }
        }

        await interaction.editReply({content: "Search sent", components: []});
        
        await i.reply({embeds: [e]});
        collector.stop();
      })
      collector.on("end", async (reason: string) => {
        if (reason === "time") {
          await interaction.editReply({content: "Search timed out."})
        }
      })
    })
  }

  execute (message: Message, args: string[]) {
    if (args.length === 0) return message.channel.send({content: "Please provide search parameters."});
    
    let query: string = args.join(" ");
    let speaker_filter: string = "", year_filter: string = "", month_filter: string = "", num_of_results: string = "";
    if (message.content.indexOf("~") != -1) {
      let split_params: string[] = query.split("~");
      if (split_params.length > 1) {
        for (let i = 1; i < split_params.length; i++) {
          let s: string[] = split_params[i].replace(/\s/, "").split("=");
    
          if (s.length > 0) {
            if (s[0] === "speaker") speaker_filter = s[1].trim();
            if (s[0] === "month") month_filter = s[1].trim();
            if (s[0] === "year") year_filter = s[1].trim();
            if (s[0] === "results") num_of_results = s[1].trim();
          }
        }
      }
    }
    query = query.replace(/~\b(year|month|speaker).*?\b.*/gm, "");
    
    //if (message.author.id != "453840514022899712") return;
    let obj: any[] = gc_talks;
    
    //let mes = await message.channel.send({embeds:[{
    //  description: `Retrieving results for ${toSearch}...`
    //}]})
    let results: any[] = [];
    let prms = new Promise<void>((resolve, reject) => {
      obj.forEach((v, index, array)=>{
          let title: string = v["title"], speaker: string = v["speaker"], 
              year: string  = v["year"],  month : string  = v["month"];
          
          let similarity: number;
          if (query.trim().length > 0) {
            similarity = stringSimilarity.compareTwoStrings(query.toLowerCase(), title.toLowerCase());
          } else similarity = 0;
    
          if ((year_filter != "" ? year_filter.toLowerCase() : year.toLowerCase()) === year.toLowerCase() && (month_filter != "" ? month_filter.toLowerCase() : month.toLowerCase()) === month.toLowerCase() && (speaker_filter != "" ? speaker_filter.toLowerCase() : speaker.toLowerCase()) === speaker.toLowerCase()) {
            results.push({title, speaker, year, month, similarity});
          } 
    
          if (index === array.length-1) resolve();
      });
    });    
    
    
    prms.then(async () => {
    
      if (results.length === 0) return message.channel.send({content: "0 results found."}).catch((err: any) => {console.log("Something went wrong: " + err);});
    
      let sorted_results: any[] = results.sort((a, b) => parseFloat(b.similarity) - parseFloat(a.similarity));
      
      let top_ten: any[] = sorted_results.slice(0, num_of_results != "" && !isNaN(parseInt(num_of_results)) && parseInt(num_of_results) <= 25 ? parseInt(num_of_results) : 10);
      
      if (num_of_results != "" && isNaN(parseInt(num_of_results))) message.channel.send({ content: "Results flag is not a number, defaulting to 10 results" }).catch((err: any) => {console.log("Something went wrong: " + err);});
      else if (num_of_results != "" && parseInt(num_of_results) > 25) return message.channel.send({ content: "Results flag cannot be more than 25, defaulting to 10 results" }).catch((err: any) => {console.log("Something went wrong: " + err);});
    
      let options: any[] = [];
      for (let i = 0; i < top_ten.length; i++) {
        options.push({
          label: top_ten[i].title,
          description: `By ${top_ten[i].speaker}, ${top_ten[i].month}, ${top_ten[i].year}`,
          value: i.toString()
        })
      }
    
      let row: MessageActionRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
              .setCustomId("search")
              .setPlaceholder(top_ten[0].title + ", by " + top_ten[0].speaker + ", " + top_ten[0].month + ", " + top_ten[0].year)
              .addOptions(options));
      
      let m = await message.channel.send({content: "Search results", components: [row]});
    
      const filter = (i: MessageComponentInteraction) => i.customId === 'search' && i.isSelectMenu() && i.user.id == message.author.id && i.message.id == m.id;
      const collector: InteractionCollector<MessageComponentInteraction> = m.channel.createMessageComponentCollector({ filter, time: 120000 , max: 1 });
      collector.on("collect", async (i: SelectMenuInteraction) => {
        let choice: number = parseInt(i.values[0]);
    
        let list_occurence = top_ten[choice];
        let c_year: string = list_occurence.year;
        let c_month: string = list_occurence.month;
        let title: string = list_occurence.title;
        let speaker: string = list_occurence.speaker;
        
        if (parseInt(c_year) >= 2019) {
          await i.reply({content: "Conference talks from 2019 and beyond have differently generated URL's, as a result I cannot generate them with the information I have. I will manually add them at some point."})
          await m.delete();
          collector.stop();
        }

        let p_title: string = title.replace(/[^a-zA-Z0-9\s]*/gm, "");
        let end_title: string = p_title.replace(/\s/gm, "-");
    
        let construct_link = `https://www.churchofjesuschrist.org/study/general-conference/${c_year}/${c_month === "April" ? "04" : "10"}/${end_title}?lang=eng`
        
        let e = {
          title: title + " by " + speaker + ", " + c_month + ", " + c_year,
          author: {
            name: message.member?.displayName + ' searched for'
          }, 
          description: construct_link,
          color: 0x086587,
          footer: {
            icon_url: client.user!.displayAvatarURL(),
            text: "LDS-Bot | General Conference Search"
          }
        }

        await i.reply({embeds: [e]});
        await m.delete();
        collector.stop();
      })
      collector.on("end", (reason: string) => {
        if (reason === "time") m.delete()
      })
    })
  }
}

export = Command

