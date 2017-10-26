//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a bot that gives you instant access to Cisco Spark technical data
 * 
 * note : this example can work with any type of spark token (from a developer or bot account)
 *  
 */

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts your Bot with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();

// do not listen to ourselves
// uncomment if you're running the bot from your Developer access token and you want to invoke in a 1-1 room
//bot.interpreter.ignoreSelf = false; 

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });


bot.onCommand("about", function (command) {
    spark.messageAdd({
        roomId: command.message.roomId, 
        markdown: "```\n{\n   'author':'Elliott Swimmer <elliott.swimmer@mapcoexpress.com>',\n   'code':'https://github.com/e1ij4h/node-sparkbot-samples/blob/master/examples/elliott.js',\n   'description':'Elliott being Elliott',\n   'healthcheck':'GET https://sparkbot-inspector.herokuapp.com',\n   'webhook':'POST https://sparkbot-inspector.herokuapp.com'\n}\n```"
    });
});


bot.onCommand("fallback", function (command) {
    // so happy to join
    var email = command.message.personEmail;
    spark.messageAdd({
        roomId: command.message.roomId, 
        text: "No <@personEmail:" + email + ">... No."
    })
        .then(function (message) {
            // show how to use
            showHelp(command.message.roomId);
        });
});
bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});
function showHelp(roomId) {
    spark.messageAdd({
        roomId: roomId,
        markdown: "If you want me to do something, you have to know my /commands...",
        file: "http://www.relatably.com/m/img/helpful-memes/60565089.jpg"
    });
}


bot.onCommand("room", function (command) {
    spark.messageAdd({
        roomId: command.message.roomId,
        text: "I'll give you this one. These room UUIDs are hard to find.",
        markdown: "roomId: " + command.message.roomId
    });
});


bot.onCommand("whoami", function (command) {
    spark.messageAdd({
        roomId: command.message.roomId,
        text: "You don't know who you are?... O..k...",
        markdown: "personId: " + command.message.personId + "\n\nemail: " + command.message.personEmail
    });
});


bot.onCommand("whois", function (command) {
    // Check usage
    if (command.message.mentionedPeople.length != 2) {
        spark.messageAdd({
            roomId: command.message.roomId,
            markdown: "Who is who?"
        });
        return;
    }

    var participant = command.message.mentionedPeople[1];

    spark.personGet(participant).then(function (person) {
        spark.messageAdd({
            roomId: command.message.roomId,
            text: "Alright creeper..."
            markdown: "personId: " + person.id + "\n\ndisplayName: " + person.displayName + "\n\nemail: " + person.emails[0]
        });
    });
});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageAdd({
            roomId: trigger.data.roomId,
            text: "Hi, I am the Elliott Bot! Now with 10% more snark!"
        })
            .then(function (message) {
                if (message.roomType == "group") {
                    spark.messageAdd({
                        roomId: message.roomId, 
                        markdown: "**Note that this is a 'Group' room. I will wake up only when mentionned.**"
                    })
                        .then(function (message) {
                            showHelp(message.roomId);
                        });
                }
                else {
                    showHelp(message.roomId);
                }
            });
    }
});
