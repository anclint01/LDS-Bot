const bom = require("../book-of-mormon.json");
const dc = require("../doctrine-and-covenants.json");
const pgp = require("../pearl-of-great-price.json");
let bom_books = {
    "Nephi": 0,
    "Jacob": 1,
    "Enos": 2,
    "Jarom": 3,
    "Omni": 4,
    "Words_of_Mormon": 5,
    "Wom": 5,
    "Mosiah": 6,
    "Alma": 7,
    "Helaman": 8,
    "Mormon": 9,
    "Ether": 10,
    "Moroni": 11,
}
let pgp_books = {
    "Moses": 0,
    "Abraham": 1,
    "Joseph_Smith_Matthew": 2,
    "JSM": 2,
    "Joseph_Smith_History": 3,
    "JSH": 3,
    "Articles_of_Faith": 4,
    "AOF": 4,
}
module.exports = {
    name: 'randomverse',
    description: 'Sends random verse',
    execute(message, args, bot) {
        if (message.author.id == 221285118608801802) {
            var userColorPreference = 0xf2a93b;
        } else {
            var userColorPreference = 0x086587;
        }
        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }
        let mainBooks = [bom, pgp, dc];
        let randomMainBook = getRandomInt(3);
        var randomNephiNumber;
        var randomBook;
        var randomChapter;
        var randomVerse;
        var curBook = mainBooks[randomMainBook];
        if (randomMainBook == 2) {
            randomChapter = getRandomInt(curBook.sections.length);
            randomVerse = getRandomInt(curBook.sections[randomChapter].verses.length);
        } else {
            randomBook = getRandomInt(curBook.books.length);
            var book = curBook.books[randomBook];
            if (randomMainBook === 0 && randomBook === 0) {
                randomNephiNumber = getRandomInt(4);
                randomChapter = getRandomInt(book.numbers[randomNephiNumber].chapters.length);
                randomVerse = getRandomInt(book.numbers[randomNephiNumber].chapters[randomChapter].verses.length);
            } else {
                randomChapter = getRandomInt(book.chapters.length);
                randomVerse = getRandomInt(book.chapters[randomChapter].verses.length);
            }
        }
        var book;
        var chapter;
        var verse;
        if (randomMainBook === 0 && randomBook === 0) book = mainBooks[randomMainBook].books[randomBook].numbers[randomNephiNumber];
        else if (randomMainBook != 2) book = mainBooks[randomMainBook].books[randomBook];

        if (randomMainBook != 2) chapter = book.chapters[randomChapter];
        else chapter = mainBooks[randomMainBook].sections[randomChapter];

        verse = chapter.verses[randomVerse];
        if (randomMainBook === 0) {
            if (randomBook === 0) {
                message.channel.send({
                    embed: {
                        color: userColorPreference,
                        title: randomNephiNumber + 1 + " Nephi " + chapter.chapter + ":" + verse.verse,
                        description: verse.text,
                        footer: {
                            text: "LDS-Bot",
                            icon_url: bot.user.avatarURL
                        }
                    }
                });
            } else {
                message.channel.send({
                    embed: {
                        color: userColorPreference,
                        title: book.book + " " + chapter.chapter + ":" + verse.verse,
                        description: verse.text,
                        footer: {
                            text: "LDS-Bot",
                            icon_url: bot.user.avatarURL
                        }
                    }
                });
            }
        } else if (randomMainBook === 1) {
            message.channel.send({
                embed: {
                    color: userColorPreference,
                    title: book.book + " " + chapter.chapter + ":" + verse.verse,
                    description: verse.text,
                    footer: {
                        text: "LDS-Bot",
                        icon_url: bot.user.avatarURL
                    }
                }
            });
        } else if (randomMainBook === 2) {
            message.channel.send({
                embed: {
                    color: userColorPreference,
                    title: "D&C " + chapter.section + ":" + verse.verse,
                    description: verse.text,
                    footer: {
                        text: "LDS-Bot",
                        icon_url: bot.user.avatarURL
                    }
                }
            });
        }
    },
};