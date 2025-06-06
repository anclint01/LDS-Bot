import { ChatInputCommandInteraction, Message } from 'discord.js'
import BaseCommand from '../../../types/command'
import { books, book_names, presentable_book_names, main_book_aliases } from '../../../../config.json'
import { getClient } from "../../../constants/func";

const client = getClient();

class Command extends BaseCommand {
  constructor () {
    super ("booknames", "info", "Lists book names for requested main book", {
      name: "booknames",
      description: "Lists book names for requested main book",
      options: [
        {
          type: 3,
          name: "book",
          description: "Main book you want to a list of sub-books from",
          required: true,
          choices: [
            {name: "The Book of Mormon", value: "bom"},
            {name: "The Pearl of Great Price", value: "pgp"},
            {name: "Doctrine and Covenants", value: "d&c"},
            {name: "The Old Testament (KJV)", value: "ot"},
            {name: "The New Testament (KJV)", value: "nt"}
          ]
        }
      ]
    }, "<mainbook>")
  }

  async execute_slash (interaction: ChatInputCommandInteraction) {
    let from: string = interaction.options.getString("book", true);
    console.log(from)
    if (!["bom", "pgp", "d&c", "ot", "nt"].includes(from.toLowerCase())) { 
      let check_aliases: boolean = false;
      
      for (let k in main_book_aliases) {
        if ((main_book_aliases as any)[k].includes(from.toLowerCase())) {
          from = k;
          check_aliases = true;
        }
      }

      if (!check_aliases) {
          await interaction.reply({content: "That is not a valid book", ephemeral: true}).catch((err: any) => {
            console.log("Something went wrong: " + err)
          })
          return;
      }
    }

    let sub_books: {
      name: string;
      from: string;
      idx: number;
    }[] = books.filter((el: {name: string, from: string, idx: number}) => el.from === from);

    let desc: string = "";
    sub_books.forEach((book: {name: string; from: string; idx: number;}) => {
      if (book_names.includes(book.name.toLowerCase())) {
        desc += "`" + presentable_book_names[book_names.indexOf(book.name.toLowerCase())] + "` ";
      }
    })

    await interaction.reply({ embeds: [{
        color: 0x086597,
        title: "Book Names For " + (from == "bom" ? "Book of Mormon" : (from == "pgp" ? "Pearl of Great Price" : (from == "d&c" ? "Doctrine and Covenants" : (from == "nt" ? "New Testament (KJV)" : "Old Testament (KJV)")))),
        description: desc === "" ? "D&C, is a book itself, it does not have any books within it, only chapters." : desc,
        fields: [{
          name: "FYI: ",
          value: "For more info use ``lds bookinfo <bookname>``",
          inline: true
        }],
        footer: {
          text: "LDS-Bot",
          icon_url: client.user!.displayAvatarURL()
        }
      }]
    }).catch((err: any) => {
      console.log("Something went wrong: " + err);
    });
  }

  async execute (message: Message, args: string[]) {
    let from: string = args.join("");

    if (!["bom", "pgp", "dc", "ot", "nt"].includes(from.toLowerCase())) { 
      let check_aliases: boolean = false;
      
      for (let k in main_book_aliases) {
        if ((main_book_aliases as any)[k].includes(from.toLowerCase())) {
          from = k;
          check_aliases = true;
        }
      }

      if (!check_aliases) {
        return message.channel.send({content: "That is not a valid book"}).catch((err: any) => {
          console.log("Something went wrong: " + err)
        })
      }
    }

    let sub_books: {
      name: string;
      from: string;
      idx: number;
    }[] = books.filter((el: {name: string, from: string, idx: number}) => el.from === from);

    let desc: string = "";
    sub_books.forEach((book: {name: string; from: string; idx: number;}) => {
      if (book_names.includes(book.name.toLowerCase())) {
        desc += "`" + presentable_book_names[book_names.indexOf(book.name.toLowerCase())] + "` ";
      }
    })

    await message.channel.send({ embeds: [{
        color: 0x086597,
        title: "Book Names For " + (from == "bom" ? "Book of Mormon" : (from == "pgp" ? "Pearl of Great Price" : (from == "d&c" ? "Doctrine and Covenants" : (from == "nt" ? "New Testament (KJV)" : "Old Testament (KJV)")))),
        description: desc === "" ? "D&C, is a book itself, it does not have any books within it, only chapters." : desc,
        fields: [{
          name: "FYI: ",
          value: "For more info use ``lds bookinfo <bookname>``",
          inline: true
        }],
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
