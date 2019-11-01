const Discord = require('discord.js');
const bot = new Discord.Client();
const prefix = "lds";
const bom = require("./book-of-mormon.json");
const dc = require("./doctrine-and-covenants.json");
const pgp = require("./pearl-of-great-price.json");

const parseJsonAsync = (jsonString) => {
  return new Promise(resolve => {
      resolve(JSON.parse(jsonString))
  })
}


//console.log(bom.books[0].chapters[0].verses[0].reference);

bot.on("ready",  () => {
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

    //if (!message.content.startsWith(prefix)) return;
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
        for(var i = 0; i < message_array.length - 1; i++) {
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
                citations.push([name, chapter, verse_first, verse_last])
            }

        }
    }

	for (var citation of citations) {
            var books = bom.books[bom_books[citation[0]]];
	    var chapter = books.chapters[citation[1] - 1];
	    if (citation[2] == citation[3]) { // one verse
	        var verse = chapter.verses[citation[2] - 1];
	        message.channel.send("**" + citation[0] + " " + citation[1] + ":" + citation[2] + "**\n```html\n" + "<" + citation[2] + "> " + verse.text + "\n```");
	    }
	    else { // multiple verses
	        var verse = "";
	        for (var v = citation[2] - 1; v < citation[3]; v++) {
	            verse += "<" + (v + 1) + "> " + chapter.verses[v].text + " ";
	        }
	        message.channel.send("**" + citation[0] + " " + citation[1] + ":" + verse_first + "-" + verse_last + "**\n\n```html\n" + verse + "\n```");
	    }
	    
	}

    switch(command.trim()){
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
