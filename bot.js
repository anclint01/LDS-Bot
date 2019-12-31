const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();
const prefix = "lds ";
const http = require('http');
const bom = require("./book-of-mormon.json");
const dc = require("./doctrine-and-covenants.json");
const pgp = require("./pearl-of-great-price.json");
const start = new Date();

bot.on("ready", () => {
    console.log("ready");

    bot.user.setStatus('available');
    bot.user.setPresence({
        game: {
            name: `"lds help"`,
            type: 2
        }
    });
});

bot.on("message", message => {

    if (message.author.id == process.env.SOMEBODYS_ID) {
        var userColorPreference = 0xf2a93b;
    } else {
        var userColorPreference = 0x086587;
    }

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
    let dc_book = {
        "d&c": 0
    }
    if (message.author.bot) return;
	
    let message_array = message.content.split(" ");
    let citations = [];
    let citations_pgp = [];
    let citations_dc = [];
    let name_result = "";

    for (let books of [bom_books, pgp_books, dc_book]) {
        for (let name in books) {
            for (let i = 0; i < message_array.length - 1; i++) {
                let name_construction = name.split("_");
                if (message_array[i].toLowerCase() == name_construction[0].toLowerCase()) {
                    if (message_array[i - 2] && message_array[i - 1]) {
                        if (name_construction.toString() == "Mormon") {
                            if (message_array[i - 2].toLowerCase() == "words" && message_array[i - 1].toLowerCase() == "of") continue;
                        }
                    }
                    if (name_construction[2]) {
                        if (message_array[i + 2]) {
                            if (name_construction[2].toLowerCase() != message_array[i + 2].toLowerCase()) continue;
                        }
                    }
                    if (name_construction[1] && name_construction[2]) {
                        if (name_construction[1].toLowerCase() != message_array[i + 1].toLowerCase()) continue;
                        name_result = `${name_construction[0]}` + '_' + `${name_construction[1]}`;

                        if (message_array[i + 2]) {
                            if (name_construction[2].toLowerCase() == message_array[i + 2].toLowerCase()) {
                                name_result += '_' + `${name_construction[2]}`;
                            }
                        }
                    } else name_result = name_construction.toString();

                    if (name_result == "d&c") {
                        var location = message_array[i + 1];
                    } else var location = message_array[i + 1 + (name_construction.length == 1 ? 0 : 1) * 2];

                    if (typeof location != undefined) {
                        var chapter = parseInt(location.split(":")[0]); // 1
                        if (isNaN(chapter)) return; // No chapter number; exit the function here
                        var verse_nums = location.split(":")[1]; // 8 or 8-10:oki

                        if (verse_nums.indexOf("-") != -1) { // Contains -; is a range eg. 8-10
                            var verse_first = parseInt(verse_nums.split("-")[0]); // 8
                            if (isNaN(verse_first)) return; // No verse number; exit the function here

                            var verse_last = parseInt(verse_nums.split("-")[1]); // 10
                            if (isNaN(verse_last)) return; // No last verse number; exit the function here or just ignore and set to verse_first
                        } else { // Just a single verse; eg 8
                            var verse_first = parseInt(verse_nums); // 8
                            if (isNaN(verse_first)) return; // No verse number; exit the function here
                            var verse_last = verse_first; // 8
                        }

                        if (verse_first > verse_last) verse_last = verse_first + (verse_first = verse_last) - verse_last;
                        if (typeof bom.books[bom_books[name]] != "undefined") {
                            if ("numbers" in bom.books[bom_books[name]]) {
                                // This book has multiples of the same name, so look for a number
                                if (i > 0) { // Book name isn't the first word in the message (which would mean no number given)
                                    let booknum = parseInt(message_array[i - 1]);
                                    if (isNaN(booknum)) return; // No book number; exit the function here
                                    citations.push([bom, name_construction, chapter, verse_first, verse_last, booknum])
                                    // We can later check if the size of this array is 4 or 5. if 5, we know it's a book like nephi
                                }
                            } else citations.push([bom, name_result, chapter, verse_first, verse_last])
                        } else {
                            if (name_result != "d&c") citations_pgp.push([pgp, name_result, chapter, verse_first, verse_last])
                            else citations_dc.push([dc, "d&c", chapter, verse_first, verse_last])
                        }
                    }
                }
            }
        }
    }

    function LDSBot_Embed(title, description) {
        message.channel.send({
            embed: {
                color: userColorPreference,
                title: title,
                description: description,
                footer: {
                    text: "LDS-Bot",
                    icon_url: bot.user.avatarURL
                }
            }
        });
    }

    function LDSBot_Embed_Push(array, title, description) {
        array.push({
            embed: {
                color: userColorPreference,
                title: title,
                description: description,
                footer: {
                    text: "LDS-Bot",
                    icon_url: bot.user.avatarURL
                }
            }
        });
    }

    var info = [citations_dc, citations, citations_pgp];
    for (var cites of info) {
        for (var citation of cites) {
            var books;
            citation[1] != "d&c" ? books = citation[0].books[(citation[0] == bom ? bom_books[citation[1]] : pgp_books[citation[1]])] : books = citation[0];
            if (citation.length == 5) { // Normal Book
                var chapter;
                citation[1] != "d&c" ? chapter = books.chapters[citation[2] - 1] : chapter = books.sections[citation[2] - 1];

                var chapter_length;
                citation[1] != "d&c" ? chapter_length = books.chapters.length : chapter_length = books.sections.length;

                if (citation[2] > chapter_length) {
                    LDSBot_Embed("Reference not found", "There are only **" + chapter_length + "** chapters in " + citation[1]);
                    return;
                }
            } else { // Length is 5; a book like Nephi
                try {
                    if (citation[5] <= 4 && citation[5] > 0) var chapter = books.numbers[citation[5] - 1].chapters[citation[2] - 1];
                    else return;
                } catch (error) console.log(error);
            }

            if (citation[3] == citation[4]) { // one verse
                if (chapter != undefined) {
                    if (citation[3] > chapter.verses.length) {
                        LDSBot_Embed("Reference not found", "There are only **" + chapter.verses.length + "** verses in " + citation[1] + " Chapter **" + citation[2] + "**");
                        return;
                    }
                    var verse = chapter.verses[citation[3] - 1];
                } else return;
                if (verse != undefined) {
                    if (verse.text != undefined) {
                        if (citation.length == 6) LDSBot_Embed(citation[4] + " " + citation[1] + " " + citation[2] + ":" + citation[3], "**" + citation[3] + "** " + verse.text);
                        else LDSBot_Embed(citation[1].replace(/_/g, " ") + " " + citation[2] + ":" + citation[3], "**" + citation[3] + "** " + verse.text);
                    } else return;
                } else return;
            } else { // multiple verses
                let page_array = [];
                if (chapter != undefined) {
                    if (citation[3] > chapter.verses.length) {
                        LDSBot_Embed("Reference not found", "**" + "There are only **" + chapter.verses.length + "** verses in " + citation[1] + " Chapter **" + citation[2] + "**");
                        return;
                    }
                    var next_message = "";
                    for (var v = citation[3] - 1; v < citation[4]; v++) {
                        try {
                            var new_message = next_message + "**" + (v + 1) + "** " + chapter.verses[v].text + "\n\n "
                            if (new_message.length <= 2000) next_message = new_message;
                            else {
                                if (citation.length == 6) LDSBot_Embed_Push(page_array, citation[5] + " " + citation[1] + " " + citation[2] + ":" + verse_first + "-" + verse_last, next_message);
                                else {
                                    LDSBot_Embed_Push(page_array, citation[1].replace(/_/g, " ") + " " + citation[2] + ":" + verse_first + "-" + verse_last, next_message);
                                    next_message = "**" + (v + 1) + "** " + chapter.verses[v].text + "\n\n ";
                                }
                            }
                        } catch (error) console.log(error);
                        return;
                    }
                    if (next_message.length != 0 && next_message != undefined) {
                        if (citation.length == 6) LDSBot_Embed_Push(page_array, citation[5] + " " + citation[1] + " " + citation[2] + ":" + verse_first + "-" + verse_last, next_message);
                        else LDSBot_Embed_Push(page_array, citation[1].replace(/_/g, " ") + " " + citation[2] + ":" + verse_first + "-" + verse_last, next_message);
                    }
                    if (page_array.length == 1) message.channel.send({
                        embed: page_array[0]
                    });
                    else embed_page({
                        embed: page_array[0]
                    }, page_array)
                } else return;
            }
        }
    }
});
bot.login(process.env.BOT_TOKEN);
