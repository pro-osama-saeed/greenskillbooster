import jsPDF from 'jspdf';
import { Badge } from '@/types/lesson';

interface CertificateData {
  username: string;
  totalPoints: number;
  badges: Badge[];
  completedLessons: number;
  currentStreak: number;
  totalActions: number;
}

export const generateCertificate = (data: CertificateData) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Certificate background
  pdf.setFillColor(240, 248, 245);
  pdf.rect(0, 0, 297, 210, 'F');
  
  // Border
  pdf.setDrawColor(34, 139, 87);
  pdf.setLineWidth(3);
  pdf.rect(10, 10, 277, 190);
  
  // Inner border
  pdf.setLineWidth(1);
  pdf.rect(15, 15, 267, 180);

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(36);
  pdf.setTextColor(34, 139, 87);
  pdf.text('CLIMATE SKILLS CERTIFICATE', 148.5, 40, { align: 'center' });

  // Subtitle
  pdf.setFontSize(14);
  pdf.setTextColor(80, 80, 80);
  pdf.text('This certifies that', 148.5, 55, { align: 'center' });

  // Username
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.username, 148.5, 70, { align: 'center' });

  // Achievement text
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text('has successfully completed the GreenSkill Booster program', 148.5, 85, { align: 'center' });
  pdf.text('demonstrating commitment to climate action and sustainability', 148.5, 92, { align: 'center' });

  // Stats section
  const statsY = 110;
  const statsX = 50;
  const spacing = 45;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 139, 87);
  
  // Lessons Completed
  pdf.text('LESSONS', statsX, statsY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.completedLessons.toString(), statsX, statsY + 8);

  // Badges Earned
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 139, 87);
  pdf.text('BADGES', statsX + spacing, statsY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.badges.length.toString(), statsX + spacing, statsY + 8);

  // Total Points
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 139, 87);
  pdf.text('POINTS', statsX + spacing * 2, statsY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.totalPoints.toString(), statsX + spacing * 2, statsY + 8);

  // Current Streak
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 139, 87);
  pdf.text('DAY STREAK', statsX + spacing * 3, statsY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.currentStreak.toString(), statsX + spacing * 3, statsY + 8);

  // Actions Taken
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 139, 87);
  pdf.text('ACTIONS', statsX + spacing * 4, statsY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.totalActions.toString(), statsX + spacing * 4, statsY + 8);

  // Date and signature line
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Issued on ${date}`, 148.5, 145, { align: 'center' });

  // Signature line
  pdf.setLineWidth(0.5);
  pdf.line(100, 160, 195, 160);
  pdf.setFontSize(9);
  pdf.text('GreenSkill Booster Program Director', 148.5, 165, { align: 'center' });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('GreenSkill Booster | Climate Action Education Platform', 148.5, 185, { align: 'center' });
  pdf.text('Certificate ID: ' + Date.now().toString(36).toUpperCase(), 148.5, 190, { align: 'center' });

  // Save the PDF
  pdf.save(`climate-certificate-${data.username}-${Date.now()}.pdf`);
};
