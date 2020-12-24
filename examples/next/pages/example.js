import { app } from '../app.mjs'

// An example of how to extract data from the nrg request context and pass it
// to the component during SSR.
export async function getServerSideProps ({ req, res }) {
  return app.next(req, res, ctx => ({ props: { example: ctx.state.example } }))
}

export default function Example ({ example }) {
  return <div>{example}</div>
}
