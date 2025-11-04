// services/export.ts - Simple version
import { Share } from 'react-native';
import { Listing } from './listings';

export const exportToText = (listings: Listing[]) => {
  const report = `
SERVICE EXPORT REPORT
=====================
Generated: ${new Date().toLocaleDateString()}
Total Services: ${listings.length}

${listings.map((listing, index) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICE #${index + 1}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Category: ${listing.category}
Description: ${listing.description}
Location: ${listing.street_address}
Start Time: ${listing.start_time}
Duration: ${listing.duration} hours
Urgency: ${listing.urgency || 'N/A'}
Status: ${listing.status}
`).join('')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF REPORT
  `.trim();

  // Use native share sheet
  Share.share({
    message: report,
    title: 'Completed Services Report'
  });
};

export const exportToCSV = async (listings: Listing[]) => {
  // Create CSV
  const header = 'ID,Category,Description,Address,Start Time,Duration,Urgency,Status\n';
  const rows = listings.map(listing => 
    `${listing.id},"${listing.category}","${listing.description?.replace(/"/g, '""') || 'N/A'}","${listing.street_address}",${listing.start_time},${listing.duration},${listing.urgency || 'N/A'},${listing.status}`
  ).join('\n');
  
  const csv = header + rows;
  
  // Share as text (can be copied to clipboard or shared)
  await Share.share({
    message: csv,
    title: 'Export CSV Data'
  });
};

// PRIMITIVE, will change later on, EXPO file export deprecated