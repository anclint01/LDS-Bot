import { CommandInteraction, MessageEmbed, TextChannel, User } from "discord.js";
import { Message } from 'discord.js'
import BaseCommand from '../../../types/command'
import { book_names, books } from "../../../../config.json"
import bom from "../../../../book-of-mormon.json";
import dc from "../../../../doctrine-and-covenants.json";
import pgp from "../../../../pearl-of-great-price.json";
import ot from "../../../../old-testament.json";
import nt from "../../../../new-testament.json";
import { Book, Chapter, MainBook } from "../../../types/books";
import { LDSBot_Embed_Push } from "../../../constants/func";
import { Paginator } from "../../../handlers/paginator";

class Command extends BaseCommand {
  constructor () {
    super ("chapters", "info", "Provides number of verses for each chapter in the book requested", {
      name: "chapters",
      description: "Provides number of verses for each chapter in the book requested",
      options: [
        {
          type: 3,
          name: "book",
          description: "book you want list of chapters from",
          required: true
        }
      ]
    }, "<book>")
  }

  async execute_slash (interaction: CommandInteraction) {  
    let book: string = interaction.options.getString("book", true);

    let sub_books: { 
      name: string, 
      from: string, 
      idx: number
    } = books.filter((el: {name: string, from: string, idx: number}) => el.name.toLowerCase() === book.toLowerCase())[0];
    
    if (!sub_books) {
      await interaction.reply({content: "That book doesn't seem to exist", ephemeral: true}).catch((err: any) => {
        console.log("Something went wrong: " + err)
      })

      interaction.deferReply();

      return;
    }    

    if (!book_names.includes(book.toLowerCase())) return; // Exit loop if book is not found.

    let from: string = sub_books.from; // set book.
    let requested_book: MainBook = (from == "bom" ? bom : (from == "pgp" ? pgp : (from == "d&c" ? dc : (from == "nt" ? nt : ot))));
    if (!requested_book) return;

    let requested_sub_book: Book = requested_book.books![sub_books.idx];
    if (!requested_sub_book) return;

    let book_chapters: Chapter[] | undefined = requested_sub_book.chapters;
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
      await interaction.reply({content: "‎‎‎", embeds: [page_array[0]]}).catch((err: any) => {
        console.log("Something went wrong: " + err);
      });
    } else {
      new Paginator(interaction.user as User, page_array[0], page_array, undefined, interaction)._new();
    }    
  }

  async execute (message: Message, args: string[]) {
    let book = args.join("");

    let sub_books: { 
      name: string, 
      from: string, 
      idx: number
    } = books.filter((el: {name: string, from: string, idx: number}) => el.name.toLowerCase() === book.toLowerCase())[0];
    if (!sub_books) return message.channel.send({content: "That book doesn't seem to exist"})

    if (!book_names.includes(book.toLowerCase())) return; // Exit loop if book is not found.

    let from: string = sub_books.from; // set book.
    let requested_book: MainBook = (from == "bom" ? bom : (from == "pgp" ? pgp : (from == "d&c" ? dc : (from == "nt" ? nt : ot))));
    if (!requested_book) return;

    let requested_sub_book: Book = requested_book.books![sub_books.idx];
    if (!requested_sub_book) return;

    let book_chapters: Chapter[] | undefined = requested_sub_book.chapters;
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
    } else new Paginator(message.author as User, page_array[0], page_array, message as Message)._new();
  }
}

export = Command