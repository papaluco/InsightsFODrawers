import React from 'react';
import { XIcon, ReportIcon } from '../Common/Icons';
import { getReportSourceStyle } from '../../utils/reportUtils';
import { ReportSource } from '../../data/ReportTypes';

// --- HELPER COMPONENTS ---

const ConfigCard: React.FC<{ 
  title: string; 
  subtitle?: React.ReactNode; 
  children: React.ReactNode; 
  fullWidth?: boolean 
}> = ({ title, subtitle, children, fullWidth }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
    <div className="px-4 py-3 bg-slate-50/50 border-b border-gray-100 flex items-center gap-2">
      <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">{title}</h3>
      
      {subtitle && (
        <div className="flex items-center gap-2">
          
          {typeof subtitle === 'string' ? (
            <span className="text-[11px] text-gray-400 italic font-normal">
              — {subtitle}
            </span>
          ) : (
            <div className="flex items-center">{subtitle}</div>
          )}
        </div>
      )}
    </div>
    <div className="p-4 space-y-4">
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">{label}</span>
    <span className="text-sm font-semibold text-slate-700 leading-tight">{value || '—'}</span>
  </div>
);

const SubHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="pt-2 pb-1 border-b border-gray-100">
    <span className="text-xs font-bold text-primary uppercase tracking-wider">{title}</span>
  </div>
);

const ReportTypeBadge: React.FC<{ source: ReportSource }> = ({ source }) => {
  const style = getReportSourceStyle(source);
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.border}`}>
      {style.text}
    </span>
  );
};

// --- MAIN DRAWER COMPONENT ---

interface ViewConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reportName?: string;
  reportType?: ReportSource;
}

const ViewConfigDrawer: React.FC<ViewConfigDrawerProps> = ({ 
  isOpen, 
  onClose, 
  reportName, 
  // FIX: Using the Enum value instead of a string literal
  reportType = ReportSource.Custom 
}) => {
  const sqlStatement = `SELECT AccessLevelId, AuthenticationMode, CellPhone, CreatedUserId, CreationDate, DefaultRealmId, DefaultRegionId, Email, FailedLoginAttempts, FirstName, Image, LanguagePreference, LastFailedLoginDate, LastLoginDate, LastName, LastPasswordChange, MI, Password FROM DMV_Users WHERE RegionId in (-10, 1502)`;

  const settings = {
    distribute: {
      enabled: true,
      includeHeaders: "Yes",
      format: "CSV UTF-8",
      thresholdEnabled: true,
      thresholdValue: 20,
      customFileEnabled: true,
      customFileName: "ECO_DIS_IMPORT",
      email: true,
      inbox: true,
      ftp: true,
    },
    scheduling: {
      enabled: true,
      isRecurring: true,
      startDate: "04/23/2026",
      endDate: "04/25/2026",
      days: "Monday, Wednesday, Friday",
      time: "3:00 PM"
    }
  };

  const distMethods = [
    settings.distribute.email && "Email",
    settings.distribute.inbox && "Inbox",
    settings.distribute.ftp && "FTP"
  ].filter(Boolean);
  
  const distSubtitle = settings.distribute.enabled ? `${distMethods.join(', ')} enabled` : "";
  const schedSubtitle = !settings.scheduling.enabled ? "" : settings.scheduling.isRecurring ? "Recurring enabled" : "Enabled";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full w-[800px] bg-slate-50 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="px-6 py-5 bg-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ReportIcon className="text-primary" size={24} />
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">{reportName || 'Report Configuration'}</h2>
                  
                </div>
                <p className="text-xs text-gray-500 font-medium pt-0.5">View report parameters and automation settings</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <XIcon size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div className="grid grid-cols-2 gap-5">
              
              {/* SECTION 1: SELECTION */}
              <ConfigCard title="Selection" subtitle={<ReportTypeBadge source={reportType} />}>
                <Field label="Name" value={reportName || "AAA Custom Report Users&Roles"} />
                <Field label="Description" value="AAA Custom Report Users&Roles Desc" />
                <Field label="Owner" value="Hari Nandagopal" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Module" value="System" />
                  <Field label="Data Source" value="Users" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Contains PII" value="Yes" />
                  <Field label="Dynamic Query" value="No" />
                </div>
              </ConfigCard>

              {/* SECTION 2: CONFIGURATION */}
              <ConfigCard title="Configuration">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">SQL</span>
                <div className="p-3 bg-white border border-gray-200 rounded-md">
                  <p className="text-sm font-mono text-slate-700 whitespace-pre-wrap">{sqlStatement}</p>
                </div>
              </ConfigCard>

              {/* SECTION 3: DISTRIBUTION */}
              <ConfigCard title="Distribution" subtitle={distSubtitle}>
                {!settings.distribute.enabled ? (
                  <p className="text-sm italic text-gray-500 py-2">Distribution is not enabled for this report.</p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Format" value={settings.distribute.format} />
                      <Field label="Custom File Name" value={settings.distribute.customFileEnabled ? settings.distribute.customFileName : "None"} />
                      <Field label="Include Headers" value={settings.distribute.includeHeaders} />
                      <Field label="Threshold" value={settings.distribute.thresholdEnabled ? `${settings.distribute.thresholdValue} records` : "None"} />
                    </div>

                    {settings.distribute.email && (
                      <div className="space-y-3">
                        <SubHeader title="Email" />
                        <Field label="External" value="nagarjuna.narni@primeroedge.com" />
                        <div className="grid grid-cols-2 gap-3">
                           <Field label="Users" value="Hari Nandagopal, John Doe" />
                           <Field label="Roles" value="System Administrator" />
                        </div>
                      </div>
                    )}

                    {settings.distribute.inbox && (
                      <div className="space-y-3">
                        <SubHeader title="Inbox" />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Users" value="Hari Nandagopal" />
                          <Field label="Roles" value="Operations Manager" />
                        </div>
                      </div>
                    )}

                    {settings.distribute.ftp && (
                      <div className="space-y-3">
                        <SubHeader title="FTP" />
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Type" value="SFTP" />
                          <div className="col-span-2">
                             <Field label="Host" value="perseusstorageaccprod.blob.core.windows.net" />
                          </div>
                          <Field label="Port" value="22" />
                          <Field label="Folder" value="studentexport" />
                          <div className="col-span-2">
                             <Field label="Username" value="perseusstorageaccprod.grotonpublicssftpuser" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ConfigCard>

              {/* SECTION 4: SCHEDULING */}
              <ConfigCard title="Scheduling" subtitle={schedSubtitle}>
                {!settings.scheduling.enabled ? (
                  <p className="text-sm italic text-gray-500 py-2">Scheduling is not enabled for this report.</p>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Type" value={settings.scheduling.isRecurring ? "Recurring" : "One-time"} />
                      <Field label="Time" value={settings.scheduling.time} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Start Date" value={settings.scheduling.startDate} />
                      <Field label="End Date" value={settings.scheduling.endDate} />
                    </div>
                    {settings.scheduling.isRecurring && (
                      <Field label="Days" value={settings.scheduling.days} />
                    )}
                  </div>
                )}
              </ConfigCard>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewConfigDrawer;