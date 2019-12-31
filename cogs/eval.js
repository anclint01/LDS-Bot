module.exports = {
    name: 'eval',
    description: 'eval stuff',
    execute(message, args, bot) {

        function clean(text) {
            if (typeof(text) === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            } else {
                return text;
            }
        }
        const prefix = "lds ";
        var contents = message.content.slice(prefix.length) + " ~";
        const command = contents.substring(0, contents.indexOf(" ")).trim();
        var additions = contents.slice(contents.indexOf(" ")).split("~");
        const argument = additions.shift();
        additions.map(function(value, key, mapObj) {
            mapObj[key] = value.trim();
        });
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
    },
};