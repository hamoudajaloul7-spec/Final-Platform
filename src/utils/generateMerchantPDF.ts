import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateMerchantPDF = async (elementId: string = 'pdf-content') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('PDF content element not found');
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
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

    const canvas = await html2canvas(element, {
      scale: 2,
      allowTaint: true,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgData = canvas.toDataURL('image/png');
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

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

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadMerchantPDF = async (filename: string = 'دليل-التاجر.pdf') => {
  try {
    const pdf = await generateMerchantPDF('pdf-content');
    pdf.save(filename);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};
