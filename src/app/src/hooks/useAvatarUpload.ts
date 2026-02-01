import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useAvatarUpload() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const supabase = createClient()

    const uploadAvatar = async (file: File) => {
        setIsUploading(true)
        setUploadError(null)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed'
            setUploadError(message)
            throw error
        } finally {
            setIsUploading(false)
        }
    }

    return {
        uploadAvatar,
        isUploading,
        uploadError
    }
}
