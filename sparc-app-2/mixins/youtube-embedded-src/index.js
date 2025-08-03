export default function(url) {
  // set params on player
  const youtubeEmbedParams = '?origin=https://sparc.science&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1'

  // parse the two ways of sharing links on youtube
  if (!url) return ''
  if (url.includes('https://www.youtube.com/embed/')) {
    return url + youtubeEmbedParams
  } else if (url.includes('watch')) {
    let id = url.split('=').pop()
    let embedUrl = 'https://www.youtube.com/embed/' + id + youtubeEmbedParams
    return embedUrl
  } else if (url.includes('youtu.be')) {
    let id = url.split('/').pop()
    let embedUrl = 'https://www.youtube.com/embed/' + id + youtubeEmbedParams
    return embedUrl
  } else {
    console.log("Error: can't parse youtube url")
    return ''
  }
}