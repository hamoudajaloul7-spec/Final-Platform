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
        // 1. Overwrite all problematic CSS variables with HEX values
        const style = doc.createElement('style');
        style.textContent = `
          :root {
            --background: #ffffff !important;
            --foreground: #0a0a0a !important;
            --card: #ffffff !important;
            --card-foreground: #0a0a0a !important;
            --popover: #ffffff !important;
            --popover-foreground: #0a0a0a !important;
            --primary: #16a34a !important;
            --primary-foreground: #ffffff !important;
            --secondary: #f4f4f5 !important;
            --secondary-foreground: #18181b !important;
            --muted: #f4f4f5 !important;
            --muted-foreground: #71717a !important;
            --accent: #f4f4f5 !important;
            --accent-foreground: #18181b !important;
            --destructive: #ef4444 !important;
            --border: #e4e4e7 !important;
            --input: #e4e4e7 !important;
            --ring: #18181b !important;
            --sidebar: #ffffff !important;
            --sidebar-foreground: #0a0a0a !important;
            --sidebar-primary: #18181b !important;
            --sidebar-primary-foreground: #ffffff !important;
            --sidebar-accent: #f4f4f5 !important;
            --sidebar-accent-foreground: #18181b !important;
            --sidebar-border: #e4e4e7 !important;
            --sidebar-ring: #18181b !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transition: none !important;
            animation: none !important;
          }
        `;
        doc.head.appendChild(style);

        // 2. Comprehensive search and replace for oklch in all style tags
        const replaceOklchInString = (str: string) => {
          return str.replace(/oklch\s*\([^)]+\)/gi, (match) => {
            if (match.includes('0.45') && match.includes('156.57')) return '#16a34a';
            if (match.includes('1 0 0') || match.includes('100% 0 0')) return '#ffffff';
            if (match.includes('0.145 0 0')) return '#0a0a0a';
            return '#888888';
          });
        };

        const styleTags = doc.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          try {
            styleTags[i].innerHTML = replaceOklchInString(styleTags[i].innerHTML);
          } catch (e) {}
        }

        // 3. Remove all link tags to prevent html2canvas from trying to parse external oklch
        // We've already added our fallback styles above.
        const linkTags = Array.from(doc.getElementsByTagName('link'));
        linkTags.forEach(link => {
          if (link.rel === 'stylesheet') {
            link.remove();
          }
        });

        // 4. Fix inline styles
        const allElements = doc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i] as HTMLElement;
          if (el.style && el.style.cssText && el.style.cssText.includes('oklch')) {
            el.style.cssText = replaceOklchInString(el.style.cssText);
          }
        }

        // 5. Final cleanup
        const root = doc.documentElement;
        root.style.backgroundColor = '#ffffff';
        doc.body.style.backgroundColor = '#ffffff';
      } catch (e) {
        console.error('PDF generation clone fix failed:', e);
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
