import env from '@nihongo/shared/env'
import ImageKit from 'imagekit'

let client: ImageKit | null = null

export function getImageKit(): ImageKit | null {
  if (client)
    return client

  if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT)
    return null

  client = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT
  })
  return client
}
