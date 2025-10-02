import { jsPDF } from 'jspdf';
import bwipjs from 'bwip-js';

/**
 * Generates a package label PDF with customer information and barcode
 * @param {Object} packageData - Package data including customer info
 * @param {Object} customerData - Customer information
 * @returns {boolean} - Downloads the PDF automatically
 */
export const generatePackageLabelPDF = (packageData, customerData) => {
  try {
    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Define colors
    const primaryColor = '#2563eb'; // Blue
    const secondaryColor = '#1e40af'; // Dark blue
    const textColor = '#1f2937'; // Gray-900

    // Set up header
    doc.setFillColor(37, 99, 235); // Primary blue
    doc.rect(0, 0, 210, 40, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("Pong's Shipping Company", 105, 15, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Package Label', 105, 25, { align: 'center' });

    // Add timestamp
    doc.setFontSize(9);
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

    // Reset text color for body
    doc.setTextColor(textColor);

    // Customer Information Section
    let yPosition = 55;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor);
    doc.text('Customer Information', 20, yPosition);

    yPosition += 10;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);

    // Customer Name
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Name:', 25, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${customerData.first_name} ${customerData.last_name}`, 70, yPosition);

    yPosition += 8;

    // Customer ID
    doc.setFont('helvetica', 'bold');
    doc.text('Customer ID:', 25, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(customerData.user_id.toString(), 70, yPosition);

    yPosition += 8;

    // Customer Email
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 25, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(customerData.email, 70, yPosition);

    yPosition += 8;

    // Customer Branch
    if (customerData.branch) {
      doc.setFont('helvetica', 'bold');
      doc.text('Branch:', 25, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(customerData.branch, 70, yPosition);
      yPosition += 8;
    }

    // Package Information Section
    yPosition += 10;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor);
    doc.text('Package Information', 20, yPosition);

    yPosition += 10;
    doc.setDrawColor(37, 99, 235);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);

    // Package ID
    doc.setFont('helvetica', 'bold');
    doc.text('Package ID:', 25, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(packageData.package_id.toString(), 70, yPosition);

    yPosition += 8;

    // Tracking Number (prominent)
    doc.setFont('helvetica', 'bold');
    doc.text('Tracking Number:', 25, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(primaryColor);
    doc.text(packageData.tracking_number, 70, yPosition);
    doc.setFontSize(11);
    doc.setTextColor(textColor);

    yPosition += 10;

    // Package Description
    if (packageData.description) {
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', 25, yPosition);
      doc.setFont('helvetica', 'normal');

      // Handle long descriptions with text wrapping
      const maxWidth = 115;
      const descriptionLines = doc.splitTextToSize(packageData.description, maxWidth);
      doc.text(descriptionLines, 70, yPosition);
      yPosition += (descriptionLines.length * 6);
    }

    yPosition += 8;

    // Package Status
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 25, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(packageData.status || 'Processing', 70, yPosition);

    yPosition += 8;

    // Package Weight
    if (packageData.weight) {
      doc.setFont('helvetica', 'bold');
      doc.text('Weight:', 25, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`${packageData.weight} lb`, 70, yPosition);
      yPosition += 8;
    }

    // Package Cost
    if (packageData.cost) {
      doc.setFont('helvetica', 'bold');
      doc.text('Declared Value:', 25, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`$${parseFloat(packageData.cost).toFixed(2)}`, 70, yPosition);
      yPosition += 8;
    }

    // Generate Barcode
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor);
    doc.text('Package Barcode', 105, yPosition, { align: 'center' });

    yPosition += 8;

    // Create a canvas element to generate barcode
    const canvas = document.createElement('canvas');

    try {
      // Generate barcode using bwip-js (CODE128 format)
      bwipjs.toCanvas(canvas, {
        bcid: 'code128',       // Barcode type
        text: packageData.package_id.toString(), // Text to encode
        scale: 3,              // Scaling factor
        height: 15,            // Bar height in millimeters
        includetext: true,     // Show human-readable text
        textxalign: 'center',  // Center the text
      });

      // Convert canvas to image and add to PDF
      const barcodeImage = canvas.toDataURL('image/png');

      // Center the barcode on the page
      const barcodeWidth = 120;
      const barcodeHeight = 40;
      const xPosition = (210 - barcodeWidth) / 2; // Center on A4 width (210mm)

      doc.addImage(barcodeImage, 'PNG', xPosition, yPosition, barcodeWidth, barcodeHeight);

      yPosition += barcodeHeight + 5;

      // Add barcode label text below the barcode
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.text(`Package ID: ${packageData.package_id}`, 105, yPosition, { align: 'center' });

    } catch (barcodeError) {
      console.error('Error generating barcode:', barcodeError);

      // If barcode generation fails, show package ID as text
      doc.setFontSize(20);
      doc.setFont('courier', 'bold');
      doc.text(packageData.package_id.toString(), 105, yPosition + 10, { align: 'center' });
    }

    // Add footer
    yPosition = 280; // Near bottom of A4 page
    doc.setFillColor(243, 244, 246); // Gray-100
    doc.rect(0, yPosition, 210, 17, 'F');

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.setFont('helvetica', 'normal');
    doc.text("Thank you for choosing Pong's Shipping Company", 105, yPosition + 7, { align: 'center' });
    doc.text('For inquiries, contact: shippingpongs@gmail.com | 1-876-455-9770', 105, yPosition + 12, { align: 'center' });

    // Generate filename
    const filename = `Package_Label_${packageData.tracking_number}_${Date.now()}.pdf`;

    // Save the PDF
    doc.save(filename);

    console.log('PDF generated successfully:', filename);
    return true;

  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Generates a simple package barcode label (smaller format)
 * @param {Object} packageData - Package data
 * @returns {boolean} - Downloads the PDF automatically
 */
export const generateBarcodeLabel = (packageData) => {
  try {
    // Create a smaller label (100mm x 80mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [100, 80]
    });

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Pong's Shipping", 50, 10, { align: 'center' });

    // Tracking Number
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(packageData.tracking_number, 50, 20, { align: 'center' });

    // Generate Barcode
    const canvas = document.createElement('canvas');

    // Generate barcode using bwip-js
    bwipjs.toCanvas(canvas, {
      bcid: 'code128',
      text: packageData.package_id.toString(),
      scale: 2,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });

    const barcodeImage = canvas.toDataURL('image/png');
    doc.addImage(barcodeImage, 'PNG', 10, 30, 80, 35);

    // Save
    const filename = `Barcode_${packageData.tracking_number}.pdf`;
    doc.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating barcode label:', error);
    return false;
  }
};
