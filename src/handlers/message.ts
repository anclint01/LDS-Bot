
import { Message, User } from "discord.js";
import { LDSBot_Embed_Push, LDSBot_Embed_Send } from "../constants/func";
import { reference } from "../types/reference";
import { prefix, book_names, books } from "../../config.json"
import { commands } from "..";
import { options } from "../."
import { Paginator } from "./paginator";
import { get_reference } from "../constants/get_reference";

export const messageHandler = async (message: Message): Promise<void> => {
  if (message.author.bot) return;
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
  let regex: RegExp = /-?([1-4])?(?:[\s]*?)((?:nephi|jacob|enos|jarom|omni|words of mormon|wom|mosiah|alma|helaman|mormon|ether|moroni|moses|abraham|josephsmithmatthew|jsm|joseph smith history|jsh|articles of faith|aof|doctrine and covenants|d&c|doctrine & covenants|matthew|mark|luke|john|the acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|john|jude|revelation|genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi))\s*?(\d+)(?::(\d+))(?:-(\d+)?)?/gi;
  let matches: Array<RegExpMatchArray> = [...content.matchAll(regex)];
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][0].startsWith('-')) continue;

    let number:   string = (typeof matches[i][1] != "undefined") ? matches[i][1] : "nothing",
        name:     string = matches[i][2], 
        chapter:  string = matches[i][3], 
        verse:    string = matches[i][4], 
        endverse: string = (typeof matches[i][5] != "undefined") ? matches[i][5] : "nothing";

    name = (number === "nothing" ? "" : number) + name;
    let sub_books: {name: string, from: string, idx: number} = books.filter((el: { name: string, from: string, idx: number }) => el.name.toLowerCase() === name.replace(/\s/g, "").toLowerCase())[0];

    if (!book_names.includes(name.replace(/\s/g, "").toLowerCase())) continue;
    let from: string = sub_books.from;

    if (["ot", "nt"].includes(from)) {
      let option;
      try { option = await options.prepare(`SELECT bible FROM options WHERE guildID = ?`).get(message.guild?.id); } 
      catch (err) { console.log(err) }
      
      if (!option) {
        try { options.prepare(`INSERT INTO options (guildID, bible) VALUES (@guildID, @bible);`).run(message.guild?.id, "no"); }
        catch (err) { console.log(err); }       
        continue;
      } 
      if (option.bible === "no") continue;
    }

    let fetch_reference: reference | void = get_reference({book: from, sub_book: sub_books.idx, chapter: parseInt(chapter)-1, verse: parseInt(verse)-1, second_verse: endverse === "nothing" ? undefined : parseInt(endverse)-1});
    if (!fetch_reference) return;

    if (fetch_reference.reference.includes("Reference not found")) {
      return void LDSBot_Embed_Send(message, fetch_reference.reference, fetch_reference.text as string, "LDS-Bot");
    }

    let desc: string = "";
    let page_array: Array<any> = [];
    if (Array.isArray(fetch_reference.text)) {
      let references: string[] = fetch_reference.text;
      for (let x = 0; x < references.length; x++) { 
        let new_message: string = desc + references[x] + "\n\n";
        
        if (new_message.length <= 2000) desc = new_message;
        else {
          LDSBot_Embed_Push(page_array, fetch_reference.reference + (from === "ot" || from === "nt" ? " (KJV) " : ""), desc, fetch_reference.main_book);
          desc = references[x] + "\n\n";
        }
      }
    } else {
      void LDSBot_Embed_Send(message, fetch_reference.reference + (from === "ot" || from === "nt" ? " (KJV) " : ""), fetch_reference.text, "LDS-Bot | " + fetch_reference.main_book);  
      continue;
    }

    if (desc.length > 0) {
      LDSBot_Embed_Push(page_array, fetch_reference.reference + (from === "ot" || from === "nt" ? " (KJV) " : ""), desc, fetch_reference.main_book);
    }

    if (page_array.length == 1) {
      void LDSBot_Embed_Send(message, page_array[0].title, page_array[0].description, page_array[0].footer.text).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });

      continue;
    } else {
      new Paginator(message.author as User, page_array[0], page_array, message as Message)._new();
    }
  }
}
