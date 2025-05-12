
import { Message, User } from "discord.js";
import { extendRanges, LDSBot_Embed_Push, LDSBot_Embed_Send } from "../constants/func";
import { reference } from "../types/reference";
import { prefix, book_names, books } from "../../config.json"
import { commands } from "..";
import { bible } from "../."
import { Paginator } from "./paginator";
import { get_reference } from "../constants/get_reference";
import { match } from "../constants/match";

export const messageHandler = async (message: Message): Promise<void> => {
  if (message.author.bot) return;

  message.content = message.content.replace(/<@(.*?)>/, "").trim();
  
  if (message.content.startsWith(prefix)) {
    const [commandName, ...args] = message.content
    .slice(prefix.length)
    .split(/ +/);

    if (commands.has(commandName.toLowerCase()) || commands.find((cmd: any) => cmd.aliases && cmd.aliases.includes(commandName.toLowerCase()))) {
      const command = commands.get(commandName.toLowerCase()) || commands.find((cmmd: any) => cmmd.aliases && cmmd.aliases.includes(commandName.toLowerCase()))
      
      if (!command) return;
      command.execute(message, args);
    } else return
  }

  let content: string = message.content; 

  let matches = match(content);

  for (let i = 0; i < matches.length; i++) {
    let name:     string = matches[i].name, 
        chapter:  string = matches[i].chapter, 
        verses:   string = matches[i].verses,
        from:     string = matches[i].from;

    let sub_books: {name: string, from: string, idx: number} = books.filter((el: { name: string, from: string, idx: number }) => el.name.toLowerCase() === name.replace(/\s/g, "").toLowerCase())[0];

    if (["ot", "nt"].includes(from)) {
      if (message.guild) {
        let bible_option = await bible.get(message.guild.id);
        if (bible_option) {
          if (bible_option === "no") continue; 
        } else {
          await bible.set(message.guild.id, "no");
          continue;
        }
      }
    }
    
    let get_verses = extendRanges(verses);
    if (get_verses.length === 0) continue;

    let fetch_reference: reference | void = get_reference({ 
      book: from, 
      sub_book: sub_books.idx, 
      chapter: parseInt(chapter)-1, 
      verses: get_verses
    });

    if (!fetch_reference) return;
    if (fetch_reference.reference.includes("Reference not found")) {
      return void LDSBot_Embed_Send(message, fetch_reference.reference, fetch_reference.text as string, "LDS-Bot");
    }
  
    if (get_verses[get_verses.length - 1] == 999) get_verses[get_verses.length - 1] = fetch_reference.verse_length;

    let page_array: Array<any> = [];
    if (Array.isArray(fetch_reference.text)) {
      let references: string[] = fetch_reference.text;
      for (let x = 0; x < references.length; x++) { 
        LDSBot_Embed_Push(page_array, fetch_reference.reference + (from === "ot" || from === "nt" ? " (KJV) " : ""), references[x], fetch_reference.main_book + ` | Page: ${x+1}`);
      }
    } else {
      void LDSBot_Embed_Send(message, fetch_reference.reference + (from === "ot" || from === "nt" ? " (KJV) " : ""), fetch_reference.text, "LDS-Bot | " + fetch_reference.main_book);  
      continue;
    }

    if (page_array.length == 1) {
      void LDSBot_Embed_Send(message, page_array[0].title, page_array[0].description, page_array[0].footer.text).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });

      continue;
    } else {
      new Paginator(message.author as User, page_array[0], page_array, true, message as Message)._new();
    }
  }
}