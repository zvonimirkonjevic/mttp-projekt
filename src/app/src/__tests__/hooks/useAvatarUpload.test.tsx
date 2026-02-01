import { renderHook, act, waitFor } from '@testing-library/react'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'

// Mock Supabase client
const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        storage: {
            from: () => ({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            }),
        },
    }),
}))

describe('useAvatarUpload', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUpload.mockResolvedValue({ data: { path: 'test.jpg' }, error: null })
        mockGetPublicUrl.mockReturnValue({
            data: { publicUrl: 'https://storage.example.com/avatars/test.jpg' },
        })
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAvatarUpload())

        expect(result.current.isUploading).toBe(false)
        expect(result.current.uploadError).toBeNull()
        expect(typeof result.current.uploadAvatar).toBe('function')
    })

    it('should upload file successfully', async () => {
        const { result } = renderHook(() => useAvatarUpload())

        const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })

        let publicUrl: string | undefined

        await act(async () => {
            publicUrl = await result.current.uploadAvatar(mockFile)
        })

        expect(publicUrl).toBe('https://storage.example.com/avatars/test.jpg')
        expect(result.current.isUploading).toBe(false)
        expect(result.current.uploadError).toBeNull()
        expect(mockUpload).toHaveBeenCalled()
    })

    it('should handle upload error', async () => {
        const uploadError = new Error('Upload failed')
        mockUpload.mockResolvedValue({
            data: null,
            error: uploadError,
        })

        const { result } = renderHook(() => useAvatarUpload())

        const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })

        await act(async () => {
            try {
                await result.current.uploadAvatar(mockFile)
            } catch (e) {
                // Expected to throw
            }
        })

        // The error should be captured
        expect(result.current.uploadError).toBeTruthy()
        expect(result.current.isUploading).toBe(false)
    })

    it('should track upload state', () => {
        const { result } = renderHook(() => useAvatarUpload())

        // Initially not uploading
        expect(result.current.isUploading).toBe(false)

        // Verify the hook returns proper interface
        expect(result.current).toHaveProperty('uploadAvatar')
        expect(result.current).toHaveProperty('isUploading')
        expect(result.current).toHaveProperty('uploadError')
    })
})
