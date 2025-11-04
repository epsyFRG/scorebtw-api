package com.scorebtw.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload di un'immagine su Cloudinary
     *
     * @param file   - il file da caricare
     * @param folder - la cartella su Cloudinary (es: "avatars", "game-covers")
     * @return URL pubblico dell'immagine caricata
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image",
                        "transformation", new com.cloudinary.Transformation()
                                .width(500)
                                .height(500)
                                .crop("limit")
                                .quality("auto")
                )
        );

        return (String) uploadResult.get("secure_url");
    }

    /**
     * Upload avatar utente
     */
    public String uploadAvatar(MultipartFile file) throws IOException {
        return uploadImage(file, "scorebtw/avatars");
    }

    /**
     * Upload cover immagine gioco
     */
    public String uploadGameCover(MultipartFile file) throws IOException {
        return uploadImage(file, "scorebtw/game-covers");
    }

    /**
     * Elimina un'immagine da Cloudinary
     *
     * @param publicId - l'ID pubblico dell'immagine (estratto dall'URL)
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    /**
     * Estrae il public_id dall'URL Cloudinary
     * Esempio: https://res.cloudinary.com/demo/image/upload/v1234/folder/image.jpg
     * Ritorna: folder/image
     */
    public String extractPublicId(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }

        String[] parts = imageUrl.split("/upload/");
        if (parts.length < 2) {
            return null;
        }

        String[] pathParts = parts[1].split("/");
        // Rimuove la versione (v1234567890) e l'estensione
        StringBuilder publicId = new StringBuilder();
        for (int i = 1; i < pathParts.length; i++) {
            if (i > 1) publicId.append("/");
            String part = pathParts[i];
            // Rimuove estensione
            if (part.contains(".")) {
                part = part.substring(0, part.lastIndexOf("."));
            }
            publicId.append(part);
        }

        return publicId.toString();
    }
}