// Utility function for merging class names
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export async function cloudinaryUnsignedUpload(file, { cloudName, uploadPreset, folder = 'app_uploads' } = {}) {
  const name = cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = uploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!name || !preset) throw new Error('Cloudinary env not configured')

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${name}/auto/upload`, {
    method: 'POST',
    body: form
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch {}
  if (!res.ok) {
    const message = (data && (data.error?.message || data.message)) || `Upload failed (HTTP ${res.status})`
    throw new Error(message)
  }
  if (!data || !data.secure_url) throw new Error('Upload failed: no URL returned')
  return { url: data.secure_url, public_id: data.public_id, resource_type: data.resource_type || 'image' }
}
