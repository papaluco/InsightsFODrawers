import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { IPDFDashReportData } from './PDFDashContract';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: 2,
    borderBottomColor: '#6366f1',
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: { fontSize: 20, color: '#1e293b' },
  subTitle: { fontSize: 10, marginTop: 4, color: '#64748b' },
  districtName: { fontSize: 10},

// Section Styles
  sectionContainer: { 
    marginBottom: 30,
},
  sectionTitle: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#1e293b', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5
  },

  // Metric Card Styles
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metricCard: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    width: '23%',
    textAlign: 'center',
    border: 1,
    borderColor: '#e2e8f0',
    marginRight: '2%', 
    marginBottom: 10,
  },
  metricLabel: { 
    fontSize: 8, 
    color: '#64748b', 
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.8,
    fontWeight: 'bold',
  },
  metricValue: { 
    fontSize: 14, 
  },
  benchmarkText: {
    fontSize: 6,
    color: '#64748b',
    marginTop: 2,
  },

  // Table Styles 
  table: { display: 'flex', width: 'auto' },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F5F9', // Slightly darker for better contrast
    borderBottomWidth: 1, 
    borderBottomColor: '#cbd5e1',
    alignItems: 'center',
    paddingVertical: 6, // Use padding instead of height for flexibility
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#f1f5f9', 
    alignItems: 'center',
    paddingVertical: 4, // Flexible height: row grows with content
    minHeight: 18,
    },
tableCell: { 
    paddingHorizontal: 4,
    fontSize: 7, 
    flex: 1, 
  },
  schoolCell: {
    flex: 2.5, 
    textAlign: 'left',
    paddingLeft: 4,
    fontWeight: 'bold',
    color: '#64748b',
    fontSize: 7,
    lineHeight: 1.2, // Prevents text overlap when names wrap
  },
  headerCellText: {
    color: '#475569', 
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { 
    fontSize: 7, 
    color: '#94a3b8' 
},

   // Trend Chart Style
  chartContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 0,
    backgroundColor: '#ffffff',
    border: 1,
    borderColor: '#f1f5f9',
    borderRadius: 4,
  },
});

export const PDFDashRenderer: React.FC<{ data: IPDFDashReportData }> = ({ data }) => {
  return (
    <Document
     title={String(data.reportTitle)} 
     author="Schoolie AI"
     subject="Workspace Insights Visualizations"
     >
      <Page size="LETTER" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{String(data.reportTitle)}</Text>
                        {data.subTitle && <Text style={styles.subTitle}>{String(data.subTitle)}</Text>}
          </View>
          <Text style={styles.districtName}>{data.districtName}</Text>
        </View>

        {/* Dynamic Sections */}
        {data.sections.map((section, idx) => (
          <View key={idx} style={styles.sectionContainer} wrap={section.type === 'table'} break={section.type === 'table'}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.id === 'kpi' && section.metrics ? (
              <View style={styles.metricsGrid}>
                {section.metrics.map((m, i) => (
                  <View key={i} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{String(m.label)}</Text>
                    <Text style={[
                      styles.metricValue,
                      m.status === 'danger' ? { color: '#ef4444' } : 
                      m.status === 'success' ? { color: '#10b981' } : {}
                    ]}>
                      {String(m.primaryValue)}
                    </Text>
                    {m.benchmark ? (
                      <Text style={styles.benchmarkText}>{m.benchmark}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : section.type === 'table' && section.headers ? (
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader} fixed>
                  {section.headers.map((h, hIdx) => (
                    <Text 
                      key={hIdx} 
                      style={[
                        styles.tableCell, 
                        styles.headerCellText, 
                        hIdx === 0 ? styles.schoolCell : {}
                      ]}
                    >
                      {String(h)}
                    </Text>
                  ))}
                </View>

                {/* Table Rows */}
                {section.rows?.map((row, rIdx) => (
                  <View key={rIdx} style={styles.tableRow}>
                    {row.map((cell, cIdx) => (
                      <Text 
                        key={cIdx} 
                        style={[
                          styles.tableCell, 
                          cIdx === 0 ? styles.schoolCell : {},
                          // Conditional coloring for percentages like in screenshot
                          (cIdx > 0 && String(cell).includes('%')) ? { color: '#10b981' } : {}
                        ]}
                      >
                        {String(cell ?? '')}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Performance Trend Chart */}
            {section.id === 'trend' && section.chartImage ? (
                    <View style={styles.chartContainer}>
                        <Image src={section.chartImage} style={{
                            width: '100%',       // Force it to span the full container width
                            height: 'auto', objectFit: 'contain'
                        }} />
                    </View>
            ) : null}

          </View>
        ))}

        {/* Audit Footer */}
        <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
                Generated by Workspace Insights for {String(data.generatedBy.userName)}
            </Text>
          <Text 
                      style={styles.footerText} 
                      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
                    />
                    <Text style={styles.footerText}>{String(data.generatedBy.timestamp)}</Text>
                  </View>

      </Page>
    </Document>
  );
};