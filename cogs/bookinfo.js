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
    name: 'bookinfo',
    description: 'Info on book',
    execute(message, args, bot) {
        let page = 1;
        function embed_page(inital_embed, edited_embeds) {
            message.channel.send(inital_embed).then(sentEmbed => {
                sentEmbed.react("⬅").then(r => {
                    sentEmbed.react('➡');
                });

                const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && !user.bot;
                const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && !user.bot;

                const backwards = sentEmbed.createReactionCollector(backwardsFilter, {
                    timer: 1200000
                });
                const forwards = sentEmbed.createReactionCollector(forwardsFilter, {
                    timer: 120000
                });
                backwards.on('collect', r => {
                    if (page === 1) {
                        page = edited_embeds.length;
                        sentEmbed.edit({
                            embed: edited_embeds[page - 1]
                        });
                    } else {
                        page--;
                        sentEmbed.edit({
                            embed: edited_embeds[page - 1]
                        });
                    }
                    r.remove(r.users.filter(u => !u.bot).first());
                })
                forwards.on('collect', r => {
                    console.log(edited_embeds.length)
                    if (page >= 1) {
                        if (page === edited_embeds.length) {
                            page = 1;
                            sentEmbed.edit({
                                embed: edited_embeds[page - 1]
                            });
                        } else {
                            page++;
                            if (typeof edited_embeds != 'undefined') {
                                sentEmbed.edit({
                                    embed: edited_embeds[page - 1]
                                });
                            }
                        }
                    }
                    r.remove(r.users.filter(u => !u.bot).first());
                })

            });
        }
        if (message.author.id == 221285118608801802) {
            var userColorPreference = 0xf2a93b;
        } else {
            var userColorPreference = 0x086587;
        }
        console.log(bot)
        console.log(bot.user)
        var numbersForNephi = args[0]
        var requestedBook = args.join(" ");
        var totalVerses = 0;
        var chapterLength;
        var fixedRequestedBook = requestedBook.replace(/ /g, "_").toLowerCase();
        var fulltitle;
        var bookName;
        if (numbersForNephi === "1" || numbersForNephi === "2" || numbersForNephi === "3" || numbersForNephi === "4") {
            var nephi = bom.books[0].numbers[numbersForNephi - 1].number;
        }
        for (let name in bom_books) {
            if (name.toLowerCase() === fixedRequestedBook.toLowerCase() || name.toLowerCase() === fixedRequestedBook.slice(2) && typeof nephi != "undefined") {
                if (fixedRequestedBook.slice(2) != "nephi") {
                    bookName = name.replace(/_/g, " ");
                    chapterLength = bom.books[bom_books[name]].chapters.length;
                    fulltitle = bom.books[bom_books[name]].full_title;
                } else {
                    bookName = nephi + " " + name.replace(/_/g, " ");
                    chapterLength = bom.books[bom_books[name]].numbers[nephi - 1].chapters.length;
                    fulltitle = bom.books[bom_books[name]].numbers[nephi - 1].full_title;
                }
                for (i = 0; i < chapterLength; i++) {
                    if (fixedRequestedBook.slice(2) != "nephi") totalVerses += bom.books[bom_books[name]].chapters[i].verses.length;
                    else totalVerses += bom.books[bom_books[name]].numbers[nephi - 1].chapters[i].verses.length;
                }
                message.channel.send({
                    embed: {
                        color: userColorPreference,
                        title: "Book Info for " + bookName,
                        fields: [{
                                name: "Full Title",
                                value: fulltitle,
                                inline: true
                            },
                            {
                                name: "# of Chapters",
                                value: chapterLength,
                                inline: true
                            },
                            {
                                name: "Total Verses",
                                value: totalVerses,
                                inline: true
                            },
                            {
                                name: "Book Contained In",
                                value: "The Book of Mormon",
                                inline: true
                            },
                            {
                                name: "More",
                                value: "To get a list of all chapters with their verse count for a specific book use: ``lds chapters <bookname>``",
                                inline: true
                            }
                        ],
                        footer: {
                            text: "LDS-Bot",
                            icon_url: bot.user.avatarURL
                        }
                    }
                });
                totalVerses = 0;
            }
        }
        for (let name in pgp_books) {
            if (name.toLowerCase() === fixedRequestedBook.toLowerCase()) {
                chapterLength = pgp.books[pgp_books[name]].chapters.length
                for (i = 0; i < chapterLength; i++) {
                    totalVerses += pgp.books[pgp_books[name]].chapters[i].verses.length;
                }
                message.channel.send({
                    embed: {
                        color: userColorPreference,
                        title: "Book Info for " + name.replace(/_/g, " "),
                        fields: [{
                                name: "Full Title",
                                value: pgp.books[pgp_books[name]].full_title,
                                inline: true
                            },
                            {
                                name: "# of Chapters:",
                                value: pgp.books[pgp_books[name]].chapters.length,
                                inline: true
                            },
                            {
                                name: "Total Verses",
                                value: totalVerses,
                                inline: true
                            },
                            {
                                name: "Book Contained In:",
                                value: "The Pearl of Great Price",
                                inline: true
                            },
                            {
                                name: "More:",
                                value: "To get a list of all chapters with their verse count for a specific book go: ``lds chapters <bookname>``",
                                inline: true
                            }
                        ],
                        footer: {
                            text: "LDS-Bot",
                            icon_url: bot.user.avatarURL
                        }
                    }
                });
                totalVerses = 0;
            }
        }
        if (fixedRequestedBook.toLowerCase() === "d&c") {
            chapterLength = dc.sections.length
            for (i = 0; i < chapterLength; i++) {
                totalVerses += dc.sections[i].verses.length;
            }
            message.channel.send({
                embed: {
                    color: userColorPreference,
                    title: "Book Info for " + "D&C",
                    fields: [{
                            name: "Full Title",
                            value: "The Doctrine and Covenants",
                            inline: true
                        },
                        {
                            name: "# of Chapters:",
                            value: chapterLength,
                            inline: true
                        },
                        {
                            name: "Total Verses",
                            value: totalVerses,
                            inline: true
                        },
                        {
                            name: "More:",
                            value: "To get a list of all chapters with their verse count for a specific book go: ``lds chapters <bookname>``",
                            inline: true
                        }
                    ],
                    footer: {
                        text: "LDS-Bot",
                        icon_url: bot.user.avatarURL
                    }
                }
            });
            totalVerses = 0;
        }
    },
};