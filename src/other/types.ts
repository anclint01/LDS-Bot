export interface MainBook {
  books?: Array<Book>;
  last_modified?: string;
  lds_slug?: string;
  sections?: Array<Section>
  subtitle?: string
  subsubtitle?: string;
  testimonies?: Array<Testimonie>;
  the_end?: string;
  title?: string;
  title_page?: Title_page;
  version?: number;
}

export interface Book {
  book: string;
  chapters: Array<Chapter>;
  full_title: string;
  heading?: string;
  lds_slug: string;
  note?: string;
  facsimiles?: Facsimile[];
  full_subtitle?: string;
}

export interface Section {
  section: number;
  reference: string;
  verses: Verse[];
  signature?: string;
}

export interface Chapter {
  chapter?: number;
  section?: number; 
  reference: string;
  verses: Array<Verse>;
  heading?: string;
  signature?: string;
}

export interface Verse {
  reference: string;
  text: string;
  verse: number;
  pilcrow?: string | boolean;
  heading?: string;
  subheading?: string;
}

interface Testimonie {
  text: string;
  title: string;
  witnesses: Array<string>;
}

interface Title_page {
  subtitle: string;
  text: Array<string> | string;
  title: string;
  translated_by?: string;
}

interface Facsimile {
  explanations: string[];
  image_url: string;
  lds_slug: string;
  number: number;
  title: string;
  note?: string;
}