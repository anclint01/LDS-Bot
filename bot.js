const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();
const prefix = "lds ";
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

function clean(text) {
    if (typeof(text) === "string") {
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
}

bot.on("message", message => {

    if (message.author.id == 221285118608801802) {
        var userColorPreference = 0xf2a93b;
    } else {
        var userColorPreference = 0x086587;
    }

    function get_line(filename, line_no1, line_no2, callback) {
        var data = fs.readFileSync(filename, 'utf8');
        var lines = data.split("\n");
        if (line_no2 > lines.length) {
            throw new Error('File end reached without finding line');
        }

        let pttrn = /^\s*/;
        let indentation_removal = [];
        let total_lines = [];
        let indentation_length;
        let indentation_amount = []
        let final_lines = [];
        for (var i = line_no1; i <= line_no2; i++) {
            let line_holder = "";
            line_holder += lines[i];
            indentation_length = (line_holder.match(pttrn)[0].length);
            total_lines.push(line_holder);
            indentation_amount.push(indentation_length);
        }
        let min = Math.min(...indentation_amount);
        for (var i = 0; i < total_lines.length; i++) {
            let holder = "";
            holder += total_lines[i];
            indentation_length = (holder.match(pttrn)[0].length);
            if (indentation_length < min) {
                holder = holder.substring(holder.length)
                final_lines.push(holder)
            } else {
                holder = holder.substring(min);
                final_lines.push(holder);
            }
        }
        callback(null, final_lines);
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

    if (message.author.bot) return;
    var contents = message.content.slice(prefix.length) + " ~";
    const command = contents.substring(0, contents.indexOf(" ")).trim();
    var additions = contents.slice(contents.indexOf(" ")).split("~");
    const argument = additions.shift();
    additions.map(function(value, key, mapObj) {
        mapObj[key] = value.trim();
    });
    const args = message.content.split(' ');
    const randomVarName = args.shift();

    var message_array = message.content.split(" ");

    var citations = [];

    var name_result = "";
    var words = "words";
    var Of = "of";
    for (let name in bom_books) {
        for (var i = 0; i < message_array.length - 1; i++) {
            var name_construction = name.split("_");
            if (message_array[i].toLowerCase() == name_construction[0].toLowerCase()) {
                if (typeof message_array[i - 2] != "undefined" && typeof message_array[i - 1] != "undefined") {
                    if (name_construction.toString() == "Mormon") {
                        if (message_array[i - 2].toLowerCase() == words.toLowerCase() && message_array[i - 1].toLowerCase() == Of.toLowerCase()) {
                            continue;
                        }
                    }
                }
                if (typeof name_construction[1] != 'undefined' && typeof name_construction[2] != 'undefined') {
                    if (name_construction[1].toLowerCase() == message_array[i + 1].toLowerCase()) {
                        name_result = `${name_construction[0]}` + '_' + `${name_construction[1]}`;
                        if (typeof message_array[i + 2] != "undefined") {
                            if (name_construction[2].toLowerCase() == message_array[i + 2].toLowerCase()) {
                                name_result += '_' + `${name_construction[2]}`;
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                } else {
                    name_result = name_construction.toString();
                }
                if (name_construction.length == 1) {
                    var location = message_array[i + 1]; // Should be something like 1:8 or 1:8-10
                } else {
                    var location = message_array[i + 3]; // Should be something like 1:8 or 1:8-10
                }
                if (typeof location != "undefined") {
                    var chapter = parseInt(location.split(":")[0]); // 1
                    if (isNaN(chapter)) return; // No chapter number; exit the function here
                    var verse_nums = location.split(":")[1]; // 8 or 8-10

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

                    if (verse_first > verse_last) {
                        verse_last = verse_first + (verse_first = verse_last) - verse_last;
                    }
                    if ("numbers" in bom.books[bom_books[name]]) {
                        // This book has multiples of the same name, so look for a number
                        if (i > 0) { // Book name isn't the first word in the message (which would mean no number given)
                            var booknum = parseInt(message_array[i - 1]);
                            if (isNaN(booknum)) return; // No book number; exit the function here
                            citations.push([name_construction, chapter, verse_first, verse_last, booknum])
                            // We can later check if the size of this array is 4 or 5. if 5, we know it's a book like nephi
                        }
                    } else {
                        citations.push([name_result, chapter, verse_first, verse_last])
                    }
                }
            }
        }
    }

    for (var citation of citations) {
        var books = bom.books[bom_books[citation[0]]];
        if (citation.length == 4) {
            // Normal Book
            var chapter = books.chapters[citation[1] - 1];
        } else {
            // Length is 5; a book like Nephi
            try {
                if (citation[4] <= 4 && citation[4] > 0) {
                    var chapter = books.numbers[citation[4] - 1].chapters[citation[1] - 1];
                } else {
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (citation[2] == citation[3]) { // one verse
            if (chapter != undefined) {
                var verse = chapter.verses[citation[2] - 1];
            } else {
                return;
            }
            if (verse != undefined) {
                if (verse.text != undefined) {
                    if (citation.length == 5) {
                        message.channel.send({
                            embed: {
                                color: userColorPreference,
                                title: citation[4] + " " + citation[0] + " " + citation[1] + ":" + citation[2],
                                description: "**" + citation[2] + "** " + verse.text,
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
                                title: citation[0] + " " + citation[1] + ":" + citation[2],
                                description: "**" + citation[2] + "** " + verse.text,
                                footer: {
                                    text: "LDS-Bot",
                                    icon_url: bot.user.avatarURL
                                }
                            }
                        });
                    }
                } else {
                    return;
                }
            } else {
                return;
            }
        } else { // multiple verses
            let page_array_bom = [];
            if (chapter != undefined) {
                var next_message = "";
                for (var v = citation[2] - 1; v < citation[3]; v++) {
                    try {
                        var new_message = next_message + "**" + (v + 1) + "** " + chapter.verses[v].text + "\n\n "
                        if (new_message.length <= 2000) {
                            next_message = new_message;
                        } else {
                            if (citation.length == 5) {
                                page_array_bom.push({
                                    color: userColorPreference,
                                    title: citation[4] + " " + citation[0] + " " + citation[1] + ":" + verse_first + "-" + verse_last,
                                    description: next_message,
                                    footer: {
                                        text: "LDS-Bot",
                                        icon_url: bot.user.avatarURL
                                    }
                                });

                            } else {
                                page_array_bom.push({
                                    color: userColorPreference,
                                    title: citation[0)] + " " + citation[1] + ":" + verse_first + "-" + verse_last,
                                    description: next_message,
                                    footer: {
                                        text: "LDS-Bot",
                                        icon_url: bot.user.avatarURL
                                    }
                                });
                            }
                            next_message = "**" + (v + 1) + "** " + chapter.verses[v].text + "\n\n ";
                        }
                    } catch (error) {
                        console.log(error);
                        return;
                    }
                }
                if (next_message.length != 0 && next_message != undefined) {
                    if (citation.length == 5) {
                        page_array_bom.push({
                            color: userColorPreference,
                            title: citation[4] + " " + citation[0] + " " + citation[1] + ":" + verse_first + "-" + verse_last,
                            description: next_message,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        });
                    } else {
                        page_array_bom.push({
                            color: userColorPreference,
                            title: citation[0] + " " + citation[1] + ":" + verse_first + "-" + verse_last,
                            description: next_message,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        });
                    }
                }
                embed_page({
                    embed: page_array_bom[0]
                }, page_array_bom)
            } else {
                return;
            }

        }
    }

    // Yes some likely unnecessary duplicate code haha, I'll get to it eventually ¯\_(ツ)_/¯

    var name_dc = "D&C";
    var message_array_dc = message.content.split(" ");

    var citations_dc = [];
    for (var i = 0; i < message_array_dc.length - 1; i++) {
        if (message_array_dc[i].toLowerCase() == name_dc.toLowerCase()) {
            var location_dc = message_array_dc[i + 1]; // Should be something like 1:8 or 1:8-10

            if (typeof location_dc != "undefined") {
                var chapter_dc = parseInt(location_dc.split(":")[0]); // 1
                if (isNaN(chapter_dc)) return; // No chapter number; exit the function here

                var verse_nums_dc = location_dc.split(":")[1]; // 8 or 8-10


                if (verse_nums_dc.indexOf("-") != -1) { // Contains -; is a range eg. 8-10
                    var verse_first_dc = parseInt(verse_nums_dc.split("-")[0]); // 8
                    console.log(verse_first_dc);
                    if (isNaN(verse_first_dc)) return; // No verse number; exit the function here

                    var verse_last_dc = parseInt(verse_nums_dc.split("-")[1]); // 10
                    console.log(verse_last_dc);
                    if (isNaN(verse_last_dc)) return; // No last verse number; exit the function here or just ignore and set to verse_first
                } else { // Just a single verse; eg 8
                    var verse_first_dc = parseInt(verse_nums_dc); // 8
                    if (isNaN(verse_first_dc)) return; // No verse number; exit the function here
                    var verse_last_dc = verse_first_dc; // 8
                }
                if (verse_first_dc > verse_last_dc) {
                    verse_last_dc = verse_first_dc + (verse_first_dc = verse_last_dc) - verse_last_dc;
                }
                citations_dc.push([name_dc, chapter_dc, verse_first_dc, verse_last_dc])
            }
        }
    }

    for (var citation_dc of citations_dc) {
        var chapter_dc = dc.sections[citation_dc[1] - 1];
        if (citation_dc[2] == citation_dc[3]) { // one verse
            if (chapter_dc != undefined) {
                var verse_dc = chapter_dc.verses[citation_dc[2] - 1];
            } else {
                return;
            }
            if (verse_dc != undefined) {
                if (verse_dc.text != undefined) {
                    message.channel.send({
                        embed: {
                            color: userColorPreference,
                            title: citation_dc[0] + " " + citation_dc[1] + ":" + citation_dc[2],
                            description: "**" + citation_dc[2] + "** " + verse_dc.text,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        }
                    });
                } else {
                    return;
                }
            } else {
                return;
            }
        } else { // multiple verses
            let page_array_dc = [];
            var next_message_dc = "";
            if (chapter_dc != undefined) {
                var next_message_dc = "";
                for (var v = citation_dc[2] - 1; v < citation_dc[3]; v++) {
                    try {
                        var new_message_dc = next_message_dc + "**" + (v + 1) + "** " + chapter_dc.verses[v].text + "\n\n "
                        if (new_message_dc.length <= 2000) {
                            next_message_dc = new_message_dc;
                        } else {
                            if (citation_dc.length == 5) {
                                page_array_dc.push({
                                    color: userColorPreference,
                                    title: citation_dc[4] + " " + citation_dc[0] + " " + citation_dc[1] + ":" + verse_first_dc + "-" + verse_last_dc,
                                    description: next_message_dc,
                                    footer: {
                                        text: "LDS-Bot",
                                        icon_url: bot.user.avatarURL
                                    }
                                });
                            } else {
                                page_array_dc.push({
                                    color: userColorPreference,
                                    title: citation_dc[0] + " " + citation_dc[1] + ":" + verse_first_dc + "-" + verse_last_dc,
                                    description: next_message_dc,
                                    footer: {
                                        text: "LDS-Bot",
                                        icon_url: bot.user.avatarURL
                                    }
                                });
                            }
                            next_message_dc = "**" + (v + 1) + "** " + chapter_dc.verses[v].text + "\n\n ";
                        }
                    } catch (error) {
                        console.log(error);
                        return;
                    }
                }
                if (next_message_dc.length != 0 && next_message_dc != undefined) {
                    if (citation_dc.length == 5) {
                        page_array_dc.push({
                            color: userColorPreference,
                            title: citation_dc[4] + " " + citation_dc[0] + " " + citation_dc[1] + ":" + verse_first_dc + "-" + verse_last_dc,
                            description: next_message_dc,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        });
                    } else {
                        page_array_dc.push({
                            color: userColorPreference,
                            title: citation_dc[0] + " " + citation_dc[1] + ":" + verse_first_dc + "-" + verse_last_dc,
                            description: next_message_dc,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        });
                    }
                }
                embed_page({
                    embed: page_array_dc[0]
                }, page_array_dc);
            } else {
                return;
            }

        }
    }


    var message_array_pgp = message.content.split(" ");

    var citations_pgp = [];
    var name_result_pgp = "";
    for (let name in pgp_books) {
        for (var i = 0; i < message_array_pgp.length - 1; i++) {
            var name_construction_pgp = name.split("_");
            if (message_array_pgp[i].toLowerCase() == name_construction_pgp[0].toLowerCase()) {
                if (typeof name_construction_pgp[2] != 'undefined') {
                    if (typeof message_array_pgp[i + 2] != 'undefined') {
                        if (name_construction_pgp[2].toLowerCase() != message_array_pgp[i + 2].toLowerCase()) {
                            continue;
                        }
                    }
                }
                if (typeof name_construction_pgp[1] != 'undefined' && typeof name_construction_pgp[2] != 'undefined') {
                    if (name_construction_pgp[1] == message_array_pgp[i + 1].toLowerCase()) {
                        name_result_pgp = `${name_construction_pgp[0]}` + '_' + `${name_construction_pgp[1]}`;
                        if (typeof message_array_pgp[i + 2] != 'undefined') {
                            if (name_construction_pgp[2].toLowerCase() == message_array_pgp[i + 2].toLowerCase()) {
                                name_result_pgp += `${name_construction_pgp[2]}`;
                            }
                        }
                    }
                } else {
                    name_result_pgp = name_construction_pgp.toString();
                }
                if (name_construction_pgp.length == 1) {
                    var location_pgp = message_array_pgp[i + 1]; // Should be something like 1:8 or 1:8-10
                } else {
                    var location_pgp = message_array_pgp[i + 3]; // Should be something like 1:8 or 1:8-10
                }

                if (typeof location_pgp != "undefined") {
                    var chapter_pgp = parseInt(location_pgp.split(":")[0]); // 1

                    if (isNaN(chapter_pgp)) continue; // No chapter number; exit the function here

                    var verse_nums_pgp = location_pgp.split(":")[1]; // 8 or 8-10

                    if (typeof verse_nums_pgp === "undefined") {
                        continue;
                    }

                    if (verse_nums_pgp.indexOf("-") != -1) { // Contains -; is a range eg. 8-10
                        var verse_first_pgp = parseInt(verse_nums_pgp.split("-")[0]); // 8
                        if (isNaN(verse_first_pgp)) continue; // No verse number; exit the function here

                        var verse_last_pgp = parseInt(verse_nums_pgp.split("-")[1]); // 10
                        if (isNaN(verse_last_pgp)) continue; // No last verse number; exit the function here or just ignore and set to verse_first
                    } else { // Just a single verse; eg 8
                        var verse_first_pgp = parseInt(verse_nums_pgp); // 8
                        if (isNaN(verse_first_pgp)) continue; // No verse number; exit the function here
                        var verse_last_pgp = verse_first_pgp; // 8
                    }
                    if (verse_first_pgp > verse_last_pgp) {
                        verse_last_pgp = verse_first_pgp + (verse_first_pgp = verse_last_pgp) - verse_last_pgp;
                    }

                    citations_pgp.push([name, chapter_pgp, verse_first_pgp, verse_last_pgp])
                }
            }
        }
    }

    for (var citation_pgp of citations_pgp) {
        var books_pgp = pgp.books[pgp_books[citation_pgp[0]]];
        var chapter_pgp = books_pgp.chapters[citation_pgp[1] - 1];
        if (citation_pgp[2] == citation_pgp[3]) { // one verse
            if (chapter_pgp != undefined) {
                var verse_pgp = chapter_pgp.verses[citation_pgp[2] - 1];
            } else {
                return;
            }
            if (verse_pgp != undefined) {
                if (verse_pgp.text != undefined) {
                    message.channel.send({
                        embed: {
                            color: userColorPreference,
                            title: citation_pgp[0].replace(/_/g, " ") + " " + citation_pgp[1] + ":" + citation_pgp[2],
                            description: "**" + citation_pgp[2] + "** " + verse_pgp.text,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        }
                    });
                } else {
                    return;
                }
            } else {
                return;
            }
        } else { // multiple verses
            let page_array_pgp = [];
            if (chapter_pgp != undefined) {
                var next_message_pgp = "";
                for (var v = citation_pgp[2] - 1; v < citation_pgp[3]; v++) {
                    try {
                        var new_message = next_message_pgp + "**" + (v + 1) + "** " + chapter_pgp.verses[v].text + "\n\n "
                        if (new_message.length <= 2000) {
                            next_message_pgp = new_message;
                        } else {
                            if (citation_pgp.length == 5) {
                                page_array_pgp.push({
                                    color: userColorPreference,
                                    title: citation_pgp[4] + " " + citation_pgp[0].replace(/_/g, " ") + " " + citation_pgp[1] + ":" + verse_first_pgp + "-" + verse_last,
                                    description: next_message_pgp,
                                    footer: {
                                        text: "LDS-Bot",
                                        icon_url: bot.user.avatarURL
                                    }
                                });
                            } else {
                                page_array_pgp.push({
                                    color: userColorPreference,
                                    title: citation_pgp[0].replace(/_/g, " ") + " " + citation_pgp[1] + ":" + verse_first_pgp + "-" + verse_last,
                                    description: next_message_pgp,
                                    footer: {
                                        text: "LDS-Bot",
                                        icon_url: bot.user.avatarURL
                                    }
                                });
                            }
                            next_message_pgp = "**" + (v + 1) + "** " + chapter_pgp.verses[v].text + "\n\n ";
                        }
                    } catch (error) {
                        console.log(error);
                        return;
                    }
                }
                if (next_message_pgp.length != 0 && next_message_pgp != undefined) {
                    if (citation_pgp.length == 5) {
                        page_array_pgp.push({
                            color: userColorPreference,
                            title: citation_pgp[4] + " " + citation_pgp[0].replace(/_/g, " ") + " " + citation_pgp[1] + ":" + verse_first_pgp + "-" + verse_last,
                            description: next_message_pgp,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        });
                    } else {
                        page_array_pgp.push({
                            color: userColorPreference,
                            title: citation_pgp[0].replace(/_/g, " ") + " " + citation_pgp[1] + ":" + verse_first_pgp + "-" + verse_last,
                            description: next_message_pgp,
                            footer: {
                                text: "LDS-Bot",
                                icon_url: bot.user.avatarURL
                            }
                        });
                    }
                }
                embed_page({
                    embed: page_array_pgp[0]
                }, page_array_pgp);
            } else {
                return;
            }

        }
    }

    switch (command.trim()) {
        case "eval":
            if (message.author.id === "453840514022899712") {
                try {
                    var code = argument;
                    var evaled = eval(code);
                    if (typeof evaled === "Promise" && additions.indexOf("inspect") >= 0) {
                        evaled.then(
                            function() {
                                message.channel.sendCode("xl", evaled);
                                evaled = undefined;
                            }
                        ).err(console.error)
                        //evaled= eval("function(message){return "+code+";}").apply(this,[message]);
                    } else if (typeof evaled !== "string" && (evaled !== undefined)) {
                        if (additions.indexOf("inspect") >= 0) {
                            evaled = require("util").inspect(evaled);
                            message.channel.sendCode("xl", clean(evaled));
                        }
                    } else if (additions.indexOf("inspect") >= 0) {
                        message.channel.sendCode("xl", evaled);
                    }
                    if (additions.indexOf("fancy") >= 0) {
                        let URL = "https://images-ext-2.discordapp.net/eyJ1cmwiOiJodHRwOi8vd3d3Lm1hY2Vyb2JvdGljcy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMTYvMDIvZ2Vhci10b29scy5wbmcifQ.lc8Zq4vmjQ57Evm_VfbYnVpqdIw";
                        let embed = new Discord.RichEmbed();
                        embed.setColor("#0FF0FF");
                        embed.setThumbnail(URL);
                        embed.addField("Input", code);
                        embed.addField("Output", require("util").inspect(evaled));
                        message.channel.sendEmbed(embed).then(function() {
                            message.delete();
                        });
                    }
                    if (additions.indexOf("r") >= 0 && message) {
                        message.delete();
                    }
                } catch (err) {
                    message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
                    message.delete();
                }
            }
            break;
        case "invite":
            message.channel.send("https://discordapp.com/oauth2/authorize?permissions=93184&scope=bot&client_id=639271772818112564");
            break;
        case "randomverse":
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
            break;
        case "booknames":
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
            break;
        case "bookinfo":
            var numbersForNephi = args[1]
            var requestedBook = args.splice(1).join(" ");
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
            break;
        case "chapters":
            var numbersForNephi1 = args[1]
            var requestedBook1 = args.slice(1).join(" ");
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
            break;
        case "help":
            message.channel.send({
                embed: {
                    color: userColorPreference,
                    title: "LDS-Bot by anclint#9255",
                    fields: [{
                            name: "Commands",
                            value: "``lds invite`` - provides the invite link for LDS-Bot \n ``lds github`` - provides the link for LDS-Bot GitHub repository \n ``lds randomverse`` - provides a random verse \n ``lds booknames`` - provides list of book names \n ``lds bookinfo <bookname>`` - provides info on the book inputted \n ``lds chapters <bookname>`` - provides list of all chapters and number of verses per chapter for book inputted \n ``lds servers`` - shows number of servers LDS-Bot is in \n ``lds users`` - shows number of users across all servers LDS-Bot is on",
                            inline: false
                        },
                        {
                            name: "Links",
                            value: "Github: https://github.com/anclint01/LDS-Bot \n Invite: https://bit.ly/2KoBoPr",
                            inline: false
                        }
                    ],
                    footer: {
                        text: "LDS-Bot",
                        icon_url: bot.user.avatarURL
                    }
                }
            });
            break;
        case "servers":
            let servers = 0;
            bot.guilds.forEach((guild) => {
                servers++;
            });
            message.channel.send({
                embed: {
                    color: userColorPreference,
                    title: "lds servers",
                    description: "LDS-Bot has reached a total of **" + servers + "** servers"
                }
            });
            break;
        case "users":
            var users = 0;
            bot.users.forEach((user) => {
                users++;
            });
            message.channel.send({
                embed: {
                    color: userColorPreference,
                    title: "lds users",
                    description: "The number of users spanning accross all servers LDS-Bot is currently on has reached a concurrent " + users
                }
            });
            break;
        case "github":
            message.channel.send("https://github.com/anclint01/LDS-Bot");
            break;
    }

});
bot.login(process.env.BOT_TOKEN);
