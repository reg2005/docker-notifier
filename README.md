# docker-notifier

A Telegram and Slack integration to notify Docker events inspired by **_slack-notifier_** and **_docker-telegram-notifier_**.

## How to Run

[Set up a telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot) and get the `Bot Token`. then add the bot to a group and make it admin and [extract the Chat ID](https://stackoverflow.com/a/32572159/882223).

Run a container as follows:

```sh
# Docker
docker run -d -e TELEGRAM_URL=https://api.telegram.org/bot${botToken}/sendMessage -e TELEGRAM_CHANNEL_ID=chat_id -e SLACK_URL=https://hooks.slack.com/services/ANC/ABC/ABCDDEF -e SLACK_CHANNEL='#swarm-cluster-docker-events' -e SLACK_USERNAME=webhookbot -e SLACK_ICON_EMOJI=':ghost:' -v /var/run/docker.sock:/var/run/docker.sock reg2005/docker-notifier

# Docker Compose or docker swarm stack
curl -O https://raw.githubusercontent.com/reg2005/docker-notifier/master/docker-compose.yml
docker-compose up -d
```

## Contribution

Please let me know an issue or pull request.
