import { Message } from 'discord.js'
import BaseCommand from '../../../command'
import { getClient } from '../../../other/func'

const client = getClient();
class Command extends BaseCommand {
  constructor () {
    super ("titlepage", "other_book_content", "Sends testimonies of the Book of Mormon")
  }
  execute (message: Message, args: string[]) {
    message.channel.send({ content: "‎‎‎",
    embeds: [{
        title: "Translated by Joseph Smith, Jun.",
        author: {
          name: "The Book of Mormon Title Page:"
        }, 
        description: "Wherefore, it is an abridgment of the record of the people of Nephi, and also of the Lamanites—Written to the Lamanites, who are a remnant of the house of Israel; and also to Jew and Gentile—Written by way of commandment, and also by the spirit of prophecy and of revelation—Written and sealed up, and hid up unto the Lord, that they might not be destroyed—To come forth by the gift and power of God unto the interpretation thereof—Sealed by the hand of Moroni, and hid up unto the Lord, to come forth in due time by way of the Gentile—The interpretation thereof by the gift of God. \n\n An abridgment taken from the Book of Ether also, which is a record of the people of Jared, who were scattered at the time the Lord confounded the language of the people, when they were building a tower to get to heaven—Which is to show unto the remnant of the house of Israel what great things the Lord hath done for their fathers; and that they may know the covenants of the Lord, that they are not cast off forever—And also to the convincing of the Jew and Gentile that Jesus is the Christ, the Eternal God, manifesting himself unto all nations—And now, if there are faults they are the mistakes of men; wherefore, condemn not the things of God, that ye may be found spotless at the judgment-seat of Christ.",
        color: 0x086587,
        footer: {
          icon_url: client.user!.displayAvatarURL(),
          text: "An Account Written by the Hand of Mormon upon Plates Taken from the Plates of Nephi"
        }
      }]
    }).catch((err: any) => {
      console.log("Something went wrong: " + err);
    });
  }
}

export = Command