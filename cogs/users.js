module.exports = {
    name: 'users',
    description: 'number of users',
    execute(message, args, bot) {
    	if (message.author.id == 221285118608801802) {
            var userColorPreference = 0xf2a93b;
        } else {
            var userColorPreference = 0x086587;
        }
		message.channel.send({
		    embed: {
		        color: userColorPreference,
		        title: "lds users",
		        description: "The number of users spanning accross all servers LDS-Bot is currently on has reached a concurrent " + `${bot.users.size}`
		    }
		});
    },
};