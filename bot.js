const Discord = require('discord.js');
const bot = new Discord.Client();
const prefix = "lds";
const bom = require("./book-of-mormon.json");
const dc = require("./doctrine-and-covenants.json");
const pgp = require("./pearl-of-great-price.json");

function clean(text) {
    if (typeof(text) === "string") {
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
}

bot.on("ready", () => {
    console.log("ready");
});

bot.on("message", message => {

    let bom_books = {
        "Nephi": 0,
        "Jacob": 1,
        "Enos": 2,
        "Jarom": 3,
        "Omni": 4,
        "Words-of-Mormon": 5,
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
        "Joseph-Smith—Matthew": 2,
        "Joseph-Smith-History": 3,
        "Articles-Of-Faith": 4,
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

    for (let name in bom_books) {
        for (var i = 0; i < message_array.length - 1; i++) {
            if (message_array[i].toLowerCase() == name.toLowerCase()) {
                var location = message_array[i + 1]; // Should be something like 1:8 or 1:8-10
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
                //console.log(bom.books[bom_books[name]])
                if ("numbers" in bom.books[bom_books[name]]) {
                    // This book has multiples of the same name, so look for a number
                    if (i > 0) { // Book name isn't the first word in the message (which would mean no number given)
                        var booknum = parseInt(message_array[i - 1]);
                        if (isNaN(booknum)) return; // No book number; exit the function here
                        citations.push([name, chapter, verse_first, verse_last, booknum])
                        // We can later check if the size of this array is 4 or 5. if 5, we know it's a book like nephi
                    }
                } else {
                    citations.push([name, chapter, verse_first, verse_last])
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
            if (citation[4] <= 4 && citation[4] > 0) {
                var chapter = books.numbers[citation[4] - 1].chapters[citation[1] - 1];
            } else {
                return;
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
                    if(citation.length == 5){
                    	message.channel.send({embed: {
			    color: 0x086587,
			    title: citation[4] + " " + citation[0] + " " + citation[1] + ":" + citation[2],
			    description: citation[2] + " " + verse.text
			  }
			});
                    } else {
                    	message.channel.send({embed: {
			    color: 0x086587,
			    title: citation[0] + " " + citation[1] + ":" + citation[2],
			    description: citation[2] + " " + verse.text
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
            if (chapter != undefined) {
                var verse = "";
                for (var v = citation[2] - 1; v < citation[3]; v++) {
                	try {
                    	verse += (v + 1) + " " + chapter.verses[v].text + "\n\n ";
                    } catch (error) {
                    	console.log(error);
                    	return;
                    }
                }
            } else {
                return;
            }
            if (verse != undefined) {
                if (citation.length == 5){
                	message.channel.send({embed: {
			    color: 0x086587,
			    title: citation[4] + " " + citation[0] + " " + citation[1] + ":" + verse_first + "-" + verse_last,
			    description: verse
			  }
			});
                } else {
                	message.channel.send({embed: {
			    color: 0x086587,
			    title: citation[0] + " " + citation[1] + ":" + verse_first + "-" + verse_last,
			    description: verse
			  }
			});
                }
            } else {
                return;
            }
        }
    }

    var name_dc = "D&C";
    var message_array_dc = message.content.split(" ");

    var citations_dc = [];
    for (var i = 0; i < message_array_dc.length - 1; i++) {
        if (message_array_dc[i].toLowerCase() == name_dc.toLowerCase()) {
            var location_dc = message_array_dc[i + 1]; // Should be something like 1:8 or 1:8-10
            var chapter_dc = parseInt(location_dc.split(":")[0]); // 1
           
	    if (isNaN(chapter_dc)) return; // No chapter number; exit the function here

            var verse_nums_dc = location_dc.split(":")[1]; // 8 or 8-10
            if (verse_nums_dc.indexOf("-") != -1) { // Contains -; is a range eg. 8-10
                var verse_first_dc = parseInt(verse_nums_dc.split("-")[0]); // 8
                if (isNaN(verse_first_dc)) return; // No verse number; exit the function here

                var verse_last_dc = parseInt(verse_nums_dc.split("-")[1]); // 10
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
    for (var citation_dc of citations_dc) {
    	var chapter_dc = dc.sections[citation_dc[1] - 1];
        if (citation_dc[2] == citation_dc[3]) { // one verse
            if (chapter_dc != undefined) {
                var verse_dc = chapter_dc.verses[citation_dc[2] - 1];
                console.log(verse_dc)
            } else {
                return;
            }
            if (verse_dc != undefined) {
                if (verse_dc.text != undefined) {
                    message.channel.send({embed: {
	                color: 0x086587,
	                title: citation_dc[0] + " " + citation_dc[1] + ":" + citation_dc[2],
	                description: citation_dc[2] + " " + verse_dc.text
	              }
	            });
                } else {
                    return;
                }
            } else {
                return;
            }
        } else { // multiple verses
            if (chapter_dc != undefined) {
                var verse_dc = "";
                for (var v = citation_dc[2] - 1; v < citation_dc[3]; v++) {
                	try {
                    	verse_dc += (v + 1) + " " + chapter_dc.verses[v].text + "\n\n ";
                    } catch (error) {
                    	console.log(error);
                    	return;
                    }
                }
            } else {
                return;
            }
            if (verse_dc != undefined) {
               	message.channel.send({embed: {
	            color: 0x086587,
	            title: citation_dc[0] + " " + citation_dc[1] + ":" + verse_first_dc + "-" + verse_last_dc,
	            description: verse_dc
	          }
	        });
            } else {
                return;
            }
        }
    }	

    switch (command.trim()) {
        case "eval":
            console.log("test");
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
    }


})
bot.login(process.env.BOT_TOKEN);
