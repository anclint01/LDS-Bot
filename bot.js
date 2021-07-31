const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();
const bom = require("./book-of-mormon.json");
const dc = require("./doctrine-and-covenants.json");
const pgp = require("./pearl-of-great-price.json");
const config = require("./config.json");

bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./cogs').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./cogs/${file}`);
  bot.commands.set(command.name, command);
}

bot.on("ready", () => {
  console.log("ready");

  bot.user.setPresence({ activity: { name: 'v3.0.0 | lds help' }, status: 'online' })
  .then(console.log)
  .catch(console.error);
});

async function embed_page(message, inital_embed, edited_embeds) {
  let page = 1;
  let sentEmbed = await message.channel.send("\u200E", inital_embed);
  await sentEmbed.react("⬅️");
  await sentEmbed.react('➡️');

  const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅️' && !user.bot;
  const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡️' && !user.bot;

  const backwards = sentEmbed.createReactionCollector(backwardsFilter, {timer: 1200000});
  const forwards = sentEmbed.createReactionCollector(forwardsFilter, {timer: 120000});
  backwards.on('collect', async (r) => {
    if (page === 1) {
      page = edited_embeds.length;
      await sentEmbed.edit("\u200E", edited_embeds[page - 1]);
    } else {
      page--;
      await sentEmbed.edit("\u200E", edited_embeds[page - 1]);
    }
    try {
      await r.users.remove(r.users.cache.filter(u => !u.bot).first())
    } catch (error) {
      console.log(error)
    }
  })
  forwards.on('collect', async (r) => {
    if (page >= 1) {
      if (page === edited_embeds.length) {
        page = 1;
        await sentEmbed.edit("\u200E", edited_embeds[page - 1]);
      } else {
        page++;
        if (typeof edited_embeds != 'undefined') {
          await sentEmbed.edit("\u200E", edited_embeds[page - 1]);
        }
      }
    }
    try {
      await r.users.remove(r.users.cache.filter(u => !u.bot).first())
    } catch (error) {
      console.log(error)
    }
  })
}

function LDSBot_Embed_Push(array, title, description) {
  array.push({
    embed: {
      color: 0x086587,
      title: title,
      description: description,
      footer: {
        text: "LDS-Bot",
        icon_url: bot.user.avatarURL()
      }
    }
  });
}

bot.on("message", message => {
  if (message.channel.type != "text") return;
  if (message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  let content = message.content.replace(/\s/g, "");
  let r = /([1-4])?([a-z&]+)(\d+)(?::(\d+))(-(\d+)?((\d+))?)?/ig
  let matches = [...content.matchAll(r)];

  for (let i = 0; i < matches.length; i++) {
    let number   = (typeof matches[i][1] != "undefined") ? matches[i][1] : "nothing",
        name     = matches[i][2], 
        chapter  = matches[i][3], 
        verse    = matches[i][4], 
        endverse = "nothing",
        obj = config.books.filter((el) => el.name.toLowerCase() === name.toLowerCase())[0]; 
  
    if (!config.book_names.includes(name.toLowerCase())) return;
    if (typeof matches[i][5] == "string" && matches[i][5].startsWith("-")) endverse = matches[i][6];
    let from = obj.from, book = (from == "bom" ? bom : (from == "pgp" ? pgp : dc));
    if (!book) return;
    let bks; 
  
    if (number == "nothing") {
      bks = (from != "d&c" ? book.books[obj.idx] : dc);
    } else {
      if (name == "nephi") bks = book.books[obj.idx].numbers[parseInt(number)-1];
      else bks = (from != "bom" ? book.books[obj.idx] : dc);
    }   
    let presentable_name = config.presentable_book_names[config.book_names.indexOf(name.toLowerCase())]      
    if (from == "d&c") {
      if (!bks || !bks.sections) return;
      if (chapter > bks.sections.length) return message.channel.send("\u200E", { embed: { color: 0x086587, title: "Reference not found", description: "There are only **" + bks.sections.length + "** Chapters in " + presentable_name, footer: {text: "LDS-Bot", icon_url: bot.user.avatarURL()}}})
    } else {
      if (!bks || !bks.chapters) return;
      if (chapter > bks.chapters.length) return message.channel.send("\u200E", { embed: { color: 0x086587, title: "Reference not found", description: "There are only **" + bks.chapters.length + "** Chapters in " + presentable_name, footer: {text: "LDS-Bot", icon_url: bot.user.avatarURL()}}})
    }

    let c = (from != "d&c" ? bks.chapters[parseInt(chapter)-1] : bks.sections[parseInt(chapter)-1]);
     
    let v, d = "";
    let page_array = [];
    if (endverse != "nothing") {
      for (let x = parseInt(verse)-1; x < parseInt(endverse); x++) { 
        if (x+1 <= c.verses.length) var new_message = d + "**" + c.verses[x].verse + "** " + c.verses[x].text + "\n\n";
        else var new_message = d + "? **" + (x+1) + " - This verse doesn't seem to exist**\n\n"
       
        if (new_message.length <= 2000) d = new_message;
        else {
          LDSBot_Embed_Push(page_array, presentable_name + " " + chapter + ":" + verse + (endverse != "nothing" ? "-" + endverse: ""), d);
          d = "**" + c.verses[x].verse + "** " + c.verses[x].text + "\n\n";
        }
      }
    } else {
      if (!c.verses[parseInt(verse)-1]) return message.channel.send("\u200E", {embed:{color: 0x086587, title: "Reference not found", description: "There are only **" + c.verses.length + "** verses in " + presentable_name + " Chapter **" + chapter + "**", footer: {text: "LDS-Bot", icon_url: bot.user.avatarURL()}}});
      v = c.verses[parseInt(verse)-1], d = "**" + v.verse + "** " + v.text;
    }
    if (d.length > 0) LDSBot_Embed_Push(page_array, presentable_name + " " + chapter + ":" + verse + (endverse != "nothing" ? "-" + endverse: ""), d);
    if (page_array.length == 1) message.channel.send("\u200E", page_array[0]);
    else embed_page(message, page_array[0], page_array)
  }	
  
  if (!message.content.startsWith(config.prefix)) return;
  if (!bot.commands.has(command) && !bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command))) return;

  let cmd = bot.commands.get(command) || bot.commands.find(cmmd => cmmd.aliases && cmmd.aliases.includes(command));
  cmd.execute(message, args, bot);
});

bot.login(config.token);
