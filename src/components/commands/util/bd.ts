import { ChatInputCommandInteraction , Message, JSONEncodable, User, ComponentType, InteractionCollector, APIEmbed, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js'
import BaseCommand from '../../../types/command'
import { find_entry, getClient, get_result } from '../../../constants/func';
import { Paginator } from '../../../handlers/paginator';
import { error } from 'console';
const client = getClient();

const request = require("request");

class Command extends BaseCommand {
  constructor () {
    super ("bd", "util", "searches Bible Dictionary provided by churchofjesuschrist.org", {
      name: "bd",
      description: "searches Bible Dictionary provided by churchofjesuschrist.org",
      options: [{
        type: 3,
        name: "query",
        description: "bible dictionary term to search for",
        required: true
      }]
    })
  }
  async select (results: {
    result: { name: string; link: string; };
    result_array: {
        name: string;
        link: string;
        similarity: number;
    }[];
  }, search: string, message?: Message | undefined, interaction?: ChatInputCommandInteraction | undefined) {

    let check = message !== undefined ? message : (interaction !== undefined ? interaction : undefined)

    let user = message !== undefined ? message.author : (interaction !== undefined ? interaction.user : undefined)
    if (user === undefined) return undefined;

    let channel = message !== undefined ? message.channel : (interaction !== undefined ? interaction.channel : undefined)
    if (channel === undefined || channel === null) return undefined;

    if (results.result_array.length === 0) {
      return check === interaction 
      ? interaction!.reply("Didn't find anything like that in the Bible Dictionary!") 
      : message!.channel.send("Didn't find anything like that in the Bible Dictionary!");
    }

    let sorted_results: any[] = results.result_array.sort((a, b) => b.similarity - a.similarity);

    let top_ten: any[] = sorted_results.slice(0, results.result_array.length);
    
    let options: any[] = [];
    for (let i = 0; i < top_ten.length; i++) {
      options.push({
        label: "Search Parameter: " + search,
        description: `${top_ten[i].name}`,
        value: i.toString()
      })
    }

    let row: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
            .setCustomId("search")
            .setPlaceholder(top_ten[0].name)
            .addOptions(options));
    
    let m = await (check === interaction 
    ? interaction?.reply({content: "Search results", components: [row]}).catch(error=>console.log(error)).catch(error=>console.log(error)) 
    : message?.channel.send({content: "Search results", components: [row]}).catch(error=>console.log(error)).catch(error=>console.log(error))) as Message
    
    const filter = (i: StringSelectMenuInteraction) => i.customId === 'search' && i.isStringSelectMenu();
    const collector: InteractionCollector<StringSelectMenuInteraction> = channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 120000, max: 1 });
    collector.on("collect", async (i: StringSelectMenuInteraction) => {
      let choice: number = parseInt(i.values[0]);
  
      let list_occurence = top_ten[choice];
      let name: string = list_occurence.name;
      let link: string = list_occurence.link;
      
      let result = await get_result(name, "https://www.churchofjesuschrist.org/" + link, "Bible Dictionary");
      
      if (result === undefined) {
        i.reply("Uh oh, something went wrong");
        collector.stop();
      }

      if (typeof result === "string") {
        i.reply(result);
        collector.stop();
      }
  
      if (typeof result === "object") {
        if (Array.isArray(result)) {
          result = result as JSONEncodable<APIEmbed>[];
          new Paginator(user as User, result[0] as APIEmbed, result, false, check === interaction ? undefined : message as Message, check === interaction ? i as StringSelectMenuInteraction : undefined)._new()
          collector.stop();
        } else {
          result = result as APIEmbed;
          i.reply({ embeds:[result]})
          collector.stop();
        }
      }
    })
    
    collector.on("end", async (reason: string) => {
      if (reason === "time") {
        m.edit({content: "Search timed out."}).catch(error=>{console.log(error)}); 
      } else {
        m.delete().catch(error=>{console.log(error)});
      }
    })

  }

  async execute_slash (interaction: ChatInputCommandInteraction ) {
    let search = interaction.options.getString("query", true);

    let results = await find_entry(search, "Bible Dictionary");

    if (results.result.name !== "") {
      let result = await get_result(results.result.name, "https://www.churchofjesuschrist.org/" + results.result.link, "Bible Dictionary");

      if (result === undefined) interaction.reply("Uh oh, something went wrong");
  
      if (typeof result === "string") {
        interaction.reply(result);
      }
  
      if (typeof result === "object") {
        if (Array.isArray(result)) {
          result = result as JSONEncodable<APIEmbed>[];
          new Paginator(interaction.user as User, result[0] as APIEmbed, result, false, undefined, interaction as ChatInputCommandInteraction)._new()
        } else {
          result = result as APIEmbed;
          interaction.reply({ embeds:[result]})
        }
      }
    } else {
      this.select(results, search, undefined, interaction);
    }
  }

  async execute (message: Message, args: string[]) {
    let search = args.join("").toLowerCase();

    let results = await find_entry(search, "Bible Dictionary");

    if (results.result.name !== "") {
      let result = await get_result(results.result.name, "https://www.churchofjesuschrist.org/" + results.result.link, "Bible Dictionary");

      if (result === undefined) return message.channel.send("Uh oh, something went wrong");
  
      if (typeof result === "string") {
        message.channel.send(result);
      }
  
      if (typeof result === "object") {
        if (Array.isArray(result)) {
          result = result as JSONEncodable<APIEmbed>[];
          new Paginator(message.author as User, result[0] as APIEmbed, result, false, message as Message)._new()
        } else {
          result = result as APIEmbed;
          message.channel.send({ embeds:[result]})
        }
      }
    } else {
      this.select(results, search, message);
    }
  }
}

export = Command