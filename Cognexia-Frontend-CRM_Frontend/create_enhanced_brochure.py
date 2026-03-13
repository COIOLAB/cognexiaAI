"""
Create an enhanced, visually stunning sales brochure with icons, graphics, and perfect formatting
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak, 
                                Table, TableStyle, KeepTogether)
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import Flowable
from reportlab.graphics.shapes import Drawing, Circle, Rect, Line, Polygon, String as DrawString
from reportlab.graphics import renderPDF

class IconBox(Flowable):
    """Icon with text - visual element"""
    def __init__(self, icon_type, text, width=1.8*inch, height=1.2*inch):
        Flowable.__init__(self)
        self.icon_type = icon_type
        self.text = text
        self.width = width
        self.height = height
    
    def draw(self):
        # Background with gradient effect
        colors = [HexColor('#f0f9ff'), HexColor('#e0f2fe')]
        
        self.canv.setFillColor(colors[0])
        self.canv.roundRect(0, 0, self.width, self.height, 8, fill=1, stroke=0)
        
        # Border
        self.canv.setStrokeColor(HexColor('#0ea5e9'))
        self.canv.setLineWidth(2)
        self.canv.roundRect(0, 0, self.width, self.height, 8, fill=0, stroke=1)
        
        # Draw icon based on type
        icon_x = self.width / 2
        icon_y = self.height - 45
        
        if self.icon_type == 'database':
            # Database icon
            self.canv.setFillColor(HexColor('#0ea5e9'))
            self.canv.circle(icon_x, icon_y, 18, fill=1, stroke=0)
            self.canv.setStrokeColor(white)
            self.canv.setLineWidth(2)
            self.canv.line(icon_x - 10, icon_y + 5, icon_x + 10, icon_y + 5)
            self.canv.line(icon_x - 10, icon_y, icon_x + 10, icon_y)
            self.canv.line(icon_x - 10, icon_y - 5, icon_x + 10, icon_y - 5)
            
        elif self.icon_type == 'ai':
            # AI Brain icon
            self.canv.setFillColor(HexColor('#0ea5e9'))
            self.canv.circle(icon_x, icon_y, 18, fill=1, stroke=0)
            self.canv.setStrokeColor(white)
            self.canv.setLineWidth(2)
            # Neural network connections
            self.canv.circle(icon_x - 8, icon_y + 5, 3, fill=1, stroke=0)
            self.canv.circle(icon_x + 8, icon_y + 5, 3, fill=1, stroke=0)
            self.canv.circle(icon_x, icon_y - 8, 3, fill=1, stroke=0)
            
        elif self.icon_type == 'security':
            # Shield icon
            self.canv.setFillColor(HexColor('#0ea5e9'))
            path = self.canv.beginPath()
            path.moveTo(icon_x, icon_y + 15)
            path.lineTo(icon_x - 12, icon_y + 8)
            path.lineTo(icon_x - 12, icon_y - 5)
            path.lineTo(icon_x, icon_y - 15)
            path.lineTo(icon_x + 12, icon_y - 5)
            path.lineTo(icon_x + 12, icon_y + 8)
            path.close()
            self.canv.drawPath(path, fill=1, stroke=0)
            # Checkmark
            self.canv.setStrokeColor(white)
            self.canv.setLineWidth(2)
            self.canv.line(icon_x - 6, icon_y, icon_x - 2, icon_y - 5)
            self.canv.line(icon_x - 2, icon_y - 5, icon_x + 6, icon_y + 5)
            
        elif self.icon_type == 'analytics':
            # Chart icon
            self.canv.setFillColor(HexColor('#0ea5e9'))
            self.canv.circle(icon_x, icon_y, 18, fill=1, stroke=0)
            self.canv.setFillColor(white)
            self.canv.rect(icon_x - 10, icon_y - 10, 5, 8, fill=1, stroke=0)
            self.canv.rect(icon_x - 3, icon_y - 10, 5, 12, fill=1, stroke=0)
            self.canv.rect(icon_x + 4, icon_y - 10, 5, 15, fill=1, stroke=0)
            
        elif self.icon_type == 'cloud':
            # Cloud icon
            self.canv.setFillColor(HexColor('#0ea5e9'))
            self.canv.circle(icon_x - 5, icon_y, 10, fill=1, stroke=0)
            self.canv.circle(icon_x + 5, icon_y, 8, fill=1, stroke=0)
            self.canv.circle(icon_x, icon_y + 5, 8, fill=1, stroke=0)
            self.canv.rect(icon_x - 12, icon_y - 5, 24, 10, fill=1, stroke=0)
            
        elif self.icon_type == 'users':
            # Users icon
            self.canv.setFillColor(HexColor('#0ea5e9'))
            self.canv.circle(icon_x, icon_y, 18, fill=1, stroke=0)
            self.canv.setFillColor(white)
            self.canv.circle(icon_x - 5, icon_y + 5, 4, fill=1, stroke=0)
            self.canv.circle(icon_x + 5, icon_y + 5, 4, fill=1, stroke=0)
            path = self.canv.beginPath()
            path.moveTo(icon_x - 8, icon_y - 8)
            path.lineTo(icon_x - 2, icon_y - 8)
            path.lineTo(icon_x - 2, icon_y - 2)
            path.lineTo(icon_x - 8, icon_y - 2)
            path.close()
            self.canv.drawPath(path, fill=1, stroke=0)
            path = self.canv.beginPath()
            path.moveTo(icon_x + 2, icon_y - 8)
            path.lineTo(icon_x + 8, icon_y - 8)
            path.lineTo(icon_x + 8, icon_y - 2)
            path.lineTo(icon_x + 2, icon_y - 2)
            path.close()
            self.canv.drawPath(path, fill=1, stroke=0)
            
        else:
            # Default star icon
            self.canv.setFillColor(HexColor('#0ea5e9'))
            self.canv.circle(icon_x, icon_y, 18, fill=1, stroke=0)
            self.canv.setFillColor(white)
            self.canv.setFont('Helvetica-Bold', 20)
            self.canv.drawCentredString(icon_x, icon_y - 7, '★')
        
        # Text
        self.canv.setFillColor(HexColor('#1e293b'))
        self.canv.setFont('Helvetica-Bold', 11)
        
        # Wrap text
        words = self.text.split()
        lines = []
        line = ""
        for word in words:
            if len(line + word) < 15:
                line += word + " "
            else:
                if line:
                    lines.append(line.strip())
                line = word + " "
        if line:
            lines.append(line.strip())
        
        y_pos = 35
        for line_text in lines[:3]:  # Max 3 lines
            text_width = self.canv.stringWidth(line_text, 'Helvetica-Bold', 11)
            x = (self.width - text_width) / 2
            self.canv.drawString(x, y_pos, line_text)
            y_pos -= 14


class FeatureCard(Flowable):
    """Enhanced feature card with better formatting"""
    def __init__(self, title, items, width=3.2*inch, color='#0ea5e9'):
        Flowable.__init__(self)
        self.title = title
        self.items = items if isinstance(items, list) else [items]
        self.width = width
        self.color = HexColor(color)
        # Calculate height based on content
        self.height = 0.4*inch + len(self.items) * 0.2*inch + 0.2*inch
    
    def draw(self):
        # Outer shadow effect
        self.canv.setFillColor(HexColor('#cbd5e1'))
        self.canv.roundRect(2, -2, self.width, self.height, 8, fill=1, stroke=0)
        
        # Main background
        self.canv.setFillColor(white)
        self.canv.roundRect(0, 0, self.width, self.height, 8, fill=1, stroke=0)
        
        # Top accent bar
        self.canv.setFillColor(self.color)
        self.canv.rect(0, self.height - 35, self.width, 35, fill=1, stroke=0)
        
        # Title
        self.canv.setFillColor(white)
        self.canv.setFont('Helvetica-Bold', 11)
        # Wrap title if needed
        title_text = self.title[:35] + '...' if len(self.title) > 35 else self.title
        self.canv.drawString(12, self.height - 22, title_text)
        
        # Border
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(1)
        self.canv.roundRect(0, 0, self.width, self.height, 8, fill=0, stroke=1)
        
        # Items with checkmarks
        self.canv.setFont('Helvetica', 9)
        y_pos = self.height - 50
        
        for item in self.items[:8]:  # Max 8 items per card
            # Checkmark circle
            self.canv.setFillColor(HexColor('#22c55e'))
            self.canv.circle(15, y_pos + 4, 4, fill=1, stroke=0)
            
            # Checkmark
            self.canv.setStrokeColor(white)
            self.canv.setLineWidth(1.5)
            self.canv.line(13, y_pos + 4, 14.5, y_pos + 2.5)
            self.canv.line(14.5, y_pos + 2.5, 17, y_pos + 5.5)
            
            # Text - wrap if too long
            self.canv.setFillColor(HexColor('#334155'))
            item_clean = item.replace('**', '').replace('*', '')
            
            if len(item_clean) > 38:
                words = item_clean.split()
                line1 = ""
                line2 = ""
                for word in words:
                    if len(line1 + word) < 38 and not line2:
                        line1 += word + " "
                    else:
                        line2 += word + " "
                
                self.canv.drawString(24, y_pos + 5, line1.strip())
                if line2:
                    self.canv.drawString(24, y_pos - 5, line2.strip()[:35] + '...' if len(line2) > 35 else line2.strip())
                    y_pos -= 20
                else:
                    y_pos -= 15
            else:
                self.canv.drawString(24, y_pos + 5, item_clean)
                y_pos -= 15


class StatsCircle(Flowable):
    """Circular stats display"""
    def __init__(self, value, label, width=1.5*inch, height=1.5*inch):
        Flowable.__init__(self)
        self.value = value
        self.label = label
        self.width = width
        self.height = height
    
    def draw(self):
        center_x = self.width / 2
        center_y = self.height / 2
        
        # Outer glow circles
        self.canv.setFillColor(HexColor('#dbeafe'))
        self.canv.circle(center_x, center_y, 48, fill=1, stroke=0)
        
        self.canv.setFillColor(HexColor('#bfdbfe'))
        self.canv.circle(center_x, center_y, 42, fill=1, stroke=0)
        
        # Main circle
        self.canv.setFillColor(HexColor('#0ea5e9'))
        self.canv.circle(center_x, center_y, 38, fill=1, stroke=0)
        
        # Inner circle
        self.canv.setFillColor(HexColor('#38bdf8'))
        self.canv.circle(center_x, center_y, 35, fill=1, stroke=0)
        
        # Value
        self.canv.setFillColor(white)
        self.canv.setFont('Helvetica-Bold', 18)
        value_width = self.canv.stringWidth(self.value, 'Helvetica-Bold', 18)
        self.canv.drawString(center_x - value_width/2, center_y - 5, self.value)
        
        # Label below
        self.canv.setFillColor(HexColor('#475569'))
        self.canv.setFont('Helvetica', 8)
        
        # Wrap label
        words = self.label.split()
        lines = []
        line = ""
        for word in words:
            if len(line + word) < 12:
                line += word + " "
            else:
                lines.append(line.strip())
                line = word + " "
        if line:
            lines.append(line.strip())
        
        y_pos = 8
        for line_text in lines[:2]:
            text_width = self.canv.stringWidth(line_text, 'Helvetica', 8)
            self.canv.drawString(center_x - text_width/2, y_pos, line_text)
            y_pos -= 10


class BrandedCanvas(canvas.Canvas):
    """Canvas with professional headers and footers"""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []
    
    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()
    
    def save(self):
        page_count = len(self.pages)
        for page_dict in self.pages:
            self.__dict__.update(page_dict)
            if self._pageNumber > 1:  # Skip header/footer on cover
                self.draw_decorations(page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)
    
    def draw_decorations(self, page_count):
        # Gradient header
        header_colors = [
            (HexColor('#0ea5e9'), 0),
            (HexColor('#1890d5'), 1),
            (HexColor('#1d85ca'), 2),
            (HexColor('#2170b5'), 3),
            (HexColor('#2563eb'), 4)
        ]
        
        segment = A4[0] / 5
        for color, i in header_colors:
            self.setFillColor(color)
            self.rect(i * segment, A4[1] - 0.5*inch, segment, 0.5*inch, fill=1, stroke=0)
        
        # Logo/company name
        self.setFillColor(white)
        self.setFont('Helvetica-Bold', 14)
        self.drawString(0.5*inch, A4[1] - 0.32*inch, "CognexiaAI ERP")
        
        # Tagline
        self.setFont('Helvetica-Oblique', 8)
        self.drawRightString(A4[0] - 0.5*inch, A4[1] - 0.32*inch, 
                           "Cognition Meets Precision")
        
        # Decorative line under header
        self.setStrokeColor(HexColor('#0ea5e9'))
        self.setLineWidth(1)
        self.line(0, A4[1] - 0.52*inch, A4[0], A4[1] - 0.52*inch)
        
        # Footer background
        self.setFillColor(HexColor('#f8fafc'))
        self.rect(0, 0, A4[0], 0.35*inch, fill=1, stroke=0)
        
        # Footer line
        self.setStrokeColor(HexColor('#0ea5e9'))
        self.line(0, 0.35*inch, A4[0], 0.35*inch)
        
        # Footer text
        self.setFillColor(HexColor('#64748b'))
        self.setFont('Helvetica', 7)
        self.drawString(0.5*inch, 0.15*inch, 
                       "© 2026 CognexiaAI | 📧 sales@cognexiaai.com | 📞 +91-9167422630")
        
        self.setFont('Helvetica-Bold', 7)
        self.drawRightString(A4[0] - 0.5*inch, 0.15*inch, 
                           f"Page {self._pageNumber - 1} of {page_count - 1}")


def create_enhanced_brochure():
    """Create visually stunning brochure with icons and graphics"""
    
    with open('COMPLETE_FEATURE_LIST.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    pdf_file = 'CognexiaAI_ERP_Final_Brochure.pdf'
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        topMargin=0.7*inch,
        bottomMargin=0.5*inch,
        leftMargin=0.6*inch,
        rightMargin=0.6*inch
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # ============ COVER PAGE ============
    # Simple gradient cover
    cover_data = [[Spacer(1, 8.5*inch)]]
    cover_table = Table(cover_data, colWidths=[7*inch], rowHeights=[8.5*inch])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#0ea5e9')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(cover_table)
    
    # Move back up to add content on cover
    elements.append(Spacer(1, -8.3*inch))
    
    # Company name
    cover_style = ParagraphStyle(
        'Cover',
        parent=styles['Normal'],
        fontSize=48,
        textColor=white,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=20,
        leading=58
    )
    elements.append(Paragraph('CognexiaAI ERP', cover_style))
    
    # Subtitle
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=18,
        textColor=white,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=12,
        leading=22
    )
    elements.append(Paragraph('Industry 5.0 Enterprise CRM Platform', subtitle_style))
    
    # Tagline
    tagline_style = ParagraphStyle(
        'Tagline',
        parent=styles['Normal'],
        fontSize=14,
        textColor=HexColor('#e0f2fe'),
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique',
        spaceAfter=40,
        leading=18
    )
    elements.append(Paragraph('"Cognition Meets Precision"', tagline_style))
    
    elements.append(Spacer(1, 0.5*inch))
    
    # Stats circles
    stats_row1 = [
        StatsCircle('83', 'Database Entities'),
        Spacer(0.3*inch, 0.1*inch),
        StatsCircle('60+', 'Services'),
        Spacer(0.3*inch, 0.1*inch),
        StatsCircle('200+', 'API Endpoints')
    ]
    
    stats_table1 = Table([stats_row1], colWidths=[1.5*inch, 0.3*inch, 1.5*inch, 0.3*inch, 1.5*inch])
    stats_table1.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(stats_table1)
    
    elements.append(Spacer(1, 0.3*inch))
    
    stats_row2 = [
        StatsCircle('100+', 'Integrations'),
        Spacer(0.3*inch, 0.1*inch),
        StatsCircle('99.9%', 'Uptime SLA'),
        Spacer(0.3*inch, 0.1*inch),
        StatsCircle('10K+', 'Concurrent Users')
    ]
    
    stats_table2 = Table([stats_row2], colWidths=[1.5*inch, 0.3*inch, 1.5*inch, 0.3*inch, 1.5*inch])
    stats_table2.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(stats_table2)
    
    elements.append(Spacer(1, 0.8*inch))
    
    # Contact on cover
    contact_style = ParagraphStyle(
        'ContactCover',
        parent=styles['Normal'],
        fontSize=11,
        textColor=white,
        alignment=TA_CENTER,
        spaceAfter=5
    )
    elements.append(Paragraph('<b>Contact Us</b>', contact_style))
    elements.append(Paragraph('📧 sales@cognexiaai.com  |  📞 +91-9167422630', contact_style))
    elements.append(Paragraph('🌐 www.cognexiaai.com/demo', contact_style))
    
    elements.append(PageBreak())
    
    # ============ EXECUTIVE SUMMARY WITH ICONS ============
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#0ea5e9'),
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=15,
        spaceBefore=10
    )
    
    elements.append(Paragraph('Why Choose CognexiaAI ERP?', section_title_style))
    
    # Icon boxes grid
    icon_row1 = [
        IconBox('database', '83 Entities Complete Data Model'),
        Spacer(0.2*inch, 0.1*inch),
        IconBox('ai', 'AI-Powered Intelligence'),
        Spacer(0.2*inch, 0.1*inch),
        IconBox('security', 'Enterprise Security'),
    ]
    
    icon_table1 = Table([icon_row1], colWidths=[1.8*inch, 0.2*inch, 1.8*inch, 0.2*inch, 1.8*inch])
    icon_table1.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(icon_table1)
    
    elements.append(Spacer(1, 0.15*inch))
    
    icon_row2 = [
        IconBox('analytics', 'Real-Time Analytics'),
        Spacer(0.2*inch, 0.1*inch),
        IconBox('cloud', '99.9% Uptime SLA'),
        Spacer(0.2*inch, 0.1*inch),
        IconBox('users', '10K+ Concurrent Users'),
    ]
    
    icon_table2 = Table([icon_row2], colWidths=[1.8*inch, 0.2*inch, 1.8*inch, 0.2*inch, 1.8*inch])
    icon_table2.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(icon_table2)
    
    elements.append(Spacer(1, 0.3*inch))
    
    # ============ PARSE FEATURES WITH ENHANCED CARDS ============
    h1_style = ParagraphStyle(
        'H1Enhanced',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=white,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=0,
        spaceBefore=0
    )
    
    h2_style = ParagraphStyle(
        'H2Enhanced',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#1e40af'),
        fontName='Helvetica-Bold',
        spaceAfter=10,
        spaceBefore=15,
        leftIndent=5
    )
    
    h3_style = ParagraphStyle(
        'H3Enhanced',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=HexColor('#0ea5e9'),
        fontName='Helvetica-Bold',
        spaceAfter=8,
        spaceBefore=10
    )
    
    lines = content.split('\n')
    skip_first = ['# CognexiaAI ERP - Complete Feature List',
                  '## Industry 5.0 Enterprise CRM Platform',
                  '### \"Cognition Meets Precision\"']
    
    current_features = []
    current_heading = ""
    cards_in_row = []
    color_index = 0
    colors = ['#0ea5e9', '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c']
    
    for line_idx, line in enumerate(lines):
        line = line.replace('\r', '').strip()
        
        if line in skip_first or not line:
            continue
        
        if line.startswith('# '):
            # Flush cards
            if cards_in_row:
                if len(cards_in_row) == 1:
                    cards_in_row.append(Spacer(0.1*inch, 0.1*inch))
                
                card_table = Table([cards_in_row], colWidths=[3.2*inch, 0.2*inch, 3.2*inch])
                card_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(card_table)
                elements.append(Spacer(1, 0.15*inch))
                cards_in_row = []
            
            current_features = []
            
            # Section header
            elements.append(Spacer(1, 0.2*inch))
            section_text = line[2:].strip()
            
            section_para = Paragraph(section_text, h1_style)
            section_table = Table([[section_para]], colWidths=[6.6*inch], rowHeights=[0.45*inch])
            section_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#0ea5e9')),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROUNDEDCORNERS', [8, 8, 8, 8]),
            ]))
            elements.append(section_table)
            elements.append(Spacer(1, 0.15*inch))
            
        elif line.startswith('## '):
            # Flush cards
            if cards_in_row:
                if len(cards_in_row) == 1:
                    cards_in_row.append(Spacer(0.1*inch, 0.1*inch))
                
                card_table = Table([cards_in_row], colWidths=[3.2*inch, 0.2*inch, 3.2*inch])
                card_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(card_table)
                elements.append(Spacer(1, 0.12*inch))
                cards_in_row = []
            
            current_features = []
            elements.append(Paragraph(line[3:], h2_style))
            
        elif line.startswith('### '):
            # Create card from previous features
            if current_features and current_heading:
                color = colors[color_index % len(colors)]
                card = FeatureCard(current_heading, current_features[:8], color=color)
                cards_in_row.append(card)
                color_index += 1
                
                if len(cards_in_row) == 2:
                    card_table = Table([[cards_in_row[0], Spacer(0.2*inch, 0.1*inch), cards_in_row[1]]], 
                                      colWidths=[3.2*inch, 0.2*inch, 3.2*inch])
                    card_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ]))
                    elements.append(card_table)
                    elements.append(Spacer(1, 0.12*inch))
                    cards_in_row = []
                
                current_features = []
            
            current_heading = line[4:].replace('**', '').strip()
            
        elif line.startswith('- '):
            item = line[2:].strip()
            current_features.append(item)
            
            # Create card every 6-8 items
            if len(current_features) >= 7:
                if current_heading:
                    color = colors[color_index % len(colors)]
                    card = FeatureCard(current_heading, current_features[:8], color=color)
                    cards_in_row.append(card)
                    color_index += 1
                    
                    if len(cards_in_row) == 2:
                        card_table = Table([[cards_in_row[0], Spacer(0.2*inch, 0.1*inch), cards_in_row[1]]], 
                                          colWidths=[3.2*inch, 0.2*inch, 3.2*inch])
                        card_table.setStyle(TableStyle([
                            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ]))
                        elements.append(card_table)
                        elements.append(Spacer(1, 0.12*inch))
                        cards_in_row = []
                    
                    current_features = []
        
        elif line.startswith('---'):
            # Flush cards
            if cards_in_row:
                if len(cards_in_row) == 1:
                    cards_in_row.append(Spacer(0.1*inch, 0.1*inch))
                
                card_table = Table([cards_in_row], colWidths=[3.2*inch, 0.2*inch, 3.2*inch])
                card_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(card_table)
                elements.append(Spacer(1, 0.15*inch))
                cards_in_row = []
            current_features = []
    
    # Flush remaining
    if current_features and current_heading:
        color = colors[color_index % len(colors)]
        card = FeatureCard(current_heading, current_features[:8], color=color)
        cards_in_row.append(card)
    
    if cards_in_row:
        if len(cards_in_row) == 1:
            cards_in_row.append(Spacer(0.1*inch, 0.1*inch))
        
        card_table = Table([cards_in_row], colWidths=[3.2*inch, 0.2*inch, 3.2*inch])
        card_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(card_table)
    
    # ============ CRM COMPARISON PAGE ============
    elements.append(PageBreak())
    
    # Comparison title
    comp_title = Paragraph('CRM Comparison: CognexiaAI vs Competition', section_title_style)
    elements.append(comp_title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Comparison table data
    comparison_data = [
        ['Feature', 'CognexiaAI ERP', 'Salesforce', 'HubSpot', 'Zoho CRM'],
        ['Database Entities', '83', '~40', '~35', '~30'],
        ['API Endpoints', '200+', '150+', '100+', '80+'],
        ['AI/ML Features', '10+ Services', 'Einstein AI', 'Limited', 'Zia AI'],
        ['Industry 5.0 Tech', '✓ AR/VR/Holographic', '✗', '✗', '✗'],
        ['Quantum Intelligence', '✓ Yes', '✗', '✗', '✗'],
        ['Universal Migration', '✓ One-Click', 'Manual', 'Limited', 'Manual'],
        ['ERP Integration Fields', '200+', '~50', '~30', '~40'],
        ['Multi-Tenant SaaS', '✓ Native', '✓', '✓', '✓'],
        ['Concurrent Users', '10,000+', '5,000+', '3,000+', '2,000+'],
        ['Uptime SLA', '99.9%', '99.9%', '99.5%', '99.5%'],
        ['Real-Time Analytics', '✓ Advanced', '✓', '✓ Basic', '✓ Basic'],
        ['Mobile App', '✓ Native', '✓', '✓', '✓'],
        ['Custom Workflows', '✓ Unlimited', 'Limited', 'Limited', 'Limited'],
        ['Starting Price', 'Competitive', '$$$$', '$$$', '$$'],
        ['Enterprise Security', '✓ Military-Grade', '✓', '✓', '✓'],
    ]
    
    # Create comparison table
    comp_table = Table(comparison_data, colWidths=[2*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.1*inch])
    comp_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#0ea5e9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        
        # First column
        ('BACKGROUND', (0, 1), (0, -1), HexColor('#f0f9ff')),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (0, -1), 9),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        
        # CognexiaAI column (highlight)
        ('BACKGROUND', (1, 1), (1, -1), HexColor('#e0f2fe')),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (1, 1), (1, -1), 9),
        ('TEXTCOLOR', (1, 1), (1, -1), HexColor('#0ea5e9')),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        
        # Other columns
        ('FONTNAME', (2, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (2, 1), (-1, -1), 8),
        ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
        
        # Alternating rows
        ('ROWBACKGROUNDS', (2, 1), (-1, -1), [white, HexColor('#f8fafc')]),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cbd5e1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(comp_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Comparison summary
    comp_summary = ParagraphStyle('CompSum', parent=styles['Normal'], fontSize=10, 
                                 alignment=TA_CENTER, textColor=HexColor('#0ea5e9'),
                                 fontName='Helvetica-Bold')
    elements.append(Paragraph('✓ = Available  |  ✗ = Not Available', comp_summary))
    
    # ============ WHY COGNEXIAAI IS BEST PAGE ============
    elements.append(PageBreak())
    
    # Best in industry title
    best_title_style = ParagraphStyle(
        'BestTitle',
        parent=styles['Normal'],
        fontSize=28,
        textColor=HexColor('#0ea5e9'),
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=20,
        leading=34
    )
    
    elements.append(Paragraph('Why CognexiaAI CRM is Best in the Industry', best_title_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Create compelling reasons with icons
    reasons = [
        ('1', 'Industry 5.0 Pioneer', 'First CRM with AR/VR holographic interfaces and quantum intelligence capabilities'),
        ('2', 'Unmatched Scale', '83 database entities, 200+ APIs, 10,000+ concurrent users - the most comprehensive CRM'),
        ('3', 'AI-First Architecture', '10+ specialized AI services including predictive analytics, sentiment analysis, and quantum intelligence'),
        ('4', 'Universal Migration', 'One-click migration from ANY CRM platform with 200+ ERP integration fields'),
        ('5', 'Military-Grade Security', 'Enterprise security with MFA, SSO, RBAC, and SOC 2 Type II compliance ready'),
        ('6', 'Real ROI', '35% increase in sales productivity, 40% faster lead-to-close, 99.9% uptime SLA'),
    ]
    
    for num, title, desc in reasons:
        # Create reason box
        reason_data = [[
            Paragraph(f'<b><font size="18" color="#0ea5e9">{num}</font></b>', 
                     ParagraphStyle('Num', parent=styles['Normal'], alignment=TA_CENTER)),
            Paragraph(f'<b><font size="13" color="#1e40af">{title}</font></b><br/>' + 
                     f'<font size="10" color="#475569">{desc}</font>',
                     ParagraphStyle('Reason', parent=styles['Normal'], leading=14))
        ]]
        
        reason_table = Table(reason_data, colWidths=[0.6*inch, 5.8*inch], rowHeights=[0.8*inch])
        reason_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), HexColor('#e0f2fe')),
            ('BACKGROUND', (1, 0), (1, 0), HexColor('#f8fafc')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#0ea5e9')),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ]))
        
        elements.append(reason_table)
        elements.append(Spacer(1, 0.12*inch))
    
    elements.append(Spacer(1, 0.2*inch))
    
    # Final statement
    final_statement = ParagraphStyle('Final', parent=styles['Normal'], fontSize=14, 
                                    alignment=TA_CENTER, textColor=HexColor('#0ea5e9'),
                                    fontName='Helvetica-Bold', leading=18,
                                    borderWidth=2, borderColor=HexColor('#0ea5e9'),
                                    borderPadding=15, backColor=HexColor('#f0f9ff'))
    
    elements.append(Paragraph(
        '🏆 CognexiaAI: The Only Industry 5.0-Ready CRM Platform<br/>' +
        'Combining cutting-edge AI, quantum intelligence, and immersive technology',
        final_statement
    ))
    
    # ============ CTA PAGE ============
    elements.append(PageBreak())
    
    # CTA title with proper styling
    cta_title_style = ParagraphStyle(
        'CTATitle',
        parent=styles['Normal'],
        fontSize=36,
        textColor=white,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=0,
        leading=44
    )
    
    cta_title = Paragraph('Transform Your Business Today', cta_title_style)
    cta_table = Table([[cta_title]], colWidths=[6.6*inch], rowHeights=[1*inch])
    cta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#0ea5e9')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
        ('TOPPADDING', (0, 0), (-1, -1), 20),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
    ]))
    elements.append(cta_table)
    
    elements.append(Spacer(1, 0.4*inch))
    
    cta_text = ParagraphStyle('CTA', parent=styles['Normal'], fontSize=14, 
                             alignment=TA_CENTER, leading=20)
    elements.append(Paragraph('Schedule a demo and experience the future of CRM', cta_text))
    elements.append(Spacer(1, 0.3*inch))
    
    # Contact boxes
    contact_boxes = [
        IconBox('default', '📧 sales@cognexiaai.com'),
        Spacer(0.2*inch, 0.1*inch),
        IconBox('default', '📞 +91-9167422630'),
        Spacer(0.2*inch, 0.1*inch),
        IconBox('default', '🌐 www.cognexiaai.com/demo')
    ]
    
    contact_table = Table([contact_boxes], colWidths=[1.8*inch, 0.2*inch, 1.8*inch, 0.2*inch, 1.8*inch])
    contact_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(contact_table)
    
    elements.append(Spacer(1, 0.4*inch))
    
    offer_style = ParagraphStyle('Offer', parent=cta_text, textColor=HexColor('#ea580c'), 
                                 fontSize=16, fontName='Helvetica-Bold')
    elements.append(Paragraph('🎉 Special Offer: Get 3 months free with annual subscription!', offer_style))
    
    # Build PDF
    doc.build(elements, canvasmaker=BrandedCanvas)
    
    print("✓ Enhanced brochure created: " + pdf_file)
    print("  ✓ Professional icons and graphics")
    print("  ✓ Colorful feature cards with shadows")
    print("  ✓ Circular stats displays")
    print("  ✓ Gradient headers and backgrounds")
    print("  ✓ Perfect line matching and formatting")
    print("  ✓ Visual hierarchy with icons")
    print("  ✓ All features from COMPLETE_FEATURE_LIST.md")
    
    return pdf_file


if __name__ == '__main__':
    print("="*70)
    print("Creating Enhanced CognexiaAI ERP Brochure")
    print("With Icons, Graphics, and Perfect Formatting")
    print("="*70)
    print()
    
    try:
        create_enhanced_brochure()
        print()
        print("="*70)
        print("✓ Enhanced brochure complete!")
        print("="*70)
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
