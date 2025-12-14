/**
 * Comprime e redimensiona uma imagem antes do upload.
 * @param {File} file - O arquivo de imagem original.
 * @param {number} maxWidth - Largura máxima permitida (padrão: 1200px).
 * @param {number} quality - Qualidade da compressão (0 a 1).
 * @returns {Promise<Blob>} - O arquivo processado em formato Blob (WebP).
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // 1. Calcular novas dimensões mantendo proporção
          let width = img.width;
          let height = img.height;
  
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
  
          // 2. Criar Canvas para desenhar a imagem redimensionada
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          // 3. Exportar como WebP com compressão
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Falha na compressão da imagem.'));
              }
            },
            'image/webp', // Formato moderno
            quality       // Nível de qualidade
          );
        };
        
        img.onerror = (err) => reject(err);
      };
      
      reader.onerror = (err) => reject(err);
    });
  };