import App from './App'

export default pageTemplate => ctx => {
  // Render the application using Svelte's SSR API and receive the <head> HTML,
  // body HTML, and CSS code.
  let page
  try {
    page = App.render(ctx)
  } catch (err) {
    // Log the error if one is thrown when rendering the page.
    ctx.log.error(err)
  }

  // Replace the placeholders on the base page template with the code returned
  // by the render method.
  return pageTemplate
    .replace('<% head %>', page.head)
    .replace('<% css %>', page.css.code)
    .replace('<% html %>', page.html)
}
