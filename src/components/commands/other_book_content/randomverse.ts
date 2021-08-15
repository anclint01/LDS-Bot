import { Message } from 'discord.js'
import BaseCommand from '../../../command'
import { getClient } from "../../../other/func";
import bom from "../../../../book-of-mormon.json";
import dc from "../../../../doctrine-and-covenants.json";
import pgp from "../../../../pearl-of-great-price.json";
import ot from "../../../../old-testament.json";
import nt from "../../../../new-testament.json";
import { Book, Chapter, MainBook, Section, Verse } from '../../../other/types';
const client = getClient();


class Command extends BaseCommand {
  constructor () {
    super ("randomverse", "other_book_content", "Sends random verse", "", ["rv", "random"])
  }
  execute (message: Message, args: string[]) {
    function getRandomInt(max: number): number {
      return Math.floor(Math.random() * Math.floor(max));
    }
    let main_books: MainBook[] = [bom, pgp, dc, ot, nt];
    let main_book: MainBook = main_books[getRandomInt(5)];

    let sub_books_length: number | undefined = main_book.lds_slug === "dc-testament/dc" ? 1 : main_book.books?.length;
    if (!sub_books_length) return;

    let chosen_sub_book: Book | MainBook | undefined = main_book.lds_slug === "dc-testament/dc" ? main_book : main_book.books![getRandomInt(sub_books_length)];
    if (!chosen_sub_book) return;

    let random_chapter: Chapter | Section | undefined = undefined;
    if (main_book.lds_slug != "dc-testament/dc") {
      let chapters_length: number = main_book.lds_slug === "dc-testament/dc" ? (chosen_sub_book as MainBook).sections!.length : (chosen_sub_book as Book)?.chapters.length;      
      if (!chapters_length) return;
      random_chapter = main_book.lds_slug === "dc-testament/dc" ? (chosen_sub_book as MainBook).sections![getRandomInt(chapters_length)] : (chosen_sub_book as Book).chapters[getRandomInt(chapters_length)]
    }
    if (!random_chapter) return;

    let verses_length: number | undefined = random_chapter.verses?.length;
    if (!verses_length) return;

    let random_verse: Verse = random_chapter.verses![getRandomInt(verses_length)];
    if (!random_verse) return;

    message.channel.send({ content: "‎‎‎",
      embeds: [{
        color: 0x086587,
        title: random_verse.reference,
        description: random_verse.text,
        footer: {
          text: "LDS-Bot",
          icon_url: client.user?.displayAvatarURL()
        }
      }]
    }).catch((err: any) => {
      console.log("Something went wrong: " + err);
    });  
  }
}

export = Command


