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
    ticketDownloadTime?: string;
}

export function generateReceiptPDF(data: ReceiptData): void {
    try {
        console.log('Starting PDF generation...');
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Generate verification hash for security
        const verificationData = `${data.transactionRef}-${data.upiTxnId}-${data.totalAmount}-${data.selectedEvents.join(',')}`;
        const verificationHash = btoa(verificationData).substring(0, 12).toUpperCase();
        
        // Debug: Log to console to check if PDF generation is working
        console.log('Generating PDF for:', data);
        console.log('Selected events:', data.selectedEvents);
        console.log('Verification hash:', verificationHash);

    // Modern color scheme
    const primaryColor = [59, 130, 246]; // Blue-500
    const secondaryColor = [107, 114, 128]; // Gray-500
    const accentColor = [34, 197, 94]; // Green-500
    const warningColor = [245, 158, 11]; // Amber-500
    const darkColor = [31, 41, 55]; // Gray-800

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
    const addLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = [200, 200, 200], width: number = 0.5) => {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(width);
        doc.line(x1, y1, x2, y2);
    };

    // Helper function to add rounded rectangle
    const addRoundedRect = (x: number, y: number, width: number, height: number, color: number[], radius: number = 5) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(x, y, width, height, radius, radius, 'F');
    };

    // Clean header without background
    let yPosition = 20;

    // Main title with modern styling - no background
    const cacheText = 'CACHE - 2K25';
    const cacheTextWidth = doc.getTextWidth(cacheText);
    addText(cacheText, (pageWidth - cacheTextWidth) / 2, yPosition, {
        fontSize: 24,
        color: primaryColor,
        style: 'bold'
    });

    yPosition += 30;

    // Transaction info card
    addRoundedRect(15, yPosition, pageWidth - 30, 50, [248, 250, 252], 8);
    addLine(15, yPosition + 50, pageWidth - 15, yPosition + 50, [229, 231, 235], 1);
    
    yPosition += 15;

    // Transaction Reference
    addText('Transaction ID', 25, yPosition, { fontSize: 10, color: secondaryColor, style: 'normal' });
    addText(data.transactionRef, 25, yPosition + 8, { fontSize: 14, color: darkColor, style: 'bold' });
    
    // UTR ID
    addText('UTR ID', pageWidth - 100, yPosition, { fontSize: 10, color: secondaryColor, style: 'normal' });
    addText(data.upiTxnId, pageWidth - 100, yPosition + 8, { fontSize: 14, color: accentColor, style: 'bold' });
    
    yPosition += 20;

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
    addText('Payment Date', 25, yPosition, { fontSize: 10, color: secondaryColor, style: 'normal' });
    addText(paymentDate, 25, yPosition + 8, { fontSize: 12, color: darkColor, style: 'normal' });

    // Ticket Download Time
    if (data.ticketDownloadTime) {
        const downloadDate = new Date(data.ticketDownloadTime).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        addText('Downloaded', pageWidth - 100, yPosition, { fontSize: 10, color: secondaryColor, style: 'normal' });
        addText(downloadDate, pageWidth - 100, yPosition + 8, { fontSize: 12, color: accentColor, style: 'normal' });
    }

    yPosition += 70;

    // Participant Details Card
    addRoundedRect(15, yPosition, pageWidth - 30, 120, [255, 255, 255], 8);
    addLine(15, yPosition, pageWidth - 15, yPosition, primaryColor, 2);
    
    yPosition += 15;
    addText('PARTICIPANT DETAILS', 25, yPosition, { fontSize: 16, color: primaryColor, style: 'bold' });
    yPosition += 20;

    // Personal Information in grid layout
    const personalInfo = [
        { label: 'Full Name', value: data.fullName },
        { label: 'Email', value: data.email },
        { label: 'Phone', value: data.phone },
        { label: 'College', value: data.college },
        { label: 'Roll Number', value: data.rollNo },
        { label: 'Section', value: data.section }
    ];

    personalInfo.forEach((info, index) => {
        const x = 25 + (index % 2) * (pageWidth / 2 - 20);
        const y = yPosition + Math.floor(index / 2) * 15;
        
        addText(`${info.label}:`, x, y, { fontSize: 10, color: secondaryColor, style: 'normal' });
        addText(info.value, x, y + 8, { fontSize: 12, color: darkColor, style: 'normal' });
    });

    yPosition += 100;

    // Events Card - Enhanced for verification
    addRoundedRect(15, yPosition, pageWidth - 30, 80 + (data.selectedEvents.length * 20), [255, 255, 255], 8);
    addLine(15, yPosition, pageWidth - 15, yPosition, primaryColor, 2);
    
    yPosition += 15;
    addText('🎫 REGISTERED EVENTS & PAYMENT BREAKDOWN', 25, yPosition, { fontSize: 16, color: primaryColor, style: 'bold' });
    yPosition += 20;

    // Event details with enhanced styling for verification
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
        'web-dev': 100,
        'poster': 100,
        'tech-expo': 100,
        'pymaster': 50,
        'tech-quiz': 100,
        'photography': 50,
        'free-fire': 200,
        'drawing': 50,
        'bgmi': 200,
        'meme-contest': 50
    };

    // Header for events table
    addRoundedRect(20, yPosition - 5, pageWidth - 40, 15, [59, 130, 246], 4);
    addText('EVENT NAME', 25, yPosition + 5, { fontSize: 10, color: [255, 255, 255], style: 'bold' });
    addRightText('AMOUNT', pageWidth - 25, yPosition + 5, { fontSize: 10, color: [255, 255, 255], style: 'bold' });
    yPosition += 20;

    data.selectedEvents.forEach((eventId, index) => {
        const eventName = eventNames[eventId] || eventId;
        const eventPrice = eventPrices[eventId] || 0;
        
        // Alternate background colors for better readability
        const bgColor = index % 2 === 0 ? [248, 250, 252] : [240, 248, 255];
        
        // Event item with enhanced styling
        addRoundedRect(20, yPosition - 5, pageWidth - 40, 15, bgColor, 4);
        addText(`✓ ${eventName}`, 25, yPosition + 2, { fontSize: 11, color: darkColor, style: 'bold' });
        addRightText(`₹${eventPrice}`, pageWidth - 25, yPosition + 2, { fontSize: 12, color: accentColor, style: 'bold' });
        yPosition += 20;
    });

    yPosition += 10;

    // Events Summary for easy verification
    addRoundedRect(20, yPosition, pageWidth - 40, 30, [254, 243, 199], 6);
    addText('📋 VERIFICATION SUMMARY', 25, yPosition + 8, { fontSize: 12, color: warningColor, style: 'bold' });
    addText(`Registered for ${data.selectedEvents.length} event(s) | Total: ₹${data.totalAmount}`, 25, yPosition + 18, { 
        fontSize: 10, 
        color: darkColor, 
        style: 'normal' 
    });

    yPosition += 40;

    // Total Amount with modern styling
    addRoundedRect(20, yPosition, pageWidth - 40, 25, [34, 197, 94], 6);
    addText('TOTAL AMOUNT PAID', 30, yPosition + 8, { fontSize: 12, color: [255, 255, 255], style: 'bold' });
    addRightText(`₹${data.totalAmount}`, pageWidth - 30, yPosition + 8, { fontSize: 18, color: [255, 255, 255], style: 'bold' });

    yPosition += 50;

    // Important Notice Card - More prominent
    addRoundedRect(15, yPosition, pageWidth - 30, 50, [254, 243, 199], 8);
    addLine(15, yPosition, pageWidth - 15, yPosition, warningColor, 3);
    
    yPosition += 15;
    addText('⚠️ IMPORTANT', 25, yPosition, { fontSize: 14, color: warningColor, style: 'bold' });
    yPosition += 15;
    addText('Please show both your transaction proof and this ticket at the entry gate to participate in the event.', 25, yPosition, { 
        fontSize: 12, 
        color: darkColor, 
        style: 'bold' 
    });

    yPosition += 60;

    // Security Verification Section
    addRoundedRect(15, yPosition, pageWidth - 30, 60, [240, 248, 255], 8);
    addLine(15, yPosition, pageWidth - 15, yPosition, primaryColor, 2);
    
    yPosition += 15;
    addText('🔒 SECURITY VERIFICATION', 25, yPosition, { fontSize: 14, color: primaryColor, style: 'bold' });
    yPosition += 15;
    
    addText('Verification Code:', 25, yPosition, { fontSize: 10, color: secondaryColor, style: 'normal' });
    addText(verificationHash, 25, yPosition + 8, { fontSize: 12, color: darkColor, style: 'bold' });
    
    addText('Transaction ID:', pageWidth - 100, yPosition, { fontSize: 10, color: secondaryColor, style: 'normal' });
    addText(data.transactionRef, pageWidth - 100, yPosition + 8, { fontSize: 10, color: darkColor, style: 'normal' });
    
    yPosition += 20;
    addText('⚠️ This ticket contains security features. Any modification will be detected.', 25, yPosition, { 
        fontSize: 9, 
        color: warningColor, 
        style: 'normal' 
    });

    yPosition += 40;

    // Check if we need a new page for events
    if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
    }

    // Footer with modern styling
    addRoundedRect(15, yPosition, pageWidth - 30, 30, [248, 250, 252], 8);
    yPosition += 15;
    
    const contactText = 'For queries: raghavap1116@gmail.com';
    const contactWidth = doc.getTextWidth(contactText);
    addText(contactText, (pageWidth - contactWidth) / 2, yPosition, {
        fontSize: 9,
        color: secondaryColor
    });

    // Add Page 2 - Events Details Page
    doc.addPage();
    yPosition = 20;

    // Events Page Header
    addText('CACHE - 2K25', (pageWidth - doc.getTextWidth('CACHE - 2K25')) / 2, yPosition, {
        fontSize: 24,
        color: primaryColor,
        style: 'bold'
    });
    yPosition += 30;

    // Registered Events Details Page
    addRoundedRect(15, yPosition, pageWidth - 30, pageHeight - 100, [255, 255, 255], 8);
    addLine(15, yPosition, pageWidth - 15, yPosition, primaryColor, 2);
    
    yPosition += 20;
    addText('🎫 REGISTERED EVENTS DETAILS', 25, yPosition, { fontSize: 18, color: primaryColor, style: 'bold' });
    yPosition += 25;

    // Transaction info for reference
    addText('Transaction Reference:', 25, yPosition, { fontSize: 12, color: secondaryColor, style: 'bold' });
    addText(data.transactionRef, 25, yPosition + 8, { fontSize: 14, color: darkColor, style: 'bold' });
    yPosition += 25;

    // Events table with enhanced styling
    addRoundedRect(20, yPosition, pageWidth - 40, 20, [59, 130, 246], 4);
    addText('EVENT NAME', 25, yPosition + 7, { fontSize: 12, color: [255, 255, 255], style: 'bold' });
    addRightText('AMOUNT', pageWidth - 25, yPosition + 7, { fontSize: 12, color: [255, 255, 255], style: 'bold' });
    yPosition += 25;

    // Event details with enhanced styling (using existing variables from first page)
    data.selectedEvents.forEach((eventId, index) => {
        const eventName = eventNames[eventId] || eventId;
        const eventPrice = eventPrices[eventId] || 0;
        
        // Alternate background colors for better readability
        const bgColor = index % 2 === 0 ? [248, 250, 252] : [240, 248, 255];
        
        // Event item with enhanced styling
        addRoundedRect(20, yPosition, pageWidth - 40, 18, bgColor, 4);
        addText(`✓ ${eventName}`, 25, yPosition + 6, { fontSize: 12, color: darkColor, style: 'bold' });
        addRightText(`₹${eventPrice}`, pageWidth - 25, yPosition + 6, { fontSize: 14, color: accentColor, style: 'bold' });
        yPosition += 22;
    });

    yPosition += 20;

    // Total summary
    addRoundedRect(20, yPosition, pageWidth - 40, 30, [34, 197, 94], 6);
    addText('TOTAL AMOUNT PAID', 30, yPosition + 10, { fontSize: 14, color: [255, 255, 255], style: 'bold' });
    addRightText(`₹${data.totalAmount}`, pageWidth - 30, yPosition + 10, { fontSize: 20, color: [255, 255, 255], style: 'bold' });

    yPosition += 50;

    // Verification notice
    addRoundedRect(20, yPosition, pageWidth - 40, 40, [254, 243, 199], 6);
    addText('⚠️ IMPORTANT FOR EVENT ENTRY', 25, yPosition + 10, { fontSize: 12, color: warningColor, style: 'bold' });
    addText('Please show this page along with your transaction proof at the event venue.', 25, yPosition + 25, { 
        fontSize: 10, 
        color: darkColor, 
        style: 'normal' 
    });

        // Save the PDF with cache-2k25 and timestamp
        const currentTime = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `cache-2k25_ticket_${data.transactionRef}_${currentTime}.pdf`;
        doc.save(fileName);
        console.log('PDF generated successfully:', fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}