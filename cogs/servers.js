module.exports = {
    name: 'servers',
    description: 'Number of servers',
    execute(message, args, bot) {
        if (message.author.id == 221285118608801802) {
            var userColorPreference = 0xf2a93b;
        } else {
            var userColorPreference = 0x086587;
        }
	    message.channel.send({
	        embed: {
	            color: userColorPreference,
	            title: "lds servers",
	            description: "LDS-Bot has reached a total of **" + `${bot.guilds.size}` + "** servers"
	        }
	    });
    },
};