# Iago discord bot

The Iago discord bot can be used to create chaos in your private discord server.
Iago is an antagonist described as being motiveless malignity, wreaking havoc
with no ulterior purpose.

[Wikipedia](https://en.wikipedia.org/wiki/Iago)

## Config

Create a config.json file and put your discord bot token in it.

```
{
    "token": "your_token",
    "channelId: "your channel id"
}
```

## Messages

Iago will respond with random messages when it feels like it. To have any
effect you need to customise the messages to be relevant to your community.

Create a messages.json file and put your commands in it.

```
{
    "messages": [ "Array of strings that can be chosen randomly" ],
    "prompts": {
        "corri": [
            "Array of strings that can respond to any message that prompts a reply, welcome or unwelcome",
            "Tastes like soap"
        ]
    },
    "reacts": {
        "hi": [ "👋", "🌊" ]
    },
    "cron": [
        {
            "condition": "0 0 * * *",
            "messages": [
                "The time is midnight"
            ]
        }
    ]
}
```
