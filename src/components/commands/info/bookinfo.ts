import bom from "../../../../book-of-mormon.json";
import dc from "../../../../doctrine-and-covenants.json";
import pgp from "../../../../pearl-of-great-price.json";
import ot from "../../../../old-testament.json";
import nt from "../../../../new-testament.json";

import { Message } from 'discord.js'
import BaseCommand from '../../../command'
import { books, book_names, presentable_book_names } from '../../../../config.json'
import { Book, Chapter, MainBook, Section } from "../../../other/types";
import { getClient } from "../../../other/func";

const client = getClient();
class Command extends BaseCommand {
  constructor () {
    super ("bookinfo", "info", "returns info on requested book", "<book>")
  }
  execute (message: Message, args: string[]) {
    let book: string = args.join("");

    let sub_books: {
      name: string, 
      from: string, 
      idx: number
    } = books.filter((el: {name: string, from: string, idx: number}) => el.name.toLowerCase() === book.toLowerCase())[0];

    if (!sub_books) {
      return message.channel.send({content: "This book doesn't seem to exist"}).catch((err: any) => {
        console.log("Something went wrong" + err);
      })
    }

    if (!book_names.includes(book.toLowerCase())) return; 
    
    let from: string = sub_books.from;

    let requested_book: MainBook = (from == "bom" ? bom : (from == "pgp" ? pgp : (from == "d&c" ? dc : (from == "nt" ? nt : ot))));
    let requested_sub_book: MainBook | Book = from === "d&c" ? requested_book : requested_book.books![sub_books.idx];
    
    let book_chapters: Chapter[] | Section[] | undefined = (from == "d&c" ? (requested_sub_book as MainBook).sections : (requested_sub_book as Book).chapters)
    if (!book_chapters) return;
    let chapter_length: number = book_chapters!.length;

    let total_verses: number = 0;
    for (let i = 0; i < chapter_length; i++) {
      total_verses += book_chapters[i].verses.length;
    }

    let presentable_name: string = presentable_book_names[book_names.indexOf(book.toLowerCase())]      

    message.channel.send({ content: "‎‎‎",
      embeds: [{
        color: 0x086597,
        title: "Book Info for " + presentable_name,
        fields: [{
            name: "Full Title",
            value: from == "d&c" ? "The Doctrine and Covenants" : (requested_sub_book as Book).full_title,
            inline: true
          },
          {
            name: "Book Contained In",
            value: requested_book.title!,
            inline: true
          },
          {
            name: "‎‎‎",
            value: "‎‎‎",
            inline: true
          },
          {
            name: "# of Chapters",
            value: chapter_length.toString(),
            inline: true
          },
          {
            name: "Total Verses",
            value: total_verses.toString(),
            inline: true
          },
          {
            name: "‎‎‎",
            value: "‎‎‎",
            inline: true
          },
          {
            name: "More",
            value: "To get a list of all chapters with their verse count for a specific book use: ``lds chapters <bookname>``"
          }
        ],
        footer: {
          text: "LDS-Bot",
          icon_url: client.user!.displayAvatarURL()
        }
      }]
    }).catch((err: any) => {
      console.log("Something went wrong: " + err);
    });
  }
}

export = Command

