import { Scalar } from '@scalar/hono-api-reference'

import type { AppOpenAPI } from './types.js'

import packageJSON from '../../package.json' with { type: 'json' }

function fixOpenApiPaths(spec: any) {
  const newPaths: any = {}
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    const fixedPath = path.replace(/:(\w+)/g, '{$1}')
    newPaths[fixedPath] = methods
  }
  spec.paths = newPaths
  return spec
}

export default function configureOpenAPI(app: AppOpenAPI) {
  app.get('/docs', (c) => {
    const spec = app.getOpenAPIDocument({
      openapi: '3.0.0',
      info: {
        version: packageJSON.version,
        title: `${packageJSON.name} API`
      }
    })
    return c.json(fixOpenApiPaths(spec))
  })

  app.get('/reference', Scalar({
    url: '/docs',
    theme: 'elysiajs',
    pageTitle: `${packageJSON.name} API`,
    layout: 'classic'
  }))
}
