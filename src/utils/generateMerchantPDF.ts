import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type PDFPageEl = HTMLElement;

const waitForImages = async (root: HTMLElement) => {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const onDone = () => {
            img.removeEventListener('load', onDone);
            img.removeEventListener('error', onDone);
            resolve();
          };
          img.addEventListener('load', onDone);
          img.addEventListener('error', onDone);
        })
    )
  );
};

const renderElementToCanvas = async (el: HTMLElement) => {
  return html2canvas(el, {
    scale: 2,
    allowTaint: true,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    onclone: (doc) => {
      try {
        const style = doc.createElement('style');
        style.textContent = `
          :root {
            --background: 255 255 255 !important;
            --foreground: 10 10 10 !important;
            --card: 255 255 255 !important;
            --card-foreground: 10 10 10 !important;
            --popover: 255 255 255 !important;
            --popover-foreground: 10 10 10 !important;
            --primary: 22 163 74 !important;
            --primary-foreground: 255 255 255 !important;
            --secondary: 244 244 245 !important;
            --secondary-foreground: 24 24 27 !important;
            --muted: 244 244 245 !important;
            --muted-foreground: 113 113 122 !important;
            --accent: 244 244 245 !important;
            --accent-foreground: 24 24 27 !important;
            --destructive: 239 68 68 !important;
            --border: 228 228 231 !important;
            --input: 228 228 231 !important;
            --ring: 24 24 27 !important;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        `;
        doc.head.appendChild(style);

        // Function to replace oklch with fallback colors
        const replaceOklch = (str: string) => {
          if (!str) return str;
          // Replace specific brand oklch with hex
          return str
            .replace(/oklch\(0\.45\s+0\.21\s+156\.57\)/g, '#16a34a') // primary
            .replace(/oklch\(1\s+0\s+0\)/g, '#ffffff') // background/white
            .replace(/oklch\(0\.145\s+0\s+0\)/g, '#0a0a0a') // foreground
            .replace(/oklch\([^)]+\)/g, '#888888'); // fallback for others
        };

        // Replace oklch in all style tags
        const styleTags = doc.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          styleTags[i].innerHTML = replaceOklch(styleTags[i].innerHTML);
        }

        // Replace oklch in all inline styles
        const allElements = doc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const element = allElements[i] as HTMLElement;
          if (element.style && element.style.cssText) {
            element.style.cssText = replaceOklch(element.style.cssText);
          }
        }

        const root = doc.documentElement as HTMLElement;
        root.style.background = '#ffffff';
        doc.body.style.background = '#ffffff';

        const pdfRoot = doc.getElementById('pdf-content') as HTMLElement | null;
        if (pdfRoot) {
          pdfRoot.style.background = '#ffffff';
          pdfRoot.style.color = '#111111';
          pdfRoot.classList.remove('dark'); // Ensure it's in light mode for PDF
        }
      } catch (e) {
        console.error('PDF clone error:', e);
      }
    }
  });
};

const addTallImageToPdf = (pdf: jsPDF, imgData: string, imgHeight: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let remaining = imgHeight;
  let y = 0;

  pdf.addImage(imgData, 'PNG', 0, y, pageWidth, imgHeight);
  remaining -= pageHeight;

  while (remaining > 0) {
    y -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, y, pageWidth, imgHeight);
    remaining -= pageHeight;
  }
};

export const generateMerchantPDF = async (elementId: string = 'pdf-content') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('PDF content element not found');
  }

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  const stepPages = Array.from(element.querySelectorAll('[data-pdf-page="true"]')) as PDFPageEl[];
  const pages: PDFPageEl[] = stepPages.length > 0 ? stepPages : [element];

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i];

    await waitForImages(pageEl);

    const canvas = await renderElementToCanvas(pageEl);
    const imgData = canvas.toDataURL('image/png');
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    addTallImageToPdf(pdf, imgData, imgHeight);
  }

  return pdf;
};

export const downloadMerchantPDF = async (filename: string = 'دليل-التاجر.pdf') => {
  const preOpened = typeof window !== 'undefined' ? window.open('', '_blank') : null;

  const pdf = await generateMerchantPDF('pdf-content');
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);

  if (preOpened) {
    preOpened.location.href = url;
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
