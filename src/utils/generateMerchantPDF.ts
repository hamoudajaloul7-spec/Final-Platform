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
            --background: 255 255 255;
            --foreground: 10 10 10;
            --card: 255 255 255;
            --card-foreground: 10 10 10;
            --popover: 255 255 255;
            --popover-foreground: 10 10 10;
            --primary: 22 163 74;
            --primary-foreground: 255 255 255;
            --secondary: 244 244 245;
            --secondary-foreground: 24 24 27;
            --muted: 244 244 245;
            --muted-foreground: 113 113 122;
            --accent: 244 244 245;
            --accent-foreground: 24 24 27;
            --destructive: 239 68 68;
            --border: 228 228 231;
            --input: 228 228 231;
            --ring: 24 24 27;
          }
          * {
            background-image: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
            border-color: #e5e7eb !important;
            outline-color: #e5e7eb !important;
          }
        `;
        doc.head.appendChild(style);

        // Replace any remaining oklch occurrences in style tags
        const styleTags = doc.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/oklch\([^)]+\)/g, '#888');
        }

        // Also check inline styles
        const allElements = doc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const element = allElements[i] as HTMLElement;
          if (element.style && element.style.cssText) {
            element.style.cssText = element.style.cssText.replace(/oklch\([^)]+\)/g, '#888');
          }
        }

        const root = doc.documentElement as HTMLElement;
        root.style.background = '#ffffff';

        const pdfRoot = doc.getElementById('pdf-content') as HTMLElement | null;
        if (pdfRoot) {
          pdfRoot.style.background = '#ffffff';
          pdfRoot.style.color = '#111111';
        }
      } catch {
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
