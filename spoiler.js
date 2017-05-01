module.exports = function(bot) {

    bot.command("spoiler", (res, args) => {
        let str = args.join(" ")

        let regex = /\[spoiler\](.*)\[\/spoiler\]/i

        let matches =  str.match(regex)

        if(!matches) {
            res.send("To properly use the spoiler command you have to write your message like this:\n\n!spoiler In episode 7 [spoiler]John Snow dies!!![/spoiler] :cry:")
            return
        }

        let newstr = str.replace(regex, "\\*\\*\\*\\*\\*\\*\\*\\*")
        let spoiled = str.replace(regex, matches[1])

        let id = res.message.id

        // delete old message
        res.message.delete()

        res.collection("spoiler").insert({
            timestamp: new Date().getTime(),
            channelId: res.channelId,
            messageId: id,
            message: spoiled
        })

        res.send(`${newstr}\n\nIf you want to read this message just write:\n\n!unspoil ${id}`)
    })

    bot.command("unspoil", (res, args) => {
        let query = {channelId: res.channelId}

        if(args.length > 0) {
            query.messageId = args[0]
        }

        console.log("unspoil query: ", JSON.stringify(query, null, "    "))

        // delete message to not clutter the chat (assuming you have a server with hundreds of ppl and everyone wants to read the message)
        res.message.delete()

        res.collection("spoiler").find(query).toArray().then(messages => {
            if(messages.length == 0) {
                res.reply("I couldn't find a message, which matches your request in this server/channel.")
            } else if(messages.length == 1) {
                res.sendDirectMessage(messages[0].message)
            } else {
                // no id specified? Send the newest!
                let sorted = messages.sort((a, b) => a.timestamp - b.timestamp)
                res.sendDirectMessage(sorted[messages.length - 1].message)
            }
        })
    })
}
