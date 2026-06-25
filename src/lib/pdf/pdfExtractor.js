import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjsLib from cdnjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts raw text from a PDF file client-side
 * @param {File} file 
 * @param {Function} onProgress (optional) callback for progress updates
 * @returns {Promise<string>}
 */
export async function extractTextFromPDF(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

        loadingTask.onProgress = (progressData) => {
          if (onProgress && progressData.total > 0) {
            const pct = Math.round((progressData.loaded / progressData.total) * 50); // first 50% is downloading/loading
            onProgress(pct);
          }
        };

        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        let fullText = "";

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";

          if (onProgress) {
            const pct = 50 + Math.round((i / totalPages) * 50); // second 50% is parsing pages
            onProgress(pct);
          }
        }

        resolve(fullText.trim());
      } catch (err) {
        console.error("PDF Parsing error: ", err);
        reject(new Error("Failed to parse PDF. Make sure it is not corrupted or password-protected."));
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsArrayBuffer(file);
  });
}
