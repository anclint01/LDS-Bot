export interface Verse {
  reference: string;
  text: string;
  verse: number;
  pilcrow?: boolean;
  heading?: string;
  subheading?: string;
}

export interface Chapter {
  chapter: number;
  reference: string;
  verses: Verse[];
  heading?: string;
  note?: string | null,
  signature?: string
}

export interface Book {
  book: string;
  chapters: Chapter[];
  full_title: string;
  heading?: string;
  lds_slug: string;
  facsimiles?: Facsimile[];
  note?: string,
  full_subtitle?: string;
}

export interface Testimony {
  text: string;
  title: string;
  witnesses: string[];
}

export interface TitlePage {
  subtitle: string;
  text: string | string[];
  title: string;
  translated_by?: string;
}

export interface Facsimile {
  explanations: string[];
  image_url: string;
  lds_slug: string;
  number: number;
  title: string;
  note: string;
}

export interface MainBook {
  books: Book[];
  last_modified: string;
  lds_slug: string;
  subtitle?: string;
  subsubtitle?: string,
  testimonies?: Testimony[];
  title: string;
  title_page?: TitlePage;
  version: number;
  the_end?: string
}  