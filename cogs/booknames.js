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
    name: 'booknames',
    description: 'Provides book names',
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
        var keys = [Object.keys(bom_books), Object.keys(pgp_books)];
        var names = [];
        for (key of keys) {
            for (var i = 0; i < key.length; i++) {
                names.push(key[i].replace(/_/g, " "));
            }
        }
        let pgp_names = names.slice(14, 22).toString();
        let bom_names = names.slice(0, 13).toString();
        let nephiFixedBomNames = bom_names.replace("Nephi", "1 Nephi,2 Nephi,3 Nephi, 4 Nephi");
        let book_pages = [{
                color: userColorPreference,
                title: "Book of Mormon Names:",
                author: {
                    name: "1 of 3"
                },
                description: nephiFixedBomNames.replace(/,/g, "\n"),
                fields: [{
                    name: "FYI: ",
                    value: "For more info use ``lds bookinfo <bookname>``",
                    inline: true
                }],
                footer: {
                    text: "LDS-Bot",
                    icon_url: bot.user.avatarURL
                }
            },
            {
                color: userColorPreference,
                title: "Pearl of Great Price Names:",
                author: {
                    name: "2 of 3"
                },
                description: pgp_names.replace(/,/g, "\n"),
                fields: [{
                    name: "FYI: ",
                    value: "For more info use ``lds bookinfo <bookname>``",
                    inline: true
                }],
                footer: {
                    text: "LDS-Bot",
                    icon_url: bot.user.avatarURL
                }
            },
            {
                color: userColorPreference,
                title: "D&C:",
                author: {
                    name: "3 of 3"
                },
                description: "D&C, is a book itself, it does not have any books within it, only chapters.",
                fields: [{
                    name: "FYI: ",
                    value: "For more info use ``lds bookinfo D&C``",
                    inline: true
                }],
                footer: {
                    text: "LDS-Bot",
                    icon_url: bot.user.avatarURL
                }
            }
        ]
        embed_page({
            embed: book_pages[0]
        }, book_pages);
    },
};