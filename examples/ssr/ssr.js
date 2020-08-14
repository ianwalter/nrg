import App from './App'

export default pageTemplate => ctx => {
  // Render the application using Svelte's SSR API and receive the <head> HTML,
  // body HTML, and CSS code.
  let page = {}
  try {
    page = ctx.url.includes('not-found') ? { status: 404 } : App.render(ctx)
  } catch (err) {
    // Log the error if one is thrown when rendering the page.
    ctx.logger.error(err)

    // Instead of a Svelte app/page, we'll just show the words "Internal Server
    // Error" on the page.
    page.html = 'Internal Server Error'
  }

  // Return the page object to the SSR middleware so that it can be assembled
  // into an HTML page and sent to the client.
  return page
}
