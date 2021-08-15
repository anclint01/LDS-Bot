
import CommandManager from "./commands";
import { Message } from "discord.js";
import { embed_page, getClient, LDSBot_Embed_Push } from "../other/func";
import { prefix, book_names, books, presentable_book_names } from "../../config.json"
import bom from "../../book-of-mormon.json";
import dc from "../../doctrine-and-covenants.json";
import pgp from "../../pearl-of-great-price.json";
import ot from "../../old-testament.json";
import nt from "../../new-testament.json";
import { Book, Chapter, MainBook, Section, Verse } from "../other/types";
import { options } from "..";
const client = getClient();

export const Manager: CommandManager = new CommandManager(client);
Manager.loadCommands("../components/commands");
export const commands = Manager.commands;

export const messageHandler = async (message: Message): Promise<void> => {
  if (message.author.bot) return console.log("this is a bot");
  
  if (message.content.startsWith(prefix)) {
    const [commandName, ...args] = message.content
    .slice(prefix.length)
    .split(/ +/);

    if (commands.has(commandName) || commands.mapValues((value)=>value.aliases.includes(commandName))) {
      const command = commands.get(commandName);
      if (!command) return;
      command.execute(message, args);
    } else return
  }

  let content: string = message.content.replace(/\s/g, "");  
  let regex: RegExp = /([1-4])?([a-z&]+)(\d+)(?::(\d+))(-(\d+)?((\d+))?)?/ig
  let matches: Array<RegExpMatchArray> = [...content.matchAll(regex)];
  
  for (let i = 0; i < matches.length; i++) {
    let number:   string = (typeof matches[i][1] != "undefined") ? matches[i][1] : "nothing",
        name:     string = matches[i][2], 
        chapter:  string = matches[i][3], 
        verse:    string = matches[i][4], 
        endverse: string = "nothing";

    let sub_books: {name: string, from: string, idx: number};  

    if (number != "nothing") sub_books = books.filter((el) => el.name.toLowerCase() === `${number}${name.toLowerCase()}`)[0];
    else sub_books = books.filter((el) => el.name.toLowerCase() === name.toLowerCase())[0];

    if (typeof sub_books == "undefined") sub_books = books.filter((el) => el.name.toLowerCase() === name.toLowerCase())[0];
    else name = (number === "nothing" ? "" : number) + name;

    if (!book_names.includes(name.toLowerCase())) return; // Exit loop if book is not found.
    
    if (typeof matches[i][5] == "string" && matches[i][5].startsWith("-")) endverse = matches[i][6]; // 

    let from: string = sub_books.from;

    if (["ot", "nt"].includes(from)) {
      let option;
      try {
        option = await options.prepare(`SELECT bible FROM options WHERE guildID = ?`).get(message.guild?.id);
      } catch (err) {
        console.log(err)
      }
      
      if (!option) {
        try {
          options.prepare(`INSERT INTO options (guildID, bible) VALUES (@guildID, @bible);`).run(message.guild?.id, "no");
        } catch (err) {
          console.log(err)
        }       
        continue;
      } else {
        if (option.bible === "no") continue;
      }
    }

    let requested_book: MainBook = (from == "bom" ? bom : (from == "pgp" ? pgp : (from == "dc" ? dc : (from == "nt" ? nt : ot))));
    
    let requested_sub_book: MainBook | Book = from === "d&c" ? requested_book : requested_book.books![sub_books.idx];
    if (!requested_sub_book) return; 

    let presentable_name: string = presentable_book_names[book_names.indexOf(name.toLowerCase())]      
    if (!presentable_name) return;


    let book_chapters: Chapter[] | Section[] | undefined = (from == "d&C" ? (requested_sub_book as MainBook).sections : (requested_sub_book as Book).chapters)
    if (!book_chapters) return;

    let chapter_length: number = book_chapters!.length;
    if (!requested_book || !book_chapters || parseInt(chapter) > chapter_length) {
      return void await message.channel.send({ content: "\u200E", embeds: [{ 
        color: 0x086587, 
        title: "Reference not found", 
        description: "There are only **" + 
        chapter_length + "** Chapters in " + presentable_name, 
        footer: { 
          text: "LDS-Bot", 
          icon_url: client.user!.displayAvatarURL()
        }
      }]}).catch((err: any) => {
        console.log("Something went wrong: " + err)
      });    
    }

    let book_chapter = book_chapters[parseInt(chapter)-1];
    if (!book_chapter) return;

    let chapter_verses: Verse, desc: string = "";
    let page_array: Array<any> = [];
    if (endverse != "nothing") {
      for (let x = parseInt(verse)-1; x < parseInt(endverse); x++) { 
        let new_message: string;
        if (x+1 <= book_chapter.verses.length) new_message = desc + "**" + book_chapter.verses[x].verse + "** " + book_chapter.verses[x].text + "\n\n";
        else new_message = desc + "? **" + (x+1) + " - This verse doesn't seem to exist**\n\n"
        
        if (new_message.length <= 2000) desc = new_message;
        else {
          LDSBot_Embed_Push(page_array, presentable_name + " " + chapter + ":" + verse + (endverse != "nothing" ? "-" + endverse: ""), desc);
          desc = "**" + book_chapter.verses[x].verse + "** " + book_chapter.verses[x].text + "\n\n";
        }
      }
    } else {
      if (!book_chapter.verses[parseInt(verse)-1]) {
        return void message.channel.send({ content: "\u200E", embeds: [{ 
          color: 0x086587, 
          title: "Reference not found", 
          description: "There are only **" + book_chapter.verses.length + "** verses in " + presentable_name + " Chapter **" + chapter + "**", 
          footer: { 
            text: "LDS-Bot", 
            icon_url: client.user!.displayAvatarURL()
          }
        }]}).catch((error: any)=> {
          console.log("Something went wrong: " + error);
        });
      }
      chapter_verses = book_chapter.verses[parseInt(verse)-1], desc = "**" + chapter_verses.verse + "** " + chapter_verses.text;
    }

    if (desc.length > 0) {
      LDSBot_Embed_Push(page_array, presentable_name + " " + chapter + ":" + verse + (endverse != "nothing" ? "-" + endverse: ""), desc);
    }

    if (page_array.length == 1) {
      return void message.channel.send({ content: "\u200E", embeds: [page_array[0]] }).catch((err: any)=> {
        console.log("Something went wrong: " + err);
      });
    } else embed_page(message, page_array[0], page_array)

  }
}