import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateMerchantPDF = async (elementId: string = 'pdf-content') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('PDF content element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      allowTaint: true,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
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
