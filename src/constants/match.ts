import { match } from "../types/reference";
import { book_names, books } from "../../config.json"

export function match (content: string): match[] {
  let regex: RegExp = /-?([1-4])?(?:[\s]*?)((?:nephi|jacob|enos|jarom|omni|words of mormon|wom|mosiah|alma|helaman|mormon|ether|moroni|moses|abraham|josephsmithmatthew|jsm|joseph smith history|jsh|articles of faith|aof|doctrine and covenants|d&c|doctrine & covenants|matthew|mark|luke|john|the acts|acts|acts of the apostles|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|john|jude|revelation|genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi))\s*?(\d+)(?::(\d+(?:[-–](?![\d,–]))?(?:[ \t]*[-,–][ \t]*\d+)*))/gi;  
  let matches: Array<RegExpMatchArray> = [...content.matchAll(regex)];
  let results: match[] = [];
  for (var i = 0; i < matches.length; i++) {

    if (matches[i][0].startsWith("-")) continue;

    let number:   string = (typeof matches[i][1] != "undefined") ? matches[0][1] : "nothing",
        name:     string = matches[i][2], 
        chapter:  string = matches[i][3], 
        verses:   string = matches[i][4];

    name = (number === "nothing" ? "" : number) + name;

    let sub_books: {
      name: string, 
      from: string, 
      idx: number
    } = books.filter((el: { 
      name: string, 
      from: string, 
      idx: number 
    }) => el.name.toLowerCase() === name.replace(/\s/g, "").toLowerCase())[0];

    if (!book_names.includes(name.replace(/\s/g, "").toLowerCase())) continue;
    let from: string = sub_books.from;

    results.push({
      name, 
      chapter, 
      verses, 
      from, 
      sub_book_idx: sub_books.idx
    });
  }

  return results;
}