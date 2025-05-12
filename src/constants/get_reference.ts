import { reference, referenceOptions } from "../types/reference";
import { Chapter, MainBook } from "../types/books";
import bom from "../../book-of-mormon.json";
import dc from "../../doctrine-and-covenants.json";
import pgp from "../../pearl-of-great-price.json";
import ot from "../../old-testament.json";
import nt from "../../new-testament.json";
import { extendRanges, getRanges } from "./func";

export function get_reference (options: referenceOptions): reference | void {
  let main_book: MainBook = (options.book == "bom" 
    ? bom : options.book == "pgp" 
    ? pgp : options.book == "d&c" 
    ? dc  : options.book == "nt" 
    ? nt  : ot) as MainBook;

  if (main_book === undefined || main_book.books === undefined) return;

  let { sub_book, chapter, verses }  = options;

  let ref: Chapter = main_book.books[sub_book].chapters[chapter];

  if (chapter + 1 > main_book.books[sub_book].chapters.length) {
    return { 
      reference: "Reference not found", 
      text: `There are only **${main_book.books[sub_book].chapters.length}** chapters in **${main_book.books[sub_book].book}**`,
      main_book: "",
      verse_length: 0
    }
  }

  if (verses.length === 1 && verses[0] > ref.verses.length) {
    return { 
      reference: "Reference not found", 
      text: `There are only **${ref.verses.length}** verses in **${main_book.books[sub_book].book}** Chapter **${chapter+1}**`, 
      main_book: "",
      verse_length: 0
    }
  }

  if (verses[1] === 999) {
    let ph = verses[0];
    verses = extendRanges(`${ph}-${ref.verses.length}`)
  }

  let ref_arr: string[] = [];
  let ref_text = "";

  if (verses.length > 1) {
    for (let x = 0; x < verses.length; x++) { 

      let new_text: string; 

      if (verses[x] <= ref.verses.length) {
        new_text = ref_text + "**" + (verses[x]).toString() + "** " + ref.verses[verses[x]-1].text + "\n\n";
      } else {
        new_text = ref_text + "❓ **" + (verses[x]).toString() + " - This verse doesn't seem to exist**" + "\n\n";
      }

      if (new_text.length <= 2000) ref_text = new_text;
      else {
        ref_arr.push(ref_text);

        if (verses[x] <= ref.verses.length) {
          ref_text = "**" + (verses[x]).toString() + "** " + ref.verses[verses[x]-1].text + "\n\n";
        } else {
          ref_text = "❓ **" + (verses[x]).toString() + " - This verse doesn't seem to exist**" + "\n\n";
        }
      }
    }
  }

  if (ref_text.length > 0) {
    ref_arr.push(ref_text);
  }

  let reference = ref_arr.length === 0 
    ? ref.verses[verses[0]-1].text 
    : ref_arr;
  
  let show_verses = getRanges(verses);

  return { 
    reference: `${main_book.books[sub_book].book} ${chapter+1}:${show_verses.length === 0 ? show_verses[0] : show_verses.join(", ")}`, 
    text: reference, 
    main_book: options.book == "d&c" ? "The Doctrine and Covenants" : main_book.title as string,
    verse_length: ref.verses.length
  }
}