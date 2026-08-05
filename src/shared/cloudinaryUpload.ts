import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import config from '../config'

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
})

export const createCloudinaryUpload = (folder: string) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 800, crop: 'fill' }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  })
}

export const foodImagesUpload = createCloudinaryUpload(
  config.cloudinary.folder
).array('images', 10)

export const categoryImageUpload = createCloudinaryUpload(
  'food-app/categories'
).single('image')

export const extractPublicId = (url: string): string | null => {
  // https://res.cloudinary.com/<name>/image/upload/v<version>/<folder>/<public_id>.<ext>
  const match = url.match(/\/upload\/(?:v\d+\/)?([^/]+\/)*(.+)\.[a-zA-Z0-9]+$/)
  if (!match) return null
  const folder = match[1] || ''
  const publicId = match[2]
  return folder ? `${folder}${publicId}` : publicId
}

export const deleteImagesFromCloudinary = async (
  urls: string[]
): Promise<void> => {
  const publicIds = urls.map(extractPublicId).filter(Boolean) as string[]
  await Promise.allSettled(
    publicIds.map(publicId =>
      cloudinary.uploader.destroy(publicId, { invalidate: true })
    )
  )
}
