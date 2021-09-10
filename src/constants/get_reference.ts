import { reference, referenceOptions } from "../types/reference";
import { Chapter, MainBook } from "../types/books";
import bom from "../../book-of-mormon.json";
import dc from "../../doctrine-and-covenants.json";
import pgp from "../../pearl-of-great-price.json";
import ot from "../../old-testament.json";
import nt from "../../new-testament.json";

export function get_reference (options: referenceOptions): reference | void {
  let main_book: MainBook = (options.book == "bom" ? bom : (options.book == "pgp" ? pgp : (options.book == "d&c" ? dc : (options.book == "nt" ? nt : ot))));
  if (!main_book || !main_book.books) return;
  let sub_book = options.sub_book;
  let chapter = options.chapter;
  let verse = options.verse;

  let second_verse = null;
  if ("second_verse" in options) {
    second_verse = options.second_verse;
  }

  let ref: Chapter = main_book.books![sub_book].chapters[chapter];

  if (chapter+1 > main_book.books[sub_book].chapters.length) return {reference: "Reference not found", text: `There are only **${main_book.books[sub_book].chapters.length}** chapters in **${main_book.books[sub_book].book}**`, main_book: ""};
  if (verse+1 > ref.verses.length) return {reference: "Reference not found", text: `There are only **${ref.verses.length}** verses in **${main_book.books[sub_book].book}** Chapter **${chapter+1}**`, main_book: ""};
  
  let ref_arr: string[] = [];
  if (second_verse) {
    for (let x = verse; x <= second_verse; x++) { 
      if (x+1 <= ref.verses.length)
        ref_arr.push("**" + (x+1).toString() + "** " + ref.verses[x].text);
      else 
        ref_arr.push("❓ **" + (x+1).toString() + " - This verse doesn't seem to exist**")
    }
  }

  console.log(main_book.title!)
  let reference = ref_arr.length === 0 ? ref.verses[verse].text : ref_arr;
  return {reference: `${main_book.books[sub_book].book} ${chapter+1}:${verse+1}${(second_verse ? "-" + (second_verse+1).toString() : "")}`, text: reference, main_book: main_book.title!};
}