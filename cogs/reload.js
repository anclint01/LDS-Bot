module.exports = {
    name: 'reload',
    description: 'Reloads a command',
    args: true,
    execute(message, args, bot) {
        if(!args || args.length < 1) return message.reply("Hey guess what. Yeah, you guessed right (I hope you did anyway) I can't fr*ggin reload a command if you don't give me one to reload.");
        const commandName = args[0];
        // Check if the command exists and is valid
        if(!bot.commands.has(commandName)) {
          return message.reply("That command does not exist");
        }
        // the path is relative to the *current folder*, so just ./filename.js
        delete require.cache[require.resolve(`./${commandName}.js`)];
        // We also need to delete and reload the command from the bot.commands Enmap
        bot.commands.delete(commandName);
        const props = require(`./${commandName}.js`);
        bot.commands.set(commandName, props);
        message.reply(`**${commandName}** has been reloaded`);
    },
};