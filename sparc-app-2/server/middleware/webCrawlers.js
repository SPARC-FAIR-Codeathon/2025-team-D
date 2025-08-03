export default defineEventHandler((event) => {
  const req = event?.node?.req
  const res = event?.node?.res
  const userAgent = req?.headers['user-agent']?.toLowerCase() || ''
  const url = req?.url || ''

  // Skip blocking for sitemap API
  if (url.startsWith('/api/__sitemap__/urls') || url.startsWith('/__sitemap__/')) {
    return // allow sitemap requests through
  }
  
  const botPatterns = [
    /semrush/i, /msnbot/i, /yandex/i, /applebot/i, /wowrack/i, /lifeera/i,
    /petalbot/i, /nettle/i, /xforce-security/i, /neevabot/i, /seekport crawler/i,
    /exabot/i, /gigabot/i, /iccrawler/i, /snappy/i, /mb2345browser/i, /qqbrowser/i,
    /liebaofast/i, /micromessenger/i, /kinza/i, /theworld/i, /youdaobot/i,
    /qwantify/i, /bleriot/i, /wikiapiary/i, /megaindex/i, /mojeekbot/i,
    /blexbot/i, /coccocbot/i, /seokicks/i, /seznambot/i, /yandeximages/i,
    /tweetmemebot/i, /yeti/i, /ahrefsbot/i, /bytespider/i, /mj12bot/i,
    /turnitinbot/i, /ccbot/i, /linguee bot/i, /dotbot/i, /openlinkprofiler/i,
    /ltx71/i, /rogerbot/i, /baiduspider/i, /facebot/i, /pinterestbot/i, /slackbot/i,
    /embedly/i, /whatsapp/i, /telegrambot/i, /headlesschrome/i, /puppeteer/i, /phantomjs/i,
    /screaming frog seo spider/i, /adsbot-google/i, /sogou/i
  ]

  if (userAgent == '' || botPatterns.some(pattern => pattern.test(userAgent))) {
    console.log(`Blocked bot: ${userAgent} from IP: ${getRequestIP(event)}`)
    res.statusCode = 403
    res.end('Bot detected, serving 403 response.')
    return
  }
})
