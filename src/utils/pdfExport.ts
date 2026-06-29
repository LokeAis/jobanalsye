import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfExportOptions {
  /** When true, stamp a subtle "gratisversjon" footer on every page. */
  watermark?: boolean;
}

export const exportBriefingToPdf = async (
  elementId: string,
  customFilename?: string,
  options: PdfExportOptions = {}
): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Target element not found in DOM:", elementId);
    return false;
  }

  // Save the original style to restore it later
  const originalStyle = element.getAttribute('style');

  // Temporarily make the element visible off-screen so html2canvas can capture its layout
  element.style.setProperty('display', 'block', 'important');
  element.style.position = 'fixed';
  element.style.top = '0';
  element.style.left = '0';
  element.style.width = '800px';
  element.style.zIndex = '-9999';
  element.style.opacity = '1';
  element.style.pointerEvents = 'none';
  element.style.backgroundColor = '#ffffff';

  try {
    // Wait briefly for browser repaint/layout
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Adaptive scale: keep text crisp, but never produce a canvas larger than
    // older mobile browsers can handle (iOS Safari historically caps a canvas
    // dimension at ~4096px and limits total canvas area). A long briefing at a
    // fixed 2x would silently fail to render on such devices.
    const RENDER_WIDTH = 800;
    const MAX_CANVAS_DIMENSION = 4096;
    const contentHeight = element.scrollHeight || 1200;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const desiredScale = isMobile ? 1.5 : 2;
    const scale = Math.max(
      1,
      Math.min(
        desiredScale,
        MAX_CANVAS_DIMENSION / RENDER_WIDTH,
        MAX_CANVAS_DIMENSION / contentHeight
      )
    );

    const canvas = await html2canvas(element, {
      scale, // adaptive: print-ready where possible, capped for older mobiles
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: RENDER_WIDTH,
    });

    // Restore original style immediately
    if (originalStyle) {
      element.setAttribute('style', originalStyle);
    } else {
      element.removeAttribute('style');
    }

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF with A4 dimensions (210mm x 297mm)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Fit the captured image width to page width
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add subsequent pages if the content height exceeds A4 height
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // Shift position vertically to slice image
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // Free version: stamp a subtle footer on every page.
    if (options.watermark) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 160);
        pdf.text(
          'Big Five Forberedelse – gratisversjon · Oppgrader til premium for PDF uten denne teksten',
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
      }
    }

    const filename = customFilename || 'intervjubriefing.pdf';
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    
    // Ensure styles are restored on error
    if (originalStyle) {
      element.setAttribute('style', originalStyle);
    } else {
      element.removeAttribute('style');
    }
    return false;
  }
};
