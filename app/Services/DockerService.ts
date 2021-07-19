import { Seq } from 'immutable'
import Docker from 'dockerode'
import JSONStream from 'JSONStream'
import View from '@ioc:Adonis/Core/View'
import { getAxiosInstance } from './Helpers'
const h2s = require('html-slack')
import Env from '@ioc:Adonis/Core/Env'
const debug = require('debug')('DOCKER_SERVICE')
export class DockerService {
  private docker = new Docker()
  private slackAxios = getAxiosInstance('slack')
  private telegramAxios = getAxiosInstance('telegram')
  constructor() {}
  // private telegram = new TelegramClient()
  public async sendEvent(event) {
    try {
      const html = await View.render(`${event.Type}_${event.Action}`, { e: event })

      debug('[docker debug event]:', event)

      if (html) {
        this.sendSlack(html)
        this.sendTelegram(html)
      }
    } catch (error) {
      debug(`[sendEvent debug error]:`, error)
      console.error(`[sendEvent error]:`, error.message)
    }
  }

  async sendEventStream() {
    const eventStream = await this.docker.getEvents()
    eventStream
      .pipe(JSONStream.parse())
      .on('data', (event) => this.sendEvent(event).catch(this.handleError))
      .on('error', this.handleError)
  }

  async sendVersion() {
    const version = await this.docker.version()
    let text = 'Docker is running'
    Seq(version).map((value, title) => (text += `${title}: <b>${value}</b>`))
    this.sendSlack(text)
    this.sendTelegram(text)
  }
  async sendSlack(html: string) {
    if (!this.slackAxios) {
      console.log('Slack was disabled, please set it')
      return
    }
    try {
      await this.slackAxios.post('', {
        channel: Env.get('SLACK_CHANNEL'),
        username: Env.get('SLACK_USERNAME'),
        text: h2s(html),
        icon_emoji: Env.get('SLACK_ICON_EMOJI'),
      })
    } catch (error) {
      debug(`[sendSlack debug error]:`, error)
      console.error(`[sendSlack error]:`, error?.response?.data || error?.message)
    }
  }
  async sendTelegram(html: string) {
    if (!this.telegramAxios) {
      console.log('Telegram was disabled, please set it')
      return
    }
    try {
      await this.telegramAxios.post('', {
        chat_id: Env.get('TELEGRAM_CHANNEL_ID'),
        text: html,
        parse_mode: 'HTML',
      })
    } catch (error) {
      debug(`[sendTelegram debug error]:`, error)
      console.error(`[sendTelegram error]:`, error?.response?.data || error?.message)
    }
  }

  async main() {
    await this.sendVersion()
    await this.sendEventStream()
  }

  handleError(e) {
    console.error(e)
    // telegram.sendError(e).catch(console.error);
  }
}
