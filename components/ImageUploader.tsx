import React, { useRef, useState } from "react"
import { supabase } from "~/lib/supabase"

interface ImageUploaderProps {
  images: string[]           // public URLs đã upload
  onChange: (urls: string[]) => void
  maxImages?: number
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
                                                              images,
                                                              onChange,
                                                              maxImages = 3
                                                            }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    const remaining = maxImages - images.length
    const toUpload  = Array.from(files).slice(0, remaining)

    // Validate
    for (const file of toUpload) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Chỉ hỗ trợ JPG và PNG.")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Mỗi ảnh tối đa 5MB.")
        return
      }
    }

    setUploading(true)

    const uploadedUrls: string[] = []

    for (const file of toUpload) {
      const ext      = file.type === "image/png" ? "png" : "jpg"
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("confession-images")
        .upload(filename, file, { contentType: file.type })

      if (uploadError) {
        setError("Upload thất bại. Thử lại nhé.")
        setUploading(false)
        return
      }

      const { data } = supabase.storage
        .from("confession-images")
        .getPublicUrl(filename)

      uploadedUrls.push(data.publicUrl)
    }

    onChange([...images, ...uploadedUrls])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div style={styles.container}>
      {/* Preview ảnh đã upload */}
      {images.length > 0 && (
        <div style={styles.previewRow}>
          {images.map((url, i) => (
            <div key={i} style={styles.previewItem}>
              <img src={url} alt="" style={styles.previewImg} />
              <button
                style={styles.removeBtn}
                onClick={() => removeImage(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <button
          style={{
            ...styles.uploadBtn,
            ...(uploading ? styles.uploadBtnDisabled : {})
          }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span>Đang tải...</span>
          ) : (
            <>
              <span style={styles.uploadIcon}>📎</span>
              <span>
                {images.length === 0
                  ? "Thêm ảnh (tuỳ chọn)"
                  : `Thêm ảnh (${images.length}/${maxImages})`}
              </span>
            </>
          )}
        </button>
      )}

      {error && <p style={styles.errorText}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  previewRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  previewItem: {
    position: "relative",
    width: "72px",
    height: "72px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid rgba(142,22,22,0.4)"
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  removeBtn: {
    position: "absolute",
    top: "2px",
    right: "2px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.7)",
    border: "none",
    color: "#EEEEEE",
    fontSize: "12px",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0
  },
  uploadBtn: {
    width: "100%",
    padding: "9px 14px",
    background: "rgba(238,238,238,0.04)",
    border: "1px dashed rgba(142,22,22,0.5)",
    borderRadius: "8px",
    color: "rgba(238,238,238,0.45)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    letterSpacing: "0.3px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px"
  },
  uploadBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed"
  },
  uploadIcon: {
    fontSize: "14px"
  },
  errorText: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    color: "#D84040"
  }
}