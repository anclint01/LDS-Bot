export interface referenceOptions {
  book: string,
  sub_book: number,
  chapter: number,
  verses: number[], 
}

export interface reference {
  reference: string,
  text: string | string[],
  main_book: string,
  verse_length: number
}

export interface match {
  name: string,
  chapter: string,
  verses: string
  from: string,
  sub_book_idx: number
}