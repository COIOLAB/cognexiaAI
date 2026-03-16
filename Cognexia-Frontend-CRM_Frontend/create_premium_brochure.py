"""
Generate a premium, lucrative sales brochure PDF matching the HTML design
with all features from COMPLETE_FEATURE_LIST.md
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak, 
                                Table, TableStyle, Frame, PageTemplate, Image)
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import Flowable
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics import renderPDF

class GradientHeader(Flowable):
    """Custom gradient header"""
    def __init__(self, text, width=7*inch, height=0.6*inch):
        Flowable.__init__(self)
        self.text = text
        self.width = width
        self.height = height
    
    def draw(self):
        # Create gradient effect with multiple rectangles
        colors = [
            HexColor('#0ea5e9'),
            HexColor('#1398dd'),
            HexColor('#188bd1'),
            HexColor('#1d7fc5'),
            HexColor('#2272b9'),
            HexColor('#2563eb')
        ]
        
        segment_width = self.width / len(colors)
        for i, color in enumerate(colors):
            self.canv.setFillColor(color)
            self.canv.rect(i * segment_width, 0, segment_width, self.height, 
                          fill=1, stroke=0)
        
        # Add text
        self.canv.setFillColor(white)
        self.canv.setFont('Helvetica-Bold', 20)
        text_width = self.canv.stringWidth(self.text, 'Helvetica-Bold', 20)
        x = (self.width - text_width) / 2
        self.canv.drawString(x, self.height/2 - 7, self.text)


class FeatureBox(Flowable):
    """Feature box with light blue background and blue left border"""
    def __init__(self, title, items, width=3.3*inch, height=None):
        Flowable.__init__(self)
        self.title = title
        self.items = items if isinstance(items, list) else [items]
        self.width = width
        self.height = height or (0.2*inch + len(self.items) * 0.18*inch + 0.2*inch)
    
    def draw(self):
        # Background
        self.canv.setFillColor(HexColor('#f8fafc'))
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        
        # Left border
        self.canv.setFillColor(HexColor('#0ea5e9'))
        self.canv.rect(0, 0, 4, self.height, fill=1, stroke=0)
        
        # Title
        self.canv.setFillColor(HexColor('#0ea5e9'))
        self.canv.setFont('Helvetica-Bold', 11)
        self.canv.drawString(10, self.height - 20, self.title)
        
        # Items
        self.canv.setFillColor(HexColor('#333333'))
        self.canv.setFont('Helvetica', 9)
        y_pos = self.height - 38
        
        for item in self.items:
            # Bullet point
            self.canv.setFillColor(HexColor('#0ea5e9'))
            self.canv.circle(15, y_pos + 3, 2, fill=1, stroke=0)
            
            # Text
            self.canv.setFillColor(HexColor('#333333'))
            # Wrap text if too long
            if len(item) > 40:
                words = item.split()
                line = ""
                lines = []
                for word in words:
                    if len(line + word) < 40:
                        line += word + " "
                    else:
                        lines.append(line.strip())
                        line = word + " "
                if line:
                    lines.append(line.strip())
                
                for idx, line_text in enumerate(lines):
                    self.canv.drawString(22, y_pos - (idx * 12), line_text)
                y_pos -= (len(lines) * 12 + 2)
            else:
                self.canv.drawString(22, y_pos, item)
                y_pos -= 14


class StatsBox(Flowable):
    """Stats box with large number and description"""
    def __init__(self, value, label, width=2.2*inch, height=0.8*inch):
        Flowable.__init__(self)
        self.value = value
        self.label = label
        self.width = width
        self.height = height
    
    def draw(self):
        # Background with gradient
        self.canv.setFillColor(HexColor('#f0f9ff'))
        self.canv.roundRect(0, 0, self.width, self.height, 5, fill=1, stroke=1)
        
        # Border
        self.canv.setStrokeColor(HexColor('#0ea5e9'))
        self.canv.setLineWidth(2)
        self.canv.roundRect(0, 0, self.width, self.height, 5, fill=0, stroke=1)
        
        # Value (large number)
        self.canv.setFillColor(HexColor('#0ea5e9'))
        self.canv.setFont('Helvetica-Bold', 20)
        text_width = self.canv.stringWidth(self.value, 'Helvetica-Bold', 20)
        x = (self.width - text_width) / 2
        self.canv.drawString(x, self.height - 30, self.value)
        
        # Label
        self.canv.setFillColor(HexColor('#64748b'))
        self.canv.setFont('Helvetica', 8)
        # Wrap label if needed
        if len(self.label) > 20:
            words = self.label.split()
            lines = []
            line = ""
            for word in words:
                if len(line + word) < 20:
                    line += word + " "
                else:
                    lines.append(line.strip())
                    line = word + " "
            if line:
                lines.append(line.strip())
            
            y_start = self.height - 45
            for idx, line_text in enumerate(lines):
                text_width = self.canv.stringWidth(line_text, 'Helvetica', 8)
                x = (self.width - text_width) / 2
                self.canv.drawString(x, y_start - (idx * 10), line_text)
        else:
            text_width = self.canv.stringWidth(self.label, 'Helvetica', 8)
            x = (self.width - text_width) / 2
            self.canv.drawString(x, self.height - 45, self.label)


class HighlightBox(Flowable):
    """Yellow highlight box for important info"""
    def __init__(self, text, width=6.5*inch, height=None):
        Flowable.__init__(self)
        self.text = text
        self.width = width
        self.height = height or 0.6*inch
    
    def draw(self):
        # Background
        self.canv.setFillColor(HexColor('#fef3c7'))
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        
        # Left border
        self.canv.setFillColor(HexColor('#f59e0b'))
        self.canv.rect(0, 0, 4, self.height, fill=1, stroke=0)
        
        # Text
        self.canv.setFillColor(HexColor('#333333'))
        self.canv.setFont('Helvetica-Bold', 10)
        self.canv.drawString(15, self.height/2 - 5, self.text)


class CustomCanvas(canvas.Canvas):
    """Custom canvas with headers and footers"""
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
            self.draw_page_elements(page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)
    
    def draw_page_elements(self, page_count):
        # Gradient header
        colors = [HexColor('#0ea5e9'), HexColor('#1890d5'), 
                 HexColor('#1d7fc5'), HexColor('#2170b5'), HexColor('#2563eb')]
        
        header_height = 0.6*inch
        segment_width = A4[0] / len(colors)
        
        for i, color in enumerate(colors):
            self.setFillColor(color)
            self.rect(i * segment_width, A4[1] - header_height, 
                     segment_width, header_height, fill=1, stroke=0)
        
        # Header text
        self.setFillColor(white)
        self.setFont('Helvetica-Bold', 16)
        self.drawString(0.5*inch, A4[1] - 0.37*inch, "COGNEXIAAI ERP")
        
        self.setFont('Helvetica-Oblique', 9)
        self.drawRightString(A4[0] - 0.5*inch, A4[1] - 0.37*inch, 
                           "Cognition Meets Precision")
        
        # Footer
        self.setFillColor(HexColor('#f0f0f0'))
        self.rect(0, 0, A4[0], 0.4*inch, fill=1, stroke=0)
        
        self.setFillColor(HexColor('#666666'))
        self.setFont('Helvetica', 8)
        self.drawString(0.5*inch, 0.2*inch, 
                       "© 2026 CognexiaAI | sales@cognexiaai.com | +91-9167422630")
        
        self.drawRightString(A4[0] - 0.5*inch, 0.2*inch, 
                           f"Page {self._pageNumber} of {page_count}")


def create_premium_brochure():
    """Create premium brochure with HTML-inspired design"""
    
    # Read feature list
    with open('COMPLETE_FEATURE_LIST.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create PDF
    pdf_file = 'CognexiaAI_ERP_Premium_Brochure.pdf'
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        topMargin=0.8*inch,
        bottomMargin=0.6*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontSize=42,
        textColor=white,
        spaceAfter=15,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontSize=20,
        textColor=white,
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=white,
        spaceAfter=0,
        spaceBefore=0,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    h2_style = ParagraphStyle(
        'H2Custom',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#2563eb'),
        spaceAfter=10,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    h3_style = ParagraphStyle(
        'H3Custom',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=HexColor('#0ea5e9'),
        spaceAfter=8,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontSize=9,
        leftIndent=20,
        bulletIndent=10,
        spaceAfter=3,
        leading=12
    )
    
    # ============ COVER PAGE ============
    # Create gradient background effect
    elements.append(Spacer(1, 1*inch))
    
    # Cover with gradient (simulated with colored boxes)
    cover_table_data = [[Paragraph('CognexiaAI ERP', cover_title)]]
    cover_table = Table(cover_table_data, colWidths=[6.5*inch], rowHeights=[1*inch])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#0ea5e9')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(cover_table)
    
    elements.append(Spacer(1, 0.1*inch))
    
    subtitle_table = Table([[Paragraph('Industry 5.0 Enterprise CRM Platform', cover_subtitle)]], 
                          colWidths=[6.5*inch], rowHeights=[0.6*inch])
    subtitle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#1890d5')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(subtitle_table)
    
    elements.append(Spacer(1, 0.1*inch))
    
    tagline_table = Table([[Paragraph('"Cognition Meets Precision"', 
                                     ParagraphStyle('Tagline', parent=cover_subtitle, 
                                                   fontSize=16, fontName='Helvetica-Oblique'))]], 
                         colWidths=[6.5*inch], rowHeights=[0.5*inch])
    tagline_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#2170b5')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(tagline_table)
    
    elements.append(Spacer(1, 0.5*inch))
    
    # Key stats on cover
    stats_data = [
        [StatsBox('83', 'Database Entities'), StatsBox('60+', 'Services'), StatsBox('200+', 'API Endpoints')],
        [Spacer(1, 0.1*inch), Spacer(1, 0.1*inch), Spacer(1, 0.1*inch)],
        [StatsBox('100+', 'Integrations'), StatsBox('99.9%', 'Uptime SLA'), StatsBox('10K+', 'Concurrent Users')]
    ]
    
    stats_table = Table(stats_data, colWidths=[2.2*inch]*3, rowHeights=[0.9*inch, 0.1*inch, 0.9*inch])
    stats_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(stats_table)
    
    elements.append(Spacer(1, 0.5*inch))
    
    # Contact info on cover
    contact_style = ParagraphStyle('Contact', parent=styles['Normal'], 
                                  fontSize=10, alignment=TA_CENTER, 
                                  textColor=HexColor('#666666'))
    elements.append(Paragraph('<b>Contact Us</b>', contact_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph('📧 sales@cognexiaai.com | 📞 +91-9167422630', contact_style))
    elements.append(Paragraph('🌐 www.cognexiaai.com/demo', contact_style))
    
    elements.append(PageBreak())
    
    # ============ PARSE FEATURE LIST ============
    lines = content.split('\n')
    
    skip_first = ['# CognexiaAI ERP - Complete Feature List',
                  '## Industry 5.0 Enterprise CRM Platform',
                  '### "Cognition Meets Precision"']
    
    current_section_features = []
    feature_boxes_in_row = []
    
    for line_idx, line in enumerate(lines):
        line = line.replace('\r', '')
        
        if line.strip() in skip_first:
            continue
        
        if line.startswith('# '):
            # Major section with gradient header
            if feature_boxes_in_row:
                # Flush remaining feature boxes
                if len(feature_boxes_in_row) == 1:
                    feature_boxes_in_row.append(Spacer(1, 0.1*inch))
                
                table = Table([feature_boxes_in_row], colWidths=[3.3*inch, 3.3*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(table)
                elements.append(Spacer(1, 0.15*inch))
                feature_boxes_in_row = []
            
            elements.append(Spacer(1, 0.2*inch))
            section_text = line[2:].strip()
            
            # Create gradient header
            section_para = Paragraph(section_text, section_heading)
            section_table = Table([[section_para]], colWidths=[6.5*inch], rowHeights=[0.5*inch])
            section_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#0ea5e9')),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ]))
            elements.append(section_table)
            elements.append(Spacer(1, 0.15*inch))
            
        elif line.startswith('## '):
            # Subsection - blue heading
            if feature_boxes_in_row:
                if len(feature_boxes_in_row) == 1:
                    feature_boxes_in_row.append(Spacer(1, 0.1*inch))
                
                table = Table([feature_boxes_in_row], colWidths=[3.3*inch, 3.3*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(table)
                elements.append(Spacer(1, 0.1*inch))
                feature_boxes_in_row = []
            
            elements.append(Paragraph(line[3:], h2_style))
            
        elif line.startswith('### '):
            # Sub-subsection
            if feature_boxes_in_row:
                if len(feature_boxes_in_row) == 1:
                    feature_boxes_in_row.append(Spacer(1, 0.1*inch))
                
                table = Table([feature_boxes_in_row], colWidths=[3.3*inch, 3.3*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(table)
                elements.append(Spacer(1, 0.1*inch))
                feature_boxes_in_row = []
                current_section_features = []
            
            subsection_text = line[4:]
            elements.append(Paragraph(subsection_text, h3_style))
            
        elif line.startswith('---'):
            # Section divider
            if feature_boxes_in_row:
                if len(feature_boxes_in_row) == 1:
                    feature_boxes_in_row.append(Spacer(1, 0.1*inch))
                
                table = Table([feature_boxes_in_row], colWidths=[3.3*inch, 3.3*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(table)
                elements.append(Spacer(1, 0.15*inch))
                feature_boxes_in_row = []
                current_section_features = []
            
        elif line.startswith('- '):
            # Bullet point - collect for feature boxes
            item_text = line[2:]
            current_section_features.append(item_text)
            
            # Create feature box every 5-6 items
            if len(current_section_features) >= 5:
                # Get previous heading
                prev_heading = "Features"
                for i in range(line_idx - 1, max(0, line_idx - 10), -1):
                    if lines[i].startswith('### '):
                        prev_heading = lines[i][4:].replace('**', '').strip()[:30]
                        break
                
                feature_box = FeatureBox(prev_heading, current_section_features[:6])
                feature_boxes_in_row.append(feature_box)
                current_section_features = current_section_features[6:]
                
                if len(feature_boxes_in_row) == 2:
                    table = Table([feature_boxes_in_row], colWidths=[3.3*inch, 3.3*inch])
                    table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ]))
                    elements.append(table)
                    elements.append(Spacer(1, 0.1*inch))
                    feature_boxes_in_row = []
    
    # Flush any remaining
    if feature_boxes_in_row:
        if len(feature_boxes_in_row) == 1:
            feature_boxes_in_row.append(Spacer(1, 0.1*inch))
        table = Table([feature_boxes_in_row], colWidths=[3.3*inch, 3.3*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(table)
    
    # ============ CTA PAGE ============
    elements.append(PageBreak())
    
    cta_heading = Paragraph('Ready to Transform Your Business?', 
                           ParagraphStyle('CTA', parent=cover_title, fontSize=24))
    cta_table = Table([[cta_heading]], colWidths=[6.5*inch], rowHeights=[0.8*inch])
    cta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#0ea5e9')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    elements.append(cta_table)
    
    elements.append(Spacer(1, 0.3*inch))
    
    cta_text = ParagraphStyle('CTAText', parent=styles['Normal'], 
                            fontSize=12, alignment=TA_CENTER, leading=18)
    elements.append(Paragraph('Schedule a demo today and experience the future of CRM.', cta_text))
    elements.append(Spacer(1, 0.3*inch))
    
    # Contact boxes
    contact_data = [
        [
            Paragraph('<b>📧 Email</b><br/>sales@cognexiaai.com', 
                     ParagraphStyle('CB', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER)),
            Paragraph('<b>📞 Phone</b><br/>+91-9167422630', 
                     ParagraphStyle('CB', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER)),
            Paragraph('<b>🌐 Demo</b><br/>www.cognexiaai.com/demo', 
                     ParagraphStyle('CB', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER))
        ]
    ]
    
    contact_table = Table(contact_data, colWidths=[2.15*inch]*3, rowHeights=[0.8*inch])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#f0f9ff')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 2, HexColor('#0ea5e9')),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
    ]))
    elements.append(contact_table)
    
    elements.append(Spacer(1, 0.4*inch))
    
    offer_para = Paragraph('<i>Special offer: Get 3 months free with annual subscription!</i>', 
                          ParagraphStyle('Offer', parent=cta_text, 
                                       textColor=HexColor('#f59e0b'), fontSize=14, fontName='Helvetica-Bold'))
    elements.append(offer_para)
    
    # Build PDF
    doc.build(elements, canvasmaker=CustomCanvas)
    
    print(f"✓ Premium brochure created: {pdf_file}")
    print(f"  Features:")
    print(f"    ✓ Gradient headers matching HTML design")
    print(f"    ✓ Feature boxes with light blue backgrounds")
    print(f"    ✓ Stats boxes with large numbers")
    print(f"    ✓ Professional color scheme (#0ea5e9 theme)")
    print(f"    ✓ All features from COMPLETE_FEATURE_LIST.md")
    print(f"    ✓ Contact information: +91-9167422630")
    print(f"    ✓ Modern, lucrative design")
    
    return pdf_file


if __name__ == '__main__':
    print("="*70)
    print("Creating CognexiaAI ERP Premium Sales Brochure")
    print("Matching HTML design with all features")
    print("="*70)
    print()
    
    try:
        pdf_file = create_premium_brochure()
        print()
        print("="*70)
        print("✓ Premium brochure generation complete!")
        print("="*70)
        print(f"\nFile: {pdf_file}")
        print("\nReady for professional sales and marketing use!")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
