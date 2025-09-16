import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'qr7oyxid',         // Replace with your actual ID
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
})
