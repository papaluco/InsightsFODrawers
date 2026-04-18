import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet
} from '@react-pdf/renderer';
import { IPDFReportData } from './PDFContract';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: 2,
    borderBottomColor: '#6366f1',
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: { fontSize: 20, color: '#1e293b' },
  subTitle: { fontSize: 10, marginTop: 4, color: '#64748b' },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    width: '30%',
    textAlign: 'center',
    border: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: { fontSize: 8, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 },
  metricValue: { fontSize: 14 },
  
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
  
  table: { display: 'flex', width: 'auto' },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F5F9', // Slightly darker for better contrast
    borderBottomWidth: 1, 
    borderBottomColor: '#cbd5e1',
    alignItems: 'center',
    height: 24,
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    minHeight: 22,
  },
  totalRow: { 
    backgroundColor: '#F1F5F9', 
    borderTopWidth: 1.5,
    borderTopColor: '#94a3b8',
  },
  
  tableCell: { 
    paddingHorizontal: 4,
    fontSize: 7, 
    flex: 1, 
  },
  headerCellText: {
    color: '#475569', 
    fontWeight: 'bold',
  },
  textLeft: { textAlign: 'left' },
  textCenter: { textAlign: 'center' },

  aboutSection: {
    marginTop: 15,
    paddingTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 7, color: '#94a3b8' }
});

export const PDFRenderer: React.FC<{ data: IPDFReportData }> = ({ data }) => {
  return (
    <Document 
      title={String(data.reportTitle)} 
      author="Schoolie AI"
      subject="Operational Efficiency Analysis"
    >
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.title}>{String(data.reportTitle)}</Text>
            {data.subTitle && <Text style={styles.subTitle}>{String(data.subTitle)}</Text>}
          </View>
          <Text style={{ fontSize: 10 }}>{String(data.districtName)}</Text>
        </View>

        {/* KPI Overview Grid */}
        <View style={styles.metricsGrid}>
          {data.overview.metrics.map((m, i) => (
            <View key={i} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{String(m.label)}</Text>
              <Text style={[
                styles.metricValue, 
                m.status === 'danger' ? { color: '#ef4444' } : 
                m.status === 'success' ? { color: '#10b981' } : {}
              ]}>
                {String(m.primaryValue)}
              </Text>
              {m.secondaryValue && <Text style={{ fontSize: 7, color: '#64748b' }}>{String(m.secondaryValue)}</Text>}
            </View>
          ))}
        </View>

        {/* Content Sections */}
        {data.sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer} wrap={false} >
            {section.title && <Text style={styles.sectionTitle}>{String(section.title)}</Text>}
            
            {section.type === 'table' ? (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  {section.headers?.map((h, hIdx) => (
                    <Text 
                      key={hIdx} 
                      style={[
                        styles.tableCell, 
                        styles.headerCellText,
                        hIdx === 0 ? styles.textLeft : styles.textCenter
                      ]}
                    >
                      {String(h)}
                    </Text>
                  ))}
                </View>

                {section.rows?.map((row, rIdx) => {
                  const isTotal = section.hasTotalRow && rIdx === section.rows!.length - 1;
                  return (
                    <View key={rIdx} style={[styles.tableRow, isTotal ? styles.totalRow : {}]}>
                      {row.map((cell, cIdx) => (
                        <Text 
                          key={cIdx} 
                          style={[
                            styles.tableCell,
                            cIdx === 0 ? styles.textLeft : styles.textCenter,
                            isTotal ? { color: '#000000', fontWeight: 'bold' } : { color: '#475569' }
                          ]}
                        >
                          {String(cell ?? '')}
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.aboutSection}>
                <Text style={{ lineHeight: 1.6, fontSize: 8, color: '#64748b', fontStyle: 'italic' }}>
                  {String(section.content)}
                </Text>
              </View>
            )}
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