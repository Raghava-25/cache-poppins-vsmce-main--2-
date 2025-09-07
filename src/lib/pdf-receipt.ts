import jsPDF from 'jspdf';

export interface ReceiptData {
    fullName: string;
    email: string;
    phone: string;
    college: string;
    rollNo: string;
    section: string;
    selectedEvents: string[];
    totalAmount: number;
    transactionRef: string;
    upiTxnId: string;
    paidAtIso: string;
}

export function generateReceiptPDF(data: ReceiptData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = [41, 128, 185]; // Blue
    const secondaryColor = [52, 73, 94]; // Dark gray
    const accentColor = [46, 204, 113]; // Green

    // Helper function to add text with styling
    const addText = (text: string, x: number, y: number, options: any = {}) => {
        doc.setFontSize(options.fontSize || 12);
        if (options.color && Array.isArray(options.color)) {
            doc.setTextColor(options.color[0], options.color[1], options.color[2]);
        } else {
            doc.setTextColor(options.color || 0, 0, 0);
        }
        doc.setFont(options.font || 'helvetica', options.style || 'normal');
        doc.text(text, x, y);
    };

    // Helper function to add right-aligned text
    const addRightText = (text: string, x: number, y: number, options: any = {}) => {
        doc.setFontSize(options.fontSize || 12);
        if (options.color && Array.isArray(options.color)) {
            doc.setTextColor(options.color[0], options.color[1], options.color[2]);
        } else {
            doc.setTextColor(options.color || 0, 0, 0);
        }
        doc.setFont(options.font || 'helvetica', options.style || 'normal');
        const textWidth = doc.getTextWidth(text);
        doc.text(text, x - textWidth, y);
    };

    // Helper function to add line
    const addLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = [200, 200, 200]) => {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(0.5);
        doc.line(x1, y1, x2, y2);
    };

    // Header with centered text
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Center text manually
    const cacheText = 'CACHE 2025';
    const cacheTextWidth = doc.getTextWidth(cacheText);
    addText(cacheText, (pageWidth - cacheTextWidth) / 2, 15, {
        fontSize: 24,
        color: [255, 255, 255],
        style: 'bold'
    });

    const receiptText = 'Registration Receipt';
    const receiptTextWidth = doc.getTextWidth(receiptText);
    addText(receiptText, (pageWidth - receiptTextWidth) / 2, 30, {
        fontSize: 16,
        color: [255, 255, 255],
        style: 'bold'
    });

    const thankYouText = 'Thank you for registration';
    const thankYouTextWidth = doc.getTextWidth(thankYouText);
    addText(thankYouText, (pageWidth - thankYouTextWidth) / 2, 40, {
        fontSize: 12,
        color: [255, 255, 255]
    });

    let yPosition = 70;

    // Receipt Info
    addText('RECEIPT DETAILS', 20, yPosition, { fontSize: 16, color: primaryColor, style: 'bold' });
    yPosition += 15;

    addLine(20, yPosition, pageWidth - 20, yPosition, primaryColor);
    yPosition += 10;

    // Transaction Reference
    addText(`Transaction ID: ${data.transactionRef}`, 20, yPosition, { fontSize: 12, style: 'bold' });
    yPosition += 8;

    // Payment Date
    const paymentDate = new Date(data.paidAtIso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    addText(`Payment Date: ${paymentDate}`, 20, yPosition, { fontSize: 12 });
    yPosition += 8;

    // UTR ID
    addText(`UTR ID: ${data.upiTxnId}`, 20, yPosition, { fontSize: 12, style: 'bold', color: accentColor });
    yPosition += 15;

    // Participant Details
    addText('PARTICIPANT DETAILS', 20, yPosition, { fontSize: 16, color: primaryColor, style: 'bold' });
    yPosition += 15;

    addLine(20, yPosition, pageWidth - 20, yPosition, primaryColor);
    yPosition += 10;

    // Personal Information
    const personalInfo = [
        { label: 'Full Name', value: data.fullName },
        { label: 'Email', value: data.email },
        { label: 'Phone', value: data.phone },
        { label: 'College', value: data.college },
        { label: 'Roll Number', value: data.rollNo },
        { label: 'Section', value: data.section }
    ];

    personalInfo.forEach(info => {
        addText(`${info.label}:`, 20, yPosition, { fontSize: 12, style: 'bold' });
        addText(info.value, 100, yPosition, { fontSize: 12 });
        yPosition += 10;
    });

    yPosition += 10;

    // Selected Events
    addText('SELECTED EVENTS', 20, yPosition, { fontSize: 16, color: primaryColor, style: 'bold' });
    yPosition += 15;

    addLine(20, yPosition, pageWidth - 20, yPosition, primaryColor);
    yPosition += 10;

    // Event details with rupee symbols
    const eventNames: Record<string, string> = {
        'web-dev': 'Web Development Challenge',
        'poster': 'Poster Presentation',
        'tech-expo': 'Tech Expo',
        'pymaster': 'PyMaster Contest',
        'tech-quiz': 'Technical Quiz',
        'photography': 'Photography Contest',
        'free-fire': 'Free Fire Esports Championship',
        'drawing': 'Live Drawing',
        'bgmi': 'BGMI Esports Tournament',
        'meme-contest': 'Tech Meme Contest'
    };

    const eventPrices: Record<string, number> = {
        'web-dev': 200,
        'poster': 100,
        'tech-expo': 300,
        'pymaster': 150,
        'tech-quiz': 100,
        'photography': 150,
        'free-fire': 200,
        'drawing': 100,
        'bgmi': 1,
        'meme-contest': 50
    };

    data.selectedEvents.forEach(eventId => {
        const eventName = eventNames[eventId] || eventId;
        const eventPrice = eventPrices[eventId] || 0;
        addText(`• ${eventName}`, 20, yPosition, { fontSize: 12 });
        addRightText(`₹${eventPrice}`, pageWidth - 20, yPosition, { fontSize: 12, style: 'bold' });
        yPosition += 10;
    });

    yPosition += 10;

    // Total Amount with rupee symbol
    addLine(20, yPosition, pageWidth - 20, yPosition, [200, 200, 200]);
    yPosition += 10;

    addText('TOTAL AMOUNT:', 20, yPosition, { fontSize: 16, style: 'bold', color: secondaryColor });
    addRightText(`₹${data.totalAmount}`, pageWidth - 20, yPosition, { fontSize: 18, style: 'bold', color: accentColor });
    yPosition += 20;

    // Footer
    addLine(20, yPosition, pageWidth - 20, yPosition, [200, 200, 200]);
    yPosition += 15;

    const thankYouFooterText = 'Thank you for registering for Cache 2025!';
    const thankYouFooterWidth = doc.getTextWidth(thankYouFooterText);
    addText(thankYouFooterText, (pageWidth - thankYouFooterWidth) / 2, yPosition, {
        fontSize: 14,
        color: primaryColor,
        style: 'bold'
    });
    yPosition += 10;

    const contactText = 'For any queries, contact us at raghavap1116@gmail.com';
    const contactWidth = doc.getTextWidth(contactText);
    addText(contactText, (pageWidth - contactWidth) / 2, yPosition, {
        fontSize: 10,
        color: secondaryColor
    });
    yPosition += 10;

    const disclaimerText = 'This is a computer-generated receipt.';
    const disclaimerWidth = doc.getTextWidth(disclaimerText);
    addText(disclaimerText, (pageWidth - disclaimerWidth) / 2, yPosition, {
        fontSize: 8,
        color: [150, 150, 150]
    });

    // Save the PDF
    const fileName = `Cache2025_Receipt_${data.transactionRef}.pdf`;
    doc.save(fileName);
}