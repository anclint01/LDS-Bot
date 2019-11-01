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
				console.log(citation[0]);
		console.log(citation[1]);
		console.log(citation[2]);
		console.log(citation[3]);
		var books = bom.books[bom_books[citation[0]]];
		console.log(books);
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


/*    var message_array1 = message.content.split(" ");
    
    var citations1 = [];
    
    for (let name in pgp_books) {
        for(var i = 0; i < message_array1.length - 1; i++) {
            if (message_array1[i].toLowerCase() == name.toLowerCase()) {
            	console.log("test");
                var location1 = message_array1[i + 1]; // Should be something like 1:8 or 1:8-10
                var chapter1 = parseInt(location1.split(":")[0]); // 1
                if (isNaN(chapter1)) return; // No chapter number; exit the function here

                var verse_nums1 = location1.split(":")[1]; // 8 or 8-10
                if (verse_nums1.indexOf("-") != -1) { // Contains -; is a range eg. 8-10
                    var verse_first1 = parseInt(verse_nums1.split("-")[0]); // 8
                    if (isNaN(verse_first1)) return; // No verse number; exit the function here
                    
                    var verse_last1 = parseInt(verse_nums1.split("-")[1]); // 10
                    if (isNaN(verse_last1)) return; // No last verse number; exit the function here or just ignore and set to verse_first
                } else { // Just a single verse; eg 8
                    var verse_first1 = parseInt(verse_nums1); // 8
                    if (isNaN(verse_first1)) return; // No verse number; exit the function here
                    var verse_last1 = verse_first1; // 8
                }
                citations1.push([name, chapter1, verse_first1, verse_last1])
                console.log("test1");
            }

        }
    }

	for (var citation1 of citations1) {
		console.log(citation1[0]);
		console.log(citation1[1]);
		console.log(citation1[2]);
		console.log(citation1[3]);
		var books1 = pgp.books[pgp_books[citation1[0]]];
	    var chapter1 = pgp.chapters[citation1[1]];
	    if (citation1[2] == citation1[3]) { // one verse
	        var verse1 = chapter1.verses[citation1[2]];
	        message.channel.send("**" + citation1[0] + " " + citation1[1] + ":" + citation1[2] + "**\n```html\n" + "<" + citation1[2] + "> " + verse1.text + "\n```");
	    }
	    else { // multiple verses
	        var verse1 = "";
	        for (var v = citation1[2] - 1; v < citation1[3]; v++) {
	            verse1 += "<" + (v + 1) + "> " + chapter1.verses[v].text + " ";
	        }
	        message.channel.send("**" + citation1[0] + " " + citation1[1] + ":" + verse_first1 + "-" + verse_last1 + "**\n\n```html\n" + verse1 + "\n```");
	    }
	    
	}
*/
	

	//message.channel.send("**" + bom.books[1].book + " " + bom.books[1].chapters[parseInt(args[0]) - 1].chapter + ":" + bom.books[1].chapters[parseInt(args[0]) - 1].verses[parseInt(args[1]) -1].verse + "**\n")
    //message.channel.send("```" + bom.books[1].chapters[parseInt(args[0]) - 1].verses[parseInt(args[1]) - 1].text + "```");

    //console.log(typeof randomVarName);
/*  var books = bom.books[bom_books[randomVarName]];
    var chapter = books.chapters[parseInt(args[0]) - 1];
    var verse = chapter.verses[parseInt(args[1]) - 1];
    if(message.content.startsWith(bom_books[randomVarName])){
        console.log("test");
        message.channel.send("**" + books.book + " " + chapter.chapter + ":" + verse.verse + "**\n")
        message.channel.send("```" + verse.text + "```");
    }
            var books = bom.books[bom_books[randomVarName]];
        message.channel.send("**" + books.book + " " + books.chapters[parseInt(args[0]) - 1].chapter + ":" + books.chapters[parseInt(args[0]) - 1].verses[parseInt(args[1]) -1].verse + "**\n")
        message.channel.send("```" + books.chapters[parseInt(args[0]) - 1].verses[parseInt(args[1]) - 1].text + "```");
    //console.log(message.content.startsWith(bom_books[randomVarName]));
    console.log(bom_books[randomVarName]);
    console.log(randomVarName in bom_books)
    if(randomVarName in bom_books){

    }*/
    //console.log("bom_books[randomVarName]: " + bom_books[randomVarName]);
    //console.log("bom.books[bom_books[randomVarName]].book: " + bom.books[bom_books[randomVarName]].book);
    //console.log("parseInt(args[0]) - 1: " + (parseInt(args[0]) - 1));
    
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
bot.login("NjM5MjcxNzcyODE4MTEyNTY0.Xby5Zg.uvswEMTcR9_oJJb6hSoiJvD7cMM");
//bot.login("NDUzODQwNTE0MDIyODk5NzEy.XVU7og.g0P2Pi3P3Nos_1zIDZhEI8NUhYE");
