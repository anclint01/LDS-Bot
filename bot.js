const Discord = require('discord.js');
const request = require('request');
const bot = new Discord.Client();
const start = new Date();
const prefix = "p!";
const notif = require('node-notifier');
const profanities = require('profanities');
const lower_case = require('lower-case');
//const config = require("./config.json");
bot.on('ready', () => {
    console.log('I am ready!');
});
bot.on("guildMemberAdd", member => {
    //if(message.guild.id != "210923273553313792"){
    let guild = member.guild;
    guild.defaultChannel.sendMessage(`Please welcome ${member.user} to the server!`);
    //}
});
bot.on("guildMemberRemove", member => {
    //if(message.guild.id != "210923273553313792"){
    let guild = member.guild;
    guild.defaultChannel.sendMessage(`${member.user} has left the server!`);
    //}
});
bot.on("guildBanAdd", (guild, user) => {
    guild.defaultChannel.sendMessage(`${user.username} was just banned.`);
});
bot.on("guildBanRemove", (guild, user) => {
    guild.defaultChannel.sendMessage(`${user.username} was just unbanned.`);
});
//let censor = "[Sorry, I Swear]";
bot.on('message', message => {
    //let edit = message.content.replace(lower_case(profanites), censor);
    //message.delete();
    //message.channel.send(`${message.author.username}: ${edit}`);
    for (x = 0; x < profanities.length; x++) {
        if (lower_case(message.content) == lower_case(profanities[x])) {
            console.log("test");
            message.channel.sendMessage("Excuse me! NO SWEARING IN MY CHRISTIAN MINECRAFT SERVER!!");
            message.delete();
        }
    }
    let responseObject = {
        "chocolate": "chocolate Is da best.",
        "wat": "Say what?",
        "lol": "rofl",
        "Yo wuz up?": "The ceiling",
        "Is anclint awesome?": "Totally",
        "hate": "hate = strong word",
        "smash": "is awesome",
        "arena?": "They probably aren't going to notice",
        "Arena?": "They probably aren't going to notice",
        "arena": "They probably aren't going to notice",
        "Arena": "They probably aren't going to notice",
        "vc": "What if they cant tho?",
        "This:": "Node.JS, which is basically Javascript.",
        "@everyone arena?": "They probably aren't going to notice",
        "@everyone Arena?": "They probably aren't going to notice",
        "@everyone arena": "They probably aren't going to notice",
        "@everyone Arena": "They probably aren't going to notice",
    };
    if (lower_case(responseObject[message.content])) {
        message.channel.sendMessage(responseObject[message.content]);
    }
    var res = 0;
    var results = "";
    res = Math.round(Math.random() * (2)) + 1;
    if (res === 1) {
        results = "scissors";
    } else if (res === 2) {
        results = "paper";
    } else if (res === 3) {
        results = "rock";
    }
    var contents = message.content.slice(prefix.length) + " ~";
    const command = contents.substring(0, contents.indexOf(" ")).trim();
    var additions = contents.slice(contents.indexOf(" ")).split("~");
    const argument = additions.shift();
    additions.map(function(value, key, mapObj) {
        mapObj[key] = value.trim();
    });
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    let args = message.content.split(" ").slice(1);
    var result = args.join(" ");
    let embed = new Discord.RichEmbed();
    let modRole;
    if (message.guild.id === "267048995711483904" || "516088503885496356") { //KTS
        modRole = message.guild.roles.find(x => x.name === "Moderator");
    } else if (message.guild.id === "219096380457746433") { //KAVM
        modRole = message.guild.roles.find(x => x.name === "Staff");
    } else if (message.guild.id === "222123485336567808") {
        modRole = message.guild.roles.find(x => x.name === "Admin")
    }


    //console.log(result);
    function clean(text) {
        if (typeof(text) === "string") {
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        } else {
            return text;
        }
    }


    let queue = {};
    switch (command.trim()) {
        case "chocolate":
            if (message.guild.id === "267048995711483904") {
                message.channel.sendMessage("CHOCOLATE IS THE ABSOLUTE BEST EVER (even if PS and TJ don't think so)");
            } else {
                message.channel.sendMessage("CHOCOLATE IS THE ABSOLUTE BEST EVER");
            }
            break;
        case "add":
            let numArray = args.map(n => parseFloat(n));
            let total = numArray.reduce((p, c) => p + c);

            message.channel.sendMessage(total);
            break;
        case "sub":
            let numArray1 = args.map(n => parseFloat(n));
            let total1 = numArray1.reduce((p, c) => p - c);

            message.channel.sendMessage(total1);
            break;
        case "times":
            let numArray2 = args.map(n => parseFloat(n));
            let total2 = numArray2.reduce((p, c) => p * c);

            message.channel.sendMessage(total2);
            break;
        case "divide":
            let numArray3 = args.map(n => parseFloat(n));
            let total3 = numArray3.reduce((p, c) => p / c);

            message.channel.sendMessage(total3);
            break;
        case "say":
            message.channel.sendMessage(args.join(" "));
            break;
        case "ping":
            message.channel.sendMessage("pong");
            break;
            //Moderator Commands Start
        case "prune":
            if (!message.member.roles.has(modRole.id)) {
                return message.reply("Unfortunately you do not have the necessary permissions to perform this action");
            }
            if (!message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) {
                return message.reply("I don't have the permission (MANAGE_MESSAGES) to do this.");
            }
            if (result > 2) {
                let messagecount = parseInt(result) + 1;
                message.channel.fetchMessages({
                    limit: messagecount
                }).then(messages => {
                    message.channel.bulkDelete(messages)
                });
                message.reply(`you have successfully deleted ${messagecount - 1} messages!`);
            } else {
                message.reply("You have to delete more than two messages");
            }
            break;
        case "kick":
            if (modRole && !message.member.roles.has(modRole.id)) {
                return message.reply("Unfortunately you do not have the necessary permissions to perform this action");
            }
            if (message.mentions.users.size === 0) {
                return message.reply("Please mention a user to kick");
            }
            let kickMember = message.guild.member(message.mentions.users.first());
            if (!kickMember) {
                return message.reply("That user does not seem valid");
            }
            if (!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) {
                return message.reply("I don't have the permission (KICK_MEMBERS) to do this.");
            }

            kickMember.kick().then(member => {
                message.reply(`${member.user.username} was successfully kicked`);
            });
            break;
        case "ban":
            if (!message.member.roles.has(modRole.id)) {
                return message.reply("Unfortunately you do not have the necessary permissions to perform this action");
            }
            if (message.mentions.users.size === 0) {
                return message.reply("Please mention a user to ban");
            }
            let banMember = message.guild.member(message.mentions.users.first());
            if (!banMember) {
                return message.reply("That user does not seem valid");
            }
            if (!message.guild.member(bot.user).hasPermission("BAN_MEMBERS")) {
                return message.reply("I don't have the permission (BAN_MEMBERS) to do this.");
            }
            banMember.ban().then(member => {
                message.reply(`${member.user.username} was successfully banned`);
            });
            break;
        case "poll":
            if (!message.member.roles.has(modRole.id)) {
                return message.reply("Unfortunately you do not have the necessary permissions to perform this action");
            }
            //const reactions = bot.emojis.find(emoji => emoji.name === "poop");
            embed = new Discord.RichEmbed()
                .setColor(0xffffff)
                .setFooter("React to vote")
                .setDescription(args.join(" "))
                .setTitle(`Poll created by ${message.author.username}`);
            message.channel.send(embed).then(function(message) {
                message.react(':yoshi:529897461368619028');
                message.react(':sonicracing:529897653404958721');
                message.react('pokemon:529897860397793301');
                message.react(':mortalkombat:529898927785377802');
                message.react(':marvelalliance:529899831158636556');
                message.react(':fireemblems:529897541584551956');
                message.react(':crashracing:529898140820832257');
                message.react(':animalcrossing:529898698113679425');
                //message.react("\:two:");
            }).catch(function() {
                message.channel.sendMessage(err);
            });



            message.delete({
                timeout: 1000
            });
            break;
            //Moderator Commands End  

        case "avatar":
            message.reply(message.author.avatarURL);
            break;
        case "myid":
            message.reply(`This is your ID: ${message.author.id}`);
            break;
        case "roll":
            var result = Math.floor((Math.random() * 6) + 1);
            message.reply("You rolled a: " + result);
            break;
        case "flip":
            var a = 2 * Math.random() + 1,
                b;
            b = 2 > a ? "The coin landed on: **heads**" : "The coin landed on: **tails**";
            message.reply(b);
            break;
        case "8ball":
            var sayings = ["It is certain", "It is decidedly so", "Without a doubt", "Yes, definitely", "You may rely on it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
            var result = Math.floor((Math.random() * sayings.length) + 0);
            message.reply(sayings[result]);
            break;
        case "fact":
            var sayings = ["I am anclints first attempt at a bot", "PS doesn't like chocolate, neither does TJ.", "anclint LOVES chocolate", "anclint plays minecraft.", "I have 600 lines of code", "The universe is big", "anclint is a doofus (following after blaze)", "Tomatoes are yuck", "Guinness Book of Records holds the record for being the book most often stolen from Public Libraries.", "Salt water takes 10 mins to drown you", "Bananas are radioactive", "Humans shed 40 pounds of skin in their lives", "Cockroaches Live 9 Days Without Their Heads", "Bolts of lightning can shoot out of an erupting volcano.", "A U.S. dollar bill can be folded approximately 4,000 times in the same place before it will tear.", "Earth has traveled more than 5,000 miles in the past 5 minutes.", "It would take a sloth one month to travel one mile.", "95% of people text things they could never say in person.", "A crocodile can’t poke its tongue out.", "It is physically impossible for pigs to look up into the sky."];
            var result = Math.floor((Math.random() * sayings.length) + 0);
            message.reply(sayings[result]);
            break;
        case "stats":
            message.channel.sendMessage(`Bot Stats:\n\n Users: ${bot.user} \nServers:  ${bot.servers}  \nChannels: ${bot.channels}`)
            break;
        case "uptime":
            let now = new Date()
            let upTime = now - start
            message.channel.sendMessage('This bot has been running for ' + (Math.floor(upTime / 3600000) % 24) + ' hours ' + (Math.floor(upTime / 60000) % 60) + ' minutes ' + (Math.floor(upTime / 1000) % 60) + ' seconds.')
            break;
        case "members":
            message.channel.sendMessage(`There are ${message.guild.memberCount} members on this server`);
            break;
        case "owner":
            message.channel.sendMessage(`${message.guild.owner} is the owner of this server`);
            break;
        case "":
            message.channel.sendMessage("Why u doing nothing?");
            break;
        case "invite":
            message.channel.sendMessage("Server Owners can invite CoolBot to their server by visiting this link: https://discordapp.com/oauth2/authorize?permissions=93184&scope=bot&client_id=303745211400454144");
            break;
        case "pose":
            message.channel.sendMessage("https://images.discordapp.net/.eJwNyMsNwyAMANBdGACHT-OSZSqLIIIUYoRd5VB19_Yd38e852k2c6gO2QD2JpnnbkV5Ui22Mtez0GhiM3cgVcpHL5cKeLekGEMMaUFcvUMEj-vjnxgSPmNMKTi4qWmZ8upkx1XN9wdz4CQN.eCVW1VZ_Uq78qxzmsQdHMR1VQ4Y?width=400&height=200");
            break;
        case "bacon":
            message.channel.sendMessage("Bacon is REALLY good nearly as good as chocolate :o :bacon:");
            break;
        case "serverinfo":
            embed.addField("Channel", message.channel + "(id: " + message.channel.id + ")", true);
            embed.addField("Owner", message.guild.owner + " (id: " + message.guild.owner.id + ")", true);
            embed.addField("Server", "**" + message.guild.name + "** (id: " + message.guild.id + ") (region: " + message.guild.region + ")", true);
            if (message.channel.topic) {
                embed.addField("Topic", message.channel.topic, true);
            }
            message.channel.sendEmbed(embed);
            break;
        case "getinfo":
            let user = message.author;
            if (message.guild.member(message.mentions.users.first())) {
                user = message.guild.member(message.mentions.users.first()).user;
            }
            let URL = user.avatarURL;
            embed.setColor("#a2c02c");
            embed.setThumbnail(URL);
            embed.addField("Requested user", user.username, true);
            embed.addField("ID", user.id, true);
            let presence = (message.author.id === user.id && user.presence.status === "offline") ? "invisible" : user.presence.status;
            embed.addField("Status", presence, true);
            embed.addField("Game", user.presence.game ? user.presence.game.name : "[No game playing]", true);
            message.channel.sendEmbed(embed);
            break;
        case "topic":
            if (!message.member.roles.has(modRole.id)) {
                return message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            }
            message.channel.setTopic(result).catch(console.error);
            message.channel.sendMessage("You successfully changed the topic.");
            break;
        case "setgame":
            if (!message.member.roles.has(modRole.id)) {
                message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            }
            bot.user.setGame(args.join(" "));
            break;
        case "dnd":
            if (!message.member.roles.has(modRole.id)) {
                message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            } else {
                bot.user.setStatus("dnd");
                message.channel.sendMessage(`You have successfully change the bot status to ${bot.user.presence.status}!`);
            }
            break;
        case "idle":
            if (!message.member.roles.has(modRole.id)) {
                message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            } else {
                bot.user.setStatus("idle");
                message.channel.sendMessage(`You have successfully change the bot status to ${bot.user.presence.status}!`);
            }
            break;
        case "online":
            if (!message.member.roles.has(modRole.id)) {
                message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            } else {
                bot.user.setStatus("online");
                message.channel.sendMessage(`You have successfully change the bot status to ${bot.user.presence.status}!`);
            }
            break;
        case "invisible":
            if (!message.member.roles.has(modRole.id)) {
                message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            } else {
                bot.user.setStatus("invisible");
                message.channel.sendMessage(`You have successfully change the bot status to ${bot.user.presence.status}!`);
            }
            break;
        case "botowner":
            message.channel.sendMessage("I was made by this awesome user: <@256159545087361025>")
            break;
        case "getmembers":
            embed.setTitle("List of Users (joinedTimestamp)");
            let t = 0;
            let concat = "";
            let totals = 0;
            let array = [];
            let collection = message.guild.members;
            collection.forEach(function(key, id) {
                var timeSTamper = new Date(key.joinedTimestamp).toUTCString();
                array.push([key, timeSTamper, key.joinedTimestamp]);
            });
            array.sort(function(a, b) {
                return a[2] - b[2];
            });
            array.map(function(key, id) {
                if (embed.fields.length < 24 && (t + 1) % 15 === 0) {
                    embed.addField("Group " + (Math.floor(t / 15) + 1) + " (" + (t - totals) + ")", concat, true);
                    concat = "";
                    totals = t;
                }
                concat += ("" + array[id][0] + " (" + array[id][1] + ")\n");
                t++;

            });
            embed.addField("Group " + (Math.floor(t / 15) + 1) + " (" + (t - totals) + ")", concat);
            message.channel.sendEmbed(embed);
            break;
        case "disable":
            disabled = true;
            console.log(disabled);
            message.channel.sendMessage("Disabled");
            break;
        case "createrole":
            if (!message.member.roles.has(modRole.id)) {
                message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            } else {
                message.guild.createRole({
                        name: result
                    })
                    .then(role => message.channel.sendMessage(`Created role ${role}`))
                    .catch(console.error);
            }
            break;
        case "defaultchannel":
            message.channel.sendMessage("The default channel for this server is " + message.guild.defaultChannel)
            break;
        case "exit":
            if (message.author.id === "256159545087361025") {
                process.exit(0);
            } else {
                message.channel.sendMessage("Are you kidding! Why would I listen to you!!!");
            }
            break;
        case "eval":
            if (message.author.id === "256159545087361025") {
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
                    message.channel.sendMessage(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
                    message.delete();
                }
            }
            break;
        case "botguilds":
            bot.guilds.map(g => g.name).join("\n");
            break;
        case "botchannels":
            bot.channels.map(g => g.name).join("\n");
            break;
        case "rock":
            if (res === 2) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("You got Rekt boi");
            } else if (res === 1) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("I'm triggered right now");
            } else if (res === 3) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("Draw");
            }
            break;
        case "paper":
            if (res === 1) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("You got Rekt boi");
            } else if (res === 3) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("I'm triggered right now");
            } else if (res === 2) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("Draw");
            }
            break;
        case "scissors":
            if (res === 3) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("You got Rekt boi");
            } else if (res === 2) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("I'm triggered right now");
            } else if (res === 1) {
                message.channel.sendMessage("I got " + results);
                message.channel.sendMessage("Draw");
            }
            break;
        case "setusername":
            if (!message.member.roles.has(modRole.id)) {
                return message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            }
            bot.user.setUsername(result).then(user => {
                message.reply('✔ Username set!');
            }).catch((err) => {
                message.channel.sendMessage("Unable to set username. You may have tried a username that to many people already have.")
            })

            break;
        case "setavatar":
            if (!message.member.roles.has(modRole.id)) {
                return message.reply("Unfortunately you do not have the necessary permissions to perform this action.");
            }
            bot.user.setAvatar(result);
            message.channel.sendMessage("You successfully changed the the bots avatar.");
            break;
        case "help":
            embed.setColor("#a2c02c");
            embed.addField("General", "help - Show a list of all commands.\nping - Returns pong.\nsay [message] - Returns message.")
            embed.addField("Math", "add <number> <number2> - Adds numbers.\nsub <number> <number2> - Subtracts numbers.\ndivide <number> <number2> - Divides numbers.\ntimes <number] <number2> - Times numbers.")
            embed.addField("User", "avatar - Returns your current avatar.\nmyid - Returns your ID.\ngetinfo <user#id> - Returns your or someone elses info.\nmembers - Returns the amount of members on the server.\nowner - Returns the owners username.\npoints - Returns the amount of points you have.\nlevel - Returns your level.")
            embed.addField("Random", "roll - Returns random number between 1-6.\nflip - Returns head or tails.\n8ball - Returns random fortune.\nrock/paper/scissors - Self explanatory.\nbacon - Returns fun message about bacon.\nchocolate - Returns fun message about chocolate.")
            embed.addField("Data", "serverinfo - Returns info about the server.\nuptime - Returns the time the bot has been up.\ninvite - Returns an invite for this bot.\ngetmembers - Returns list of all the members in the server.\ndefaultchannel - Returns the default channel of the server.")
            embed.addField("Moderator Commands", "ban <user#id> - Bans user.\nkick <user> - Kicks user.\nprune <number> - Deletes messages.\ntopic - Sets channel topic.\ncreaterole <name> - Creates role.");
            embed.addField("Bot Owner Commands", "exit - Shuts down the bot.\neval - Returns cool stuff.")
            message.author.sendEmbed(embed);
            message.reply("You got a message in PM");
            switch (args[0]) {
                case "add":
                    let embed2 = new Discord.RichEmbed();
                    embed2.setColor("#a2c02c");
                    embed2.addField("add", 'Use **`cb!add <number> <number2>`** to add them together.');
                    message.channel.sendEmbed(embed2);
                    break;
            }
            break;
        default:
            message.channel.sendMessage("Bro, the help command is there for a reason.");
            break;
    }
    //var lostsayings = ["You got Rekt boi","Mwhaha you lost","LOSER!!","You'll just lose again next time.","Why do you keep trying? You will just lose!","You should ask the 8ball if you will win, I bet it will say your a loser at this game.","I'm getting bored of winning, though I still don't wnat you to win.","The outlook good that you won't win.","Yes, I won. shocking isn't it?","Why, you lose so much?","Maybe next time :grin:","You keeping coming back, and you keep losing. An occasional win but...","YOU KEEP LOSING!!!!!!","I'm starting to feel sympathy for you, wait nevermind.","I could cheat really easily, but I won't I guess the fates just favor me more then you."];
    //var wonsayings = [":sob: you won..","I'm humiliated","NO!!!!!!!!!!","Stop winning","STOP PLEASE!","I don't like losing :(","Please have mercy","Why?!?!?!?!","What a cruel, cruel world!",":sob:","Maybe next time... :cry:","So, sad","I KEEP LOSING!!!!!!","I feel sorry for myself","This sucks"];
});
bot.login("NTI5ODY5OTAzMDc5OTMxOTI0.Dw3Hlw._fBhuzuncoV33yzx7HDLcItWUms");
//bot.login(process.env.BOT_TOKEN);

