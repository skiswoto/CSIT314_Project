import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { Listing } from './listings';

export const exportToText = async (listings: Listing[]) => {
  try {
    const report = generateTextReport(listings);
    const fileName = `service_report_${getDateStamp()}.txt`;
    
    const file = new File(Paths.document, fileName);
    await file.write(report);

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/plain',
        dialogTitle: 'Export Service Report',
        UTI: 'public.plain-text',
      });
    } else {
      Alert.alert(
        'Export Complete',
        `Report saved to: ${fileName}\n\nNote: Sharing is not available on this device.`,
        [{ text: 'OK' }]
      );
    }

    return { success: true, fileUri: file.uri };
  } catch (error) {
    console.error('Export to text failed:', error);
    Alert.alert('Export Failed', 'Unable to export report. Please try again.');
    return { success: false, error };
  }
};

/**
 * Export listings to CSV format
 */
export const exportToCSV = async (listings: Listing[]) => {
  try {
    const csv = generateCSV(listings);
    const fileName = `service_export_${getDateStamp()}.csv`;
    
    const file = new File(Paths.document, fileName);
    await file.write(csv);

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export CSV Data',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert(
        'Export Complete',
        `CSV saved to: ${fileName}\n\nNote: Sharing is not available on this device.`,
        [{ text: 'OK' }]
      );
    }

    return { success: true, fileUri: file.uri };
  } catch (error) {
    console.error('Export to CSV failed:', error);
    Alert.alert('Export Failed', 'Unable to export CSV. Please try again.');
    return { success: false, error };
  }
};

/**
 * Export analytics summary as JSON
 */
export const exportAnalyticsJSON = async (
  listings: Listing[],
  analytics: {
    totalCompleted: number;
    totalHours: number;
    categoryCounts: Record<string, number>;
    locationCounts: Record<string, number>;
  }
) => {
  try {
    const jsonData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalCompletedServices: analytics.totalCompleted,
        totalVolunteerHours: analytics.totalHours,
        averageHoursPerService: analytics.totalCompleted > 0 
          ? (analytics.totalHours / analytics.totalCompleted).toFixed(2) 
          : 0,
      },
      categoryBreakdown: analytics.categoryCounts,
      locationBreakdown: analytics.locationCounts,
      detailedListings: listings.map(listing => ({
        id: listing.id,
        category: listing.category,
        description: listing.description,
        location: listing.street_address,
        startTime: listing.start_time,
        duration: listing.duration,
        urgency: listing.urgency,
        status: listing.status,
        createdAt: listing.created_at,
      })),
    };

    const fileName = `analytics_export_${getDateStamp()}.json`;
    const file = new File(Paths.document, fileName);
    await file.write(JSON.stringify(jsonData, null, 2));

    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Analytics Data',
      });
    } else {
      Alert.alert(
        'Export Complete',
        `JSON saved to: ${fileName}`,
        [{ text: 'OK' }]
      );
    }

    return { success: true, fileUri: file.uri };
  } catch (error) {
    console.error('Export JSON failed:', error);
    Alert.alert('Export Failed', 'Unable to export JSON. Please try again.');
    return { success: false, error };
  }
};

/**
 * Generate formatted text report
 */
const generateTextReport = (listings: Listing[]): string => {
  const totalHours = listings.reduce(
    (sum, listing) => sum + (parseInt(String(listing.duration)) || 0), 
    0
  );

  const categoryCounts = listings.reduce((acc, listing) => {
    acc[listing.category] = (acc[listing.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
═══════════════════════════════════════════════════════════
                 SERVICE EXPORT REPORT                     
═══════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Total Services: ${listings.length}
Total Hours: ${totalHours}
Average Duration: ${listings.length > 0 ? (totalHours / listings.length).toFixed(2) : 0} hours

───────────────────────────────────────────────────────────
                   CATEGORY BREAKDOWN                      
───────────────────────────────────────────────────────────
${Object.entries(categoryCounts)
  .map(([category, count]) => `${category}: ${count} service(s)`)
  .join('\n')}

───────────────────────────────────────────────────────────
                   DETAILED SERVICES                       
───────────────────────────────────────────────────────────
${listings.map((listing, index) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICE #${index + 1}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${listing.id}
Category: ${listing.category}
Description: ${listing.description || 'N/A'}
Location: ${listing.street_address}
Start Time: ${listing.start_time}
Duration: ${listing.duration} hour(s)
Urgency: ${listing.urgency || 'N/A'}
Status: ${listing.status}
Date Created: ${new Date(listing.created_at).toLocaleDateString()}
`).join('')}
═══════════════════════════════════════════════════════════
                      END OF REPORT                        
═══════════════════════════════════════════════════════════
`.trim();
};

/**
 * Generate CSV data
 */
const generateCSV = (listings: Listing[]): string => {
  const headers = [
    'ID',
    'Category',
    'Description',
    'Address',
    'Start Time',
    'Duration (hours)',
    'Urgency',
    'Status',
    'Created Date',
  ];

  const rows = listings.map(listing => [
    listing.id,
    escapeCSV(listing.category),
    escapeCSV(listing.description || 'N/A'),
    escapeCSV(listing.street_address),
    listing.start_time,
    listing.duration,
    listing.urgency || 'N/A',
    listing.status,
    new Date(listing.created_at).toLocaleDateString(),
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
};

/**
 * Escape CSV special characters
 */
const escapeCSV = (value: string): string => {
  if (!value) return '""';
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
};

/**
 * Get formatted date stamp for filenames
 */
const getDateStamp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * Delete temporary export file
 */
export const deleteExportFile = async (fileUri: string) => {
  try {
    const file = new File(fileUri);
    if (file.exists) {
      await file.delete();
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Delete file failed:', error);
    return { success: false, error };
  }
};