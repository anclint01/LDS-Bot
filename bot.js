const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();
const prefix = "lds ";
const http = require('http');
const bom = require("./book-of-mormon.json");
const dc = require("./doctrine-and-covenants.json");
const pgp = require("./pearl-of-great-price.json");
const start = new Date();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./cogs').filter(file => file.endsWith('.js'));
// yeet
for (const file of commandFiles) {
    const command = require(`./cogs/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    bot.commands.set(command.name, command);
}
bot.on("ready", () => {
    console.log("ready");

    bot.user.setStatus('available');
    bot.user.setPresence({
        game: {
            name: `v2.0.0 | lds help`,
            type: 1
        }
    });
});

function getRanges (array) {
    for (var ranges = [], rend, i = 0; i < array.length;) {
        ranges.push ((rend = array[i]) + ((function (rstart) {
            while (++rend === array[++i]);
            return --rend === rstart;
        })(rend) ? '' : '-' + rend)); 
    }
    return ranges;
}

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
    message_array = message_array.filter(item => item);
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
                    let findReference = (name_result == "D&C" ? i + 1 : i + 1 + (name_construction.length == 1 ? 0 : 1) * 2);
                    let location = message_array[findReference];
                    for (var a = findReference + 1; a < 9999; a++) {
                        if (!message_array[a]) break;
                        if (message_array[a].includes(",") || message_array[a+1] == "," || message_array[a-1].includes(",")) {
                            if (message_array[a] == ",") continue;
                            if (!isNaN(message_array[a].replace(/,/g, ""))) {
                                location = location + "," + message_array[a].replace(/,/g, "");
                            } else continue;
                        } else break;
                    } 
                    if (typeof location != undefined) {
                        var chapter = location.split(":")[0]; // 1
                        if (isNaN(chapter)) return; // No chapter number; exit the loop here
                        var verse_nums = location.split(":")[1]; // 8, 8-10, 8-10,12 or 8,10,12
                        console.log(chapter)
                        console.log(verse_nums)
                        if (verse_nums.indexOf(",") == -1) {
                            var end_verses = [];
                            if (verse_nums.indexOf("-") != -1) { // Contains -; is a range eg. 8-10
                                var verse_first = parseInt(verse_nums.split("-")[0]); // 8
                                if (isNaN(verse_first)) return; // No verse number; exit the loop here
                                end_verses.push(parseInt(verse_first))
                                var verse_last = parseInt(verse_nums.split("-")[1]); // 10
                                if (isNaN(verse_last)) return; // No last verse number; exit the loop here or just ignore and set to verse_first
                                end_verses.push(parseInt(verse_last))
                            } else { // Just a single verse; eg 8
                                var verse_first = parseInt(verse_nums); // 8
                                console.log(verse_first)
                                if (isNaN(verse_first)) return; // No verse number; exit the loop here
                                end_verses.push(parseInt(verse_first))
                            }
                        } else {
                            var verses = verse_nums.trim().split(",").map(item => item.trim());
                            var all_verses = [];
                            for (var x = 0; x < verses.length; x++){
                                if (verses[x].indexOf("-") == -1) all_verses.push(parseInt(verses[x]))
                                if (verses[x].indexOf("-") != -1) {
                                    var start = verses[x].split("-")[0];
                                    var end = verses[x].split("-")[1];
                                    if (start == end) {
                                        all_verses.push(parseInt(start)); 
                                        continue;
                                    }
                                    if (start > end) end = [start, start = end][0];
                                    for (var y = start; y <= end; y++) {
                                        all_verses.push(parseInt(y));
                                    } 
                                }                               
                            }
                            all_verses.map(function (x){return parseInt(x, 10)});
                            all_verses.sort(function(a, b){return a - b});
                            var end_verses = all_verses.filter(function(item, pos, self) {return self.indexOf(item) == pos})
                        }

                        if (verse_first > verse_last) verse_last = verse_first + (verse_first = verse_last) - verse_last;
                        if (typeof bom.books[bom_books[name]] != "undefined") {
                            if ("numbers" in bom.books[bom_books[name]]) {
                                // This book has multiples of the same name, so look for a number
                                if (i > 0) { // Book name isn't the first word in the message (which would mean no number given)
                                    let booknum = parseInt(message_array[i - 1]);
                                    if (isNaN(booknum)) return; // No book number; exit the loop here
                                    citations.push([bom, name_construction, parseInt(chapter), end_verses, booknum])
                                    // We can later check if the size of this array is 5 or 6. if 6, we know it's a book like nephi
                                }
                            } else citations.push([bom, name_result, chapter, end_verses])
                        } else {
                            if (name_result != "D&C") citations_pgp.push([pgp, name_result, parseInt(chapter), end_verses])
                            else citations_dc.push([dc, "D&C", parseInt(chapter), end_verses])
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
                    text: "LDS-Bot - NEW V2.0.0 IS LIVE! - Check Help Menu for details",
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
                    text: "LDS-Bot - NEW V2.0.0 IS LIVE! - Check Help Menu for details",
                    icon_url: bot.user.avatarURL
                }
            }
        });
    }

    var info = [citations_dc, citations, citations_pgp];
    for (var cites of info) {
        for (var citation of cites) {
            var books;
            citation[1] != "D&C" ? books = citation[0].books[(citation[0] == bom ? bom_books[citation[1]] : pgp_books[citation[1]])] : books = citation[0];
            if (citation.length == 4) { // Normal Book
                var chapter;
                citation[1] != "D&C" ? chapter = books.chapters[citation[2] - 1] : chapter = books.sections[citation[2] - 1];

                var chapter_length;
                citation[1] != "D&C" ? chapter_length = books.chapters.length : chapter_length = books.sections.length;

                if (citation[2] > chapter_length) {
                    LDSBot_Embed("Reference not found", "There are only **" + chapter_length + "** chapters in " + citation[1]);
                    return;
                }
            } else { // Length is 5; a book like Nephi
                try {
                    if (citation[4] <= 4 && citation[4] > 0) var chapter = books.numbers[citation[4] - 1].chapters[citation[2] - 1];
                    else return;
                } catch (error) { console.log(error); }
            }
            if (citation[3].length == 1) { // one verse
                if (chapter != undefined) {
                    if (citation[3][0] > chapter.verses.length) {
                        console.log("test")
                        LDSBot_Embed("Reference not found", "There are only **" + chapter.verses.length + "** verses in " + citation[1] + " Chapter **" + citation[2] + "**");
                        return;
                    }
                    var verse = chapter.verses[citation[3][0] - 1];
                } else return;
                if (verse != undefined) {
                    if (verse.text != undefined) {
                        if (citation.length == 5) LDSBot_Embed(citation[4] + " " + citation[1] + " " + citation[2] + ":" + citation[3][0], "**" + citation[3][0] + "** " + verse.text);
                        else LDSBot_Embed(citation[1].replace(/_/g, " ") + " " + citation[2] + ":" + citation[3][0], "**" + citation[3][0] + "** " + verse.text);
                    } else return;
                } else return;
            } else { // multiple verses
                let page_array = [];
                if (chapter != undefined) {
                    if (citation[3][0] > chapter.verses.length) {
                        LDSBot_Embed("Reference(s) not found", "There are only **" + chapter.verses.length + "** verses in " + citation[1] + " Chapter **" + citation[2] + "**");
                        return;
                    }
                    var next_message = "";
                    for (var v = 0; v < citation[3].length; v++) {
                        try {
                            if (citation[3][v] < chapter.verses.length) var new_message = next_message + "**" + (citation[3][v]) + "** " + chapter.verses[citation[3][v] - 1].text + "\n\n "
                            else var new_message = next_message + "❗ **" + citation[3][v] + " - This verse don't seem to exist in this book you badonka**" + "\n\n "
                            
                            if (new_message.length <= 2000) next_message = new_message;
                            else {
                                if (citation.length == 5) LDSBot_Embed_Push(page_array, citation[4] + " " + citation[1] + " " + citation[2] + ":" + getRanges(end_verses).join(', '), next_message);
                                else {
                                    LDSBot_Embed_Push(page_array, citation[1].replace(/_/g, " ") + " " + citation[2] + ":" + getRanges(end_verses).join(', '), next_message);
                                }
                                next_message = "**" + citation[3][v] + "** " + chapter.verses[citation[3][v] - 1].text + "\n\n ";
                            }
                        } catch (error) { console.log(error); return; }
                    }
                    if (next_message.length != 0 && next_message != undefined) {
                        if (citation.length == 5) LDSBot_Embed_Push(page_array, citation[4] + " " + citation[1] + " " + citation[2] + ":" + getRanges(end_verses).join(', '), next_message);
                        else LDSBot_Embed_Push(page_array, citation[1].replace(/_/g, " ") + " " + citation[2] + ":" + getRanges(end_verses).join(', '), next_message);
                    }
                    if (page_array.length == 1) message.channel.send(page_array[0]);
                    else embed_page(page_array[0], page_array)
                } else return;
            }
        }
    }
});
bot.login(process.env.BOT_TOKEN);
