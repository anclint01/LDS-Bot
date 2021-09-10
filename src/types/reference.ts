export interface referenceOptions {
  book: string,
  book_number?: number;
  sub_book: number,
  chapter: number,
  verse: number
  second_verse?: number 
}

export interface reference {
  reference: string,
  text: string | string[],
  main_book: string,
}