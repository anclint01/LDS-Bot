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
    name: 'chapters',
    description: 'Provides number of verses for each chapter in the book requested',
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
        var numbersForNephi1 = args[0]
        var requestedBook1 = args.join(" ");
        var fixedRequestedBook1 = requestedBook1.replace(/ /g, "_").toLowerCase();
        var bookName1;
        var chapterVerses = "";
        if (numbersForNephi1 === "1" || numbersForNephi1 === "2" || numbersForNephi1 === "3" || numbersForNephi1 === "4") {
            var nephi1 = bom.books[0].numbers[numbersForNephi1 - 1].number;
        }
        for (let name in bom_books) {
            if (name.toLowerCase() === fixedRequestedBook1 || name.toLowerCase() === fixedRequestedBook1.slice(2) && typeof nephi1 != "undefined") {
                if (fixedRequestedBook1.slice(2) != "nephi") {
                    bookName1 = name.replace(/_/g, " ");
                    chapterLength1 = bom.books[bom_books[name]].chapters.length;
                } else {
                    bookName1 = nephi1 + " " + name.replace(/_/g, " ");
                    chapterLength1 = bom.books[bom_books[name]].numbers[nephi1 - 1].chapters.length;
                }
                for (i = 0; i < chapterLength1; i++) {
                    if (fixedRequestedBook1.slice(2) != "nephi") chapterVerses += "Chapter " + bom.books[bom_books[name]].chapters[i].chapter + " - " + bom.books[bom_books[name]].chapters[i].verses.length + " verses" + "\n"
                    else chapterVerses += "Chapter " + bom.books[bom_books[name]].numbers[nephi1 - 1].chapters[i].chapter + " - " + bom.books[bom_books[name]].numbers[nephi1 - 1].chapters[i].verses.length + " verses" + "\n"
                }
                message.channel.send({
                    embed: {
                        color: userColorPreference,
                        title: "Chapters in " + bookName1,
                        description: chapterVerses.toString().replace(/,/g, "\n"),
                        footer: {
                            text: "LDS-Bot",
                            icon_url: bot.user.avatarURL
                        }
                    }
                });
            }
            chapterVerses = "";
        }
        for (let name in pgp_books) {
            if (name.toLowerCase() === fixedRequestedBook1) {
                chapterLength1 = pgp.books[pgp_books[name]].chapters.length;
                for (i = 0; i < chapterLength1; i++) {
                    chapterVerses += "Chapter " + pgp.books[pgp_books[name]].chapters[i].chapter + " - " + pgp.books[pgp_books[name]].chapters[i].verses.length + " verses" + "\n";
                }
                message.channel.send({
                    embed: {
                        color: userColorPreference,
                        title: "Chapters in " + name.replace(/_/g, " "),
                        description: chapterVerses,
                        footer: {
                            text: "LDS-Bot",
                            icon_url: bot.user.avatarURL
                        }
                    }
                });
            }
            chapterVerses = "";
        }
        if (fixedRequestedBook1 === "d&c") {
            var moreChapterVerses = "";
            chapterLength1 = dc.sections.length;
            for (i = 0; i < chapterLength1; i++) {
                if (chapterVerses.length >= 2000) {
                    moreChapterVerses += "Chapter " + dc.sections[i].section + " - " + dc.sections[i].verses.length + " verses" + "\n";
                } else {
                    chapterVerses += "Chapter " + dc.sections[i].section + " - " + dc.sections[i].verses.length + " verses" + "\n";
                }
            }
            let pages = [{
                    color: userColorPreference,
                    title: "Chapters in " + "D&C",
                    description: chapterVerses,
                    footer: {
                        text: "LDS-Bot",
                        icon_url: bot.user.avatarURL
                    }
                },
                {
                    color: userColorPreference,
                    title: "Chapters in " + "D&C",
                    description: moreChapterVerses,
                    footer: {
                        text: "LDS-Bot",
                        icon_url: bot.user.avatarURL
                    }
                }
            ];
            embed_page({
                embed: pages[0]
            }, pages);
            chapterVerses = "";
        }
    },
};