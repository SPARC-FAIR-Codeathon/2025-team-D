import postscribe from 'postscribe'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.provide('injectNewsletterArchive', elementSelector => {
    postscribe(
      elementSelector,
      '<script language="javascript" src="//science.us2.list-manage.com/generate-js/?u=e60c48f231a30b544eed731ea&fid=46414&show=1" type="text/javascript"></script>'
    )
  })

  /* You can alternatively use this format, which comes with automatic type support
  return {
    provide: {
      $injectNewsletterArchive: elementSelector => {
        postscribe(
          elementSelector,
          '<script language="javascript" src="//science.us2.list-manage.com/generate-js/?u=e60c48f231a30b544eed731ea&fid=46414&show=1" type="text/javascript"></script>'
        )
      }
    }
  }*/
})
