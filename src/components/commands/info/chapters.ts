import { MessageEmbed } from "discord.js";
import { Message } from 'discord.js'
import BaseCommand from '../../../command'
import { book_names, books } from "../../../../config.json"
import bom from "../../../../book-of-mormon.json";
import dc from "../../../../doctrine-and-covenants.json";
import pgp from "../../../../pearl-of-great-price.json";
import ot from "../../../../old-testament.json";
import nt from "../../../../new-testament.json";
import { Book, Chapter, MainBook, Section } from "../../../other/types";
import { embed_page, LDSBot_Embed_Push } from "../../../other/func";

class Command extends BaseCommand {
  constructor () {
    super ("chapters", "info", "Provides number of verses for each chapter in the book requested", "<book>")
  }
  execute (message: Message, args: string[]) {
    let book = args.join("");

    let sub_books: { 
      name: string, 
      from: string, 
      idx: number
    } = books.filter((el: {name: string, from: string, idx: number}) => el.name.toLowerCase() === book)[0];
    if (!sub_books) return message.channel.send({content: "That book doesn't seem to exist"})

    if (!book_names.includes(book.toLowerCase())) return; // Exit loop if book is not found.

    let from: string = sub_books.from; // set book.
    let requested_book: MainBook = (from == "bom" ? bom : (from == "pgp" ? pgp : (from == "d&c" ? dc : (from == "nt" ? nt : ot))));
    if (!requested_book) return;

    let requested_sub_book: MainBook | Book = from === "d&c" ? requested_book : requested_book.books![sub_books.idx];
    if (!requested_sub_book) return;

    let book_chapters: Chapter[] | Section[] | undefined = from === "d&c" ? (requested_sub_book as MainBook).sections : (requested_sub_book as Book).chapters;
    if (!book_chapters) return;

    let description: string = "";
    let page_array: MessageEmbed[] = [];
    for (let i = 0; i < book_chapters.length; i++) {
      if (description.length >= 2000) {
        LDSBot_Embed_Push(page_array, "Chapters in " + (from === "d&c" ? (requested_sub_book as MainBook).title : (requested_sub_book as Book).book), description)
        description = "";
      }  
      description += `Chapter ${i+1} - \`${book_chapters[i].verses?.length} verses\`\n`
    }
    if (description.length > 0) LDSBot_Embed_Push(page_array, "Chapters in " + (from === "d&c" ? (requested_sub_book as MainBook).title : (requested_sub_book as Book).book), description)
    
    if (page_array.length < 2) {
      message.channel.send({content: "‎‎‎", embeds: [page_array[0]]}).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    } else embed_page(message, page_array[0], page_array);
  }
}

export = Command