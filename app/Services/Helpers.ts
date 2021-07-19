import axios from 'axios'
import tunnel from 'tunnel'
import parseUrl from 'url-parse'
import Env from '@ioc:Adonis/Core/Env'
export const getAxiosInstance = (type: 'slack' | 'telegram') => {
  const httpsProxy = Env.get('https_proxy')
  let baseURL = ''
  switch (type) {
    case 'slack':
      baseURL = Env.get('SLACK_URL', '')
      break
    case 'telegram':
      baseURL = Env.get('TELEGRAM_URL', '')
      break
    default:
      baseURL = ''
  }
  if (!baseURL) {
    return null
  }
  if (httpsProxy) {
    const proxy = parseUrl(httpsProxy)
    if (proxy.protocol === 'http:') {
      const proxyTunnel = tunnel.httpsOverHttp({
        proxy: {
          host: proxy.hostname,
          port: proxy.port ? parseInt(proxy.port) : 80,
        },
      })
      return axios.create({
        baseURL: baseURL,
        httpsAgent: proxyTunnel,
        proxy: false,
      })
    } else {
      const proxyConfig = {
        protocol: proxy.protocol,
        host: proxy.hostname,
        port: proxy.port ? parseInt(proxy.port) : 80,
        auth:
          proxy.username || proxy.password
            ? { username: proxy.username, password: proxy.password }
            : undefined,
      }
      return axios.create({
        baseURL: baseURL,
        proxy: proxyConfig,
      })
    }
  } else {
    return axios.create({
      baseURL: baseURL,
    })
  }
}
