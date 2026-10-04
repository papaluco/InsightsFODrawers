// JSON Payload Template demo (prototype reference for NXT-77087).
//
// Sections 2 + 3 (ViewerHints + JsonPayloadViewer) are self-contained and can be
// copied into the production app on their own. They only need the `react` and
// `lucide-react` imports below. Sections 1 + 4 are prototype-only.

import { useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Info,
  Minus,
} from 'lucide-react';

// ===== SECTION 1: SAMPLE PAYLOADS (devs: add new samples here) =====
//
// To add a new sample:
//   1. Copy the report's JSON payload exactly as the app stores it.
//   2. Append a new entry to SAMPLE_PAYLOADS below with a `name`, a `reportType`
//      ("Managed View" or "Power BI"), and the JSON pasted as `payload`.
//   3. That's it. The demo page dropdown picks it up automatically, and the
//      viewer needs no configuration to display it.

export interface SamplePayload {
  name: string;
  reportType: 'Managed View' | 'Power BI';
  payload: unknown;
}

export const SAMPLE_PAYLOADS: SamplePayload[] = [
  {
    name: 'MV – Applications (JasTestApplicationsMV)',
    reportType: 'Managed View',
    payload: {
      "type": "CustomView",
      "customViewId": null,
      "id": "47a50f22-087f-4d2d-86c5-893ffe527ef9",
      "filterCriteria": {
        "pageFilters": {
          "programYearId": 35,
          "PageNumber": 1,
          "PageSize": 10,
          "SortColumn": "applicationNumber",
          "SortOrder": 1,
          "ColumnFilters": [],
          "otherBenefitIds": [],
          "showOnlyAppsWithStateEligibility": false,
          "infoSharing": -1,
          "filters": {
            "applicationNumber": "",
            "entryMethodIds": [],
            "eligibilityIds": [],
            "programYearIds": [],
            "basisCds": [],
            "applicationLanguageCds": [],
            "applicationStatusId": [],
            "applicationStatusChangeDate": null,
            "applicationReceivedDate": null,
            "studentName": "",
            "externalPersonId": "",
            "guardianName": "",
            "householdIncomeAmount": 0,
            "incomeFrequencyId": [],
            "houseHoldSize": 0,
            "gradeIds": [],
            "siteCodes": [],
            "showActiveBeniftsApplicationsOnly": false,
            "showErrorProneApplicationsOnly": false
          }
        },
        "gridColumnfilters": [],
        "tableFilters": {
          "take": 10,
          "skip": 0
        }
      },
      "selectedColumns": [
        {
          "title": "Application #",
          "field": "applicationNumber",
          "width": 150,
          "hidden": false
        },
        {
          "title": "Entry Method",
          "field": "entryMethod",
          "width": 150,
          "hidden": false
        },
        {
          "title": "Eligibility",
          "field": "eligibilityDesc",
          "width": 230,
          "hidden": false
        },
        {
          "field": "basisDesc",
          "title": "Basis",
          "width": 230,
          "hidden": false
        },
        {
          "title": "Status",
          "field": "applicationStatusDesc",
          "width": 200,
          "hidden": false
        },
        {
          "field": "studentName",
          "title": "Student Name",
          "sortable": false,
          "hidden": false,
          "width": 250
        },
        {
          "field": "applicationDetails",
          "title": "Action(s)",
          "filterable": false,
          "sortable": false,
          "width": 150
        }
      ],
      "viewName": "JasTestApplicationsMV",
      "userId": 5275,
      "dataModelName": "applicationsAll",
      "regionId": 33,
      "sortBy": "applicationNumber",
      "sortOrder": 1,
      "isFavorite": false,
      "isSystem": true,
      "isSharedView": false,
      "isMVRLinked": null,
      "sharedViewType": null,
      "customViewShare": {
        "userIds": [],
        "groupIds": [],
        "roleIds": []
      },
      "includeFilters": true,
      "columnOrder": true,
      "columnDisplayOrder": [
        {
          "title": "Application #",
          "field": "applicationNumber",
          "width": 150,
          "hidden": false
        },
        {
          "title": "Entry Method",
          "field": "entryMethod",
          "width": 150,
          "hidden": false
        },
        {
          "title": "Eligibility",
          "field": "eligibilityDesc",
          "width": 230,
          "hidden": false
        },
        {
          "field": "basisDesc",
          "title": "Basis",
          "width": 230,
          "hidden": false
        },
        {
          "title": "Home Phone #",
          "field": "homePhoneNumber",
          "hidden": true,
          "sortable": false,
          "width": 230
        },
        {
          "title": "Work Phone #",
          "field": "workPhoneNumber",
          "hidden": true,
          "sortable": false,
          "width": 230
        },
        {
          "title": "Applicant Email",
          "field": "email",
          "hidden": true,
          "sortable": false,
          "width": 230
        },
        {
          "title": "Applicant Address",
          "field": "address",
          "hidden": true,
          "sortable": false,
          "width": 250
        },
        {
          "title": "Status",
          "field": "applicationStatusDesc",
          "width": 200,
          "hidden": false
        },
        {
          "field": "applicationReceivedDate",
          "title": "Received Date",
          "hidden": true,
          "width": 150
        },
        {
          "field": "processedDate",
          "title": "Processed Date",
          "hidden": true,
          "width": 150
        },
        {
          "field": "studentName",
          "title": "Student Name",
          "sortable": false,
          "hidden": false,
          "width": 250
        },
        {
          "field": "externalPersonId",
          "title": "Student ID",
          "hidden": true,
          "sortable": false,
          "width": 150
        },
        {
          "field": "guardianName",
          "title": "Guardian Name",
          "hidden": true,
          "width": 150
        },
        {
          "field": "householdIncomeAmount",
          "title": "Household Income",
          "hidden": true,
          "width": 150
        },
        {
          "field": "houseHoldSize",
          "title": "Household Size",
          "hidden": true,
          "width": 150
        },
        {
          "field": "languageDesc",
          "title": "Language",
          "hidden": true,
          "width": 150
        },
        {
          "field": "academicYearDesc",
          "title": "Academic Year",
          "hidden": true,
          "sortable": false,
          "width": 150
        },
        {
          "field": "gradeCd",
          "title": "Grade",
          "hidden": true,
          "sortable": false,
          "width": 150
        },
        {
          "field": "siteName",
          "title": "Site Name",
          "hidden": true,
          "sortable": false,
          "width": 150
        },
        {
          "field": "siteCode",
          "title": "Site Code",
          "hidden": true,
          "sortable": false,
          "width": 150
        },
        {
          "title": "Benefits",
          "field": "benefits",
          "hidden": true,
          "filterable": true,
          "sortable": false,
          "width": 150
        },
        {
          "title": "Info Sharing",
          "field": "infoSharing",
          "hidden": true,
          "filterable": true,
          "sortable": true,
          "width": 150
        }
      ]
    },
  },
  {
    name: 'MV – Users, Shared (JASTestView2)',
    reportType: 'Managed View',
    payload: {
      "type": "CustomView",
      "customViewId": null,
      "id": "5a2f07d3-cf2a-4b32-83c1-3b1d183e0f3a",
      "filterCriteria": {
        "pageFilters": {
          "statusId": 1,
          "createFilter": "",
          "modifyFilter": ""
        },
        "gridColumnfilters": [],
        "tableFilters": {
          "take": 10,
          "skip": 0
        }
      },
      "selectedColumns": [
        {
          "field": "email",
          "title": "Email",
          "width": "19%",
          "hidden": false
        },
        {
          "field": "lastName",
          "title": "Last Name",
          "width": "14%",
          "hidden": false
        },
        {
          "field": "firstName",
          "title": "First Name",
          "width": "14%",
          "hidden": false
        },
        {
          "field": "roles",
          "title": "Role(s)",
          "width": "20%",
          "sortable": true,
          "filterable": true,
          "hidden": false
        },
        {
          "field": "sites",
          "title": "Access To",
          "width": "20%",
          "sortable": true,
          "filterable": true,
          "hidden": false
        },
        {
          "field": "creationDate",
          "title": "Creation Date",
          "width": "20%",
          "hidden": false
        },
        {
          "field": "lastLoginDate",
          "title": "Last Login Date",
          "width": "20%",
          "hidden": false
        },
        {
          "field": "lastFailedLoginDate",
          "title": "Last Failed Login Date",
          "width": "20%",
          "hidden": false
        },
        {
          "field": "updateDate",
          "title": "Updated Date",
          "width": "20%",
          "hidden": false
        },
        {
          "field": "actions",
          "title": "Action(s)",
          "width": "12%",
          "sortable": false,
          "filterable": false,
          "locked": true,
          "hidden": false
        }
      ],
      "viewName": "JASTestView2",
      "userId": 5275,
      "dataModelName": "users",
      "regionId": 2,
      "sortBy": "lastName",
      "sortOrder": 0,
      "isFavorite": true,
      "isSystem": false,
      "isSharedView": true,
      "isMVRLinked": null,
      "sharedViewType": "user",
      "customViewShare": {
        "userIds": [
          5329
        ],
        "groupIds": [],
        "roleIds": []
      },
      "includeFilters": null,
      "columnOrder": null,
      "columnDisplayOrder": null
    },
  },
  {
    name: 'MV – Users (TestView1)',
    reportType: 'Managed View',
    payload: {
      "type": "CustomView",
      "customViewId": null,
      "id": "bd52a013-5583-439e-9cf2-0af0c605e089",
      "filterCriteria": {
        "pageFilters": {
          "statusId": 1,
          "createFilter": "",
          "modifyFilter": ""
        },
        "tableFilters": {
          "take": 10,
          "skip": 0
        }
      },
      "selectedColumns": [
        {
          "field": "email",
          "title": "Email",
          "width": "19%"
        },
        {
          "field": "lastName",
          "title": "Last Name",
          "width": "14%"
        },
        {
          "field": "firstName",
          "title": "First Name",
          "width": "14%"
        },
        {
          "field": "roles",
          "title": "Role(s)",
          "width": "20%",
          "sortable": true,
          "filterable": true
        },
        {
          "field": "sites",
          "title": "Access To",
          "width": "20%",
          "sortable": true,
          "filterable": true
        },
        {
          "field": "actions",
          "title": "Action(s)",
          "width": "12%",
          "sortable": false,
          "filterable": false,
          "locked": true
        }
      ],
      "viewName": "TestView1",
      "userId": 6385,
      "dataModelName": "users",
      "regionId": 33,
      "sortBy": "lastName",
      "sortOrder": 1,
      "isFavorite": true,
      "isSystem": false,
      "isSharedView": false,
      "isMVRLinked": null,
      "sharedViewType": null,
      "customViewShare": {
        "userIds": [],
        "groupIds": [],
        "roleIds": []
      },
      "includeFilters": false,
      "columnOrder": false,
      "columnDisplayOrder": [
        {
          "field": "email",
          "title": "Email",
          "width": "19%"
        },
        {
          "field": "lastName",
          "title": "Last Name",
          "width": "14%"
        },
        {
          "field": "firstName",
          "title": "First Name",
          "width": "14%"
        },
        {
          "field": "roles",
          "title": "Role(s)",
          "width": "20%",
          "sortable": true,
          "filterable": true
        },
        {
          "field": "sites",
          "title": "Access To",
          "width": "20%",
          "sortable": true,
          "filterable": true
        },
        {
          "field": "cellPhone",
          "title": "Cell Phone",
          "width": "18%",
          "hidden": true
        },
        {
          "field": "creationDate",
          "title": "Creation Date",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "lastLoginDate",
          "title": "Last Login Date",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "lastFailedLoginDate",
          "title": "Last Failed Login Date",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "updateBy",
          "title": "Updated By",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "updateDate",
          "title": "Updated Date",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "userName",
          "title": "User Name",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "workPhone",
          "title": "Work Phone",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "language",
          "title": "Language",
          "width": "20%",
          "hidden": true
        },
        {
          "field": "status",
          "title": "Status",
          "width": "20%",
          "hidden": true
        }
      ]
    },
  },
  {
    name: 'PBI – SNP Report',
    reportType: 'Power BI',
    payload: {
      "siteTypeIds": [],
      "siteIds": [],
      "programType": "SNP",
      "satelliteSchools": "No",
      "isEnrollmentSite": "No",
      "showDistrictSummary": "No",
      "DateRange": "Today",
      "inclCCBreakout": "No"
    },
  },
];

// ===== SECTION 2: VIEWER HINTS =====

export interface ViewerHints {
  /** Label overrides. Key is a field name or dot path (e.g. "filterCriteria.pageFilters"). */
  labels?: Record<string, string>;
  /** Fields to hide: field names, dot paths, or wildcard paths like "*.width" (any depth). */
  hidden?: string[];
  /** Top-level keys to show first, in this order. */
  order?: string[];
  /** Per-field override for "Not Selected" (field name or dot path). */
  emptyText?: Record<string, string>;
  /** Maps raw codes to display text for a field (field name or dot path). */
  valueMaps?: Record<string, Record<string, string>>;
}

// Starting proposal shared by ALL report types (MV and PBI). PO and devs should
// review these defaults before production use.
export const DEFAULT_HINTS: ViewerHints = {
  hidden: [
    'id',
    'customViewId',
    'isMVRLinked',
    'tableFilters',
    'gridColumnfilters',
    '*.PageNumber',
    '*.PageSize',
    '*.width',
    '*.locked',
    '*.sortable',
    '*.filterable',
  ],
  labels: {
    filterCriteria: 'Filters',
    pageFilters: 'Page Filters',
    selectedColumns: 'Selected Columns',
    columnDisplayOrder: 'Column Display Order',
    customViewShare: 'Sharing',
    dataModelName: 'Data Model',
    isSystem: 'System View',
    isSharedView: 'Shared View',
  },
  emptyText: {
    'customViewShare.userIds': 'Not Shared',
    'customViewShare.groupIds': 'Not Shared',
    'customViewShare.roleIds': 'Not Shared',
  },
  order: ['viewName', 'dataModelName', 'type'],
  // No real code mappings yet.
  valueMaps: {},
};

// ===== SECTION 3: JsonPayloadViewer COMPONENT (exported, portable) =====

export interface JsonPayloadViewerProps {
  /** Parsed object or a JSON string. */
  data: unknown;
  hints?: ViewerHints;
  title?: string;
  defaultView?: 'readable' | 'raw';
  className?: string;
}

type PlainObject = Record<string, unknown>;

interface ResolvedHints {
  labels: Record<string, string>;
  hidden: string[];
  order: string[];
  emptyText: Record<string, string>;
  valueMaps: Record<string, Record<string, string>>;
}

interface ViewerContext {
  isHidden: (path: string) => boolean;
  label: (path: string, key: string) => string;
  emptyText: (path: string, key: string) => string;
  mapValue: (path: string, key: string, value: unknown) => string | undefined;
}

interface FieldNode {
  kind: 'field';
  key: string;
  path: string;
  label: string;
  value: unknown;
}

interface ObjectNode {
  kind: 'object';
  key: string;
  path: string;
  label: string;
  fields: FieldNode[];
  sections: SectionNode[];
}

interface ColumnsNode {
  kind: 'columns';
  key: string;
  path: string;
  label: string;
  shown: string[];
  hidden: string[];
}

interface TableNode {
  kind: 'table';
  key: string;
  path: string;
  label: string;
  columns: { key: string; label: string }[];
  rows: PlainObject[];
}

type SectionNode = ObjectNode | ColumnsNode | TableNode;

const CHIP_LIMIT = 10;
const DEFAULT_EMPTY_TEXT = 'Not Selected';

const ABBREVIATIONS: Record<string, string> = {
  id: 'ID',
  ids: 'IDs',
  cd: 'Code',
  cds: 'Codes',
  desc: 'Description',
  incl: 'Include',
};

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwn = (rec: object, key: string) => Object.prototype.hasOwnProperty.call(rec, key);

// Looks up a hint by exact dot path first, then by plain field name.
function lookupHint<T>(rec: Record<string, T>, path: string, key: string): T | undefined {
  if (hasOwn(rec, path)) return rec[path];
  if (hasOwn(rec, key)) return rec[key];
  return undefined;
}

const isEmptyValue = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0) ||
  (isPlainObject(value) && Object.keys(value).length === 0);

const isColumnDefArray = (arr: unknown[]): arr is PlainObject[] =>
  arr.length > 0 && arr.every((item) => isPlainObject(item) && 'field' in item && 'title' in item);

const isObjectArray = (arr: unknown[]): arr is PlainObject[] =>
  arr.length > 0 && arr.every(isPlainObject);

/** "dateRange" / "DateRange" / "date_range" -> "Date Range"; applies abbreviations and drops a leading "is". */
export function formatLabel(key: string): string {
  const words = key
    .replace(/[_\-\s]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (words.length > 1 && words[0].toLowerCase() === 'is') words.shift();

  return words
    .map((word) => ABBREVIATIONS[word.toLowerCase()] ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function mergeHints(extra?: ViewerHints): ResolvedHints {
  const valueMaps: Record<string, Record<string, string>> = { ...DEFAULT_HINTS.valueMaps };
  for (const [field, map] of Object.entries(extra?.valueMaps ?? {})) {
    valueMaps[field] = { ...valueMaps[field], ...map };
  }
  return {
    labels: { ...DEFAULT_HINTS.labels, ...extra?.labels },
    hidden: [...(DEFAULT_HINTS.hidden ?? []), ...(extra?.hidden ?? [])],
    order: Array.from(new Set([...(extra?.order ?? []), ...(DEFAULT_HINTS.order ?? [])])),
    emptyText: { ...DEFAULT_HINTS.emptyText, ...extra?.emptyText },
    valueMaps,
  };
}

// A pattern without dots matches that field name at any depth. A dotted pattern
// matches the full path, where a "*" segment matches one or more path segments.
function compileHiddenMatcher(patterns: string[]): (path: string) => boolean {
  const names = new Set<string>();
  const regexes: RegExp[] = [];
  for (const pattern of patterns) {
    if (!pattern.includes('.')) {
      names.add(pattern);
      continue;
    }
    const source = pattern
      .split('.')
      .map((seg) => (seg === '*' ? '[^.]+(?:\\.[^.]+)*' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      .join('\\.');
    regexes.push(new RegExp(`^${source}$`));
  }
  return (path) => {
    const key = path.slice(path.lastIndexOf('.') + 1);
    return names.has(key) || regexes.some((re) => re.test(path));
  };
}

function createContext(hints: ResolvedHints): ViewerContext {
  const isHidden = compileHiddenMatcher(hints.hidden);
  return {
    isHidden,
    label: (path, key) => lookupHint(hints.labels, path, key) ?? formatLabel(key),
    emptyText: (path, key) => lookupHint(hints.emptyText, path, key) ?? DEFAULT_EMPTY_TEXT,
    mapValue: (path, key, value) => {
      const map = lookupHint(hints.valueMaps, path, key);
      if (!map || value === null || value === undefined) return undefined;
      const code = String(value);
      return hasOwn(map, code) ? map[code] : undefined;
    },
  };
}

function orderKeys(obj: PlainObject, order: string[]): string[] {
  const keys = Object.keys(obj);
  const first = order.filter((k) => keys.includes(k));
  return [...first, ...keys.filter((k) => !first.includes(k))];
}

function buildGroup(
  obj: PlainObject,
  parentPath: string,
  ctx: ViewerContext,
  keys: string[] = Object.keys(obj)
): { fields: FieldNode[]; sections: SectionNode[] } {
  const fields: FieldNode[] = [];
  const sections: SectionNode[] = [];

  for (const key of keys) {
    const path = parentPath ? `${parentPath}.${key}` : key;
    if (ctx.isHidden(path)) continue;

    const value = obj[key];
    const label = ctx.label(path, key);

    if (isPlainObject(value) && Object.keys(value).length > 0) {
      const group = buildGroup(value, path, ctx);
      // Omit sections that are empty once hidden fields are removed.
      if (group.fields.length > 0 || group.sections.length > 0) {
        sections.push({ kind: 'object', key, path, label, ...group });
      }
      continue;
    }

    if (Array.isArray(value) && isColumnDefArray(value)) {
      const shown: string[] = [];
      const hidden: string[] = [];
      for (const col of value) {
        (col.hidden === true ? hidden : shown).push(String(col.title));
      }
      sections.push({ kind: 'columns', key, path, label, shown, hidden });
      continue;
    }

    if (Array.isArray(value) && isObjectArray(value)) {
      const columnKeys: string[] = [];
      for (const row of value) {
        for (const k of Object.keys(row)) {
          if (!columnKeys.includes(k) && !ctx.isHidden(`${path}.${k}`)) columnKeys.push(k);
        }
      }
      if (columnKeys.length > 0) {
        sections.push({
          kind: 'table',
          key,
          path,
          label,
          columns: columnKeys.map((k) => ({ key: k, label: ctx.label(`${path}.${k}`, k) })),
          rows: value,
        });
      }
      continue;
    }

    fields.push({ kind: 'field', key, path, label, value });
  }

  return { fields, sections };
}

type DisplayKind = 'yes' | 'no' | 'text';

function toDisplay(value: unknown, mapped?: string): { kind: DisplayKind; text: string } {
  if (mapped !== undefined) return { kind: 'text', text: mapped };
  if (typeof value === 'boolean') return value ? { kind: 'yes', text: 'Yes' } : { kind: 'no', text: 'No' };
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^yes$/i.test(trimmed)) return { kind: 'yes', text: 'Yes' };
    if (/^no$/i.test(trimmed)) return { kind: 'no', text: 'No' };
    const date = formatIsoDate(trimmed);
    if (date) return { kind: 'text', text: date };
    return { kind: 'text', text: value };
  }
  if (typeof value === 'number') return { kind: 'text', text: String(value) };
  if (typeof value === 'object' && value !== null) return { kind: 'text', text: safeStringify(value) };
  return { kind: 'text', text: String(value) };
}

// Only strings are treated as dates; numbers never are.
function formatIsoDate(text: string): string | null {
  const dateOnly = ISO_DATE_RE.exec(text);
  if (dateOnly) {
    // Build a local date so "2026-09-30" doesn't shift a day in US time zones.
    const d = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (ISO_DATE_TIME_RE.test(text)) {
    const d = new Date(text);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return null;
}

function safeStringify(value: unknown, space?: number): string {
  try {
    return JSON.stringify(value, null, space) ?? '';
  } catch {
    return String(value);
  }
}

// ---- Presentational pieces ----

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1';

function NotSelected({ text }: { text: string }) {
  return <span className="italic text-gray-400">{text}</span>;
}

function YesNoBadge({ kind }: { kind: 'yes' | 'no' }) {
  const isYes = kind === 'yes';
  const Icon = isYes ? Check : Minus;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isYes ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
      }`}
    >
      <Icon size={12} aria-hidden="true" />
      {isYes ? 'Yes' : 'No'}
    </span>
  );
}

function DisplayText({ value, mapped }: { value: unknown; mapped?: string }) {
  const display = toDisplay(value, mapped);
  if (display.kind === 'yes' || display.kind === 'no') return <YesNoBadge kind={display.kind} />;
  return <span className="break-words text-gray-900">{display.text}</span>;
}

function Chips({ items }: { items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, CHIP_LIMIT);
  const remaining = items.length - CHIP_LIMIT;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {visible.map((item, i) => (
        <li key={`${item}-${i}`} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
          {item}
        </li>
      ))}
      {remaining > 0 && (
        <li>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-amber-700 underline-offset-2 hover:underline ${focusRing}`}
          >
            {expanded ? 'Show less' : `+${remaining} more`}
          </button>
        </li>
      )}
    </ul>
  );
}

function FieldValue({ path, fieldKey, value, ctx }: { path: string; fieldKey: string; value: unknown; ctx: ViewerContext }) {
  if (isEmptyValue(value)) return <NotSelected text={ctx.emptyText(path, fieldKey)} />;
  if (Array.isArray(value)) {
    return <Chips items={value.map((item) => toDisplay(item, ctx.mapValue(path, fieldKey, item)).text)} />;
  }
  return <DisplayText value={value} mapped={ctx.mapValue(path, fieldKey, value)} />;
}

function FieldGrid({ fields, ctx }: { fields: FieldNode[]; ctx: ViewerContext }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.path} className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{f.label}</dt>
          <dd className="mt-1 text-sm">
            <FieldValue path={f.path} fieldKey={f.key} value={f.value} ctx={ctx} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CollapsibleSection({ title, level, children }: { title: string; level: number; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const contentId = useId();
  const isTop = level === 0;
  const Heading = isTop ? 'h3' : 'h4';

  return (
    <section className={isTop ? 'rounded-xl border border-gray-200 bg-white' : 'border-l-2 border-gray-200 pl-4'}>
      <Heading>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={contentId}
          className={`flex w-full items-center justify-between gap-3 rounded-xl text-left ${
            isTop ? 'px-5 py-4 text-base font-bold text-gray-900 hover:bg-gray-50' : 'py-1 text-sm font-semibold text-gray-800'
          } ${focusRing}`}
        >
          <span>{title}</span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </Heading>
      <div id={contentId} hidden={!open} className={isTop ? 'space-y-5 border-t border-gray-100 px-5 py-4' : 'mt-3 space-y-4'}>
        {children}
      </div>
    </section>
  );
}

function ColumnGroup({ title, items, muted }: { title: string; items: string[]; muted: boolean }) {
  const Icon = muted ? EyeOff : Eye;
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon size={14} aria-hidden="true" />
        {title} ({items.length})
      </p>
      <ol className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ${
              muted ? 'bg-gray-50 text-gray-500 ring-gray-200' : 'bg-amber-50 text-amber-900 ring-amber-200'
            }`}
          >
            <span className="text-[10px] font-semibold opacity-60">{i + 1}.</span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

function DataTable({ node, ctx }: { node: TableNode; ctx: ViewerContext }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {node.columns.map((c) => (
              <th key={c.key} scope="col" className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-gray-600">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {node.rows.map((row, i) => (
            <tr key={i}>
              {node.columns.map((c) => (
                <td key={c.key} className="px-3 py-2 align-top">
                  <FieldValue path={`${node.path}.${c.key}`} fieldKey={c.key} value={row[c.key]} ctx={ctx} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBody({ node, ctx, level }: { node: SectionNode; ctx: ViewerContext; level: number }) {
  if (node.kind === 'columns') {
    return (
      <div className="space-y-4">
        {node.shown.length > 0 && <ColumnGroup title="Shown" items={node.shown} muted={false} />}
        {node.hidden.length > 0 && <ColumnGroup title="Hidden" items={node.hidden} muted />}
      </div>
    );
  }
  if (node.kind === 'table') return <DataTable node={node} ctx={ctx} />;
  return (
    <>
      {node.fields.length > 0 && <FieldGrid fields={node.fields} ctx={ctx} />}
      {node.sections.map((child) => (
        <CollapsibleSection key={child.path} title={child.label} level={level + 1}>
          <SectionBody node={child} ctx={ctx} level={level + 1} />
        </CollapsibleSection>
      ))}
    </>
  );
}

// navigator.clipboard only exists on secure origins (https / localhost), so fall
// back to a hidden textarea + execCommand for plain-http hosts.
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or unavailable; try the fallback below.
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const handleCopy = async () => {
    setStatus((await copyText(text)) ? 'copied' : 'failed');
    setTimeout(() => setStatus('idle'), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 ${
        status === 'failed' ? 'text-red-700' : 'text-gray-700'
      } ${focusRing}`}
    >
      {status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy'}</span>
    </button>
  );
}

function RawBlock({ text }: { text: string }) {
  return (
    <div className="relative">
      <div className="absolute right-3 top-3">
        <CopyButton text={text} />
      </div>
      <pre className="max-h-[32rem] overflow-auto rounded-xl bg-gray-50 p-4 pr-24 font-mono text-xs leading-relaxed text-gray-800 ring-1 ring-gray-200">
        {text}
      </pre>
    </div>
  );
}

export function JsonPayloadViewer({ data, hints, title, defaultView = 'readable', className = '' }: JsonPayloadViewerProps) {
  const [view, setView] = useState<'readable' | 'raw'>(defaultView);

  const parsed = useMemo((): { ok: true; value: unknown } | { ok: false; message: string; raw: string } => {
    if (typeof data !== 'string') return { ok: true, value: data };
    try {
      return { ok: true, value: JSON.parse(data) };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Invalid JSON', raw: data };
    }
  }, [data]);

  const resolved = useMemo(() => mergeHints(hints), [hints]);
  const ctx = useMemo(() => createContext(resolved), [resolved]);

  const model = useMemo(() => {
    if (!parsed.ok) return null;
    const root: PlainObject = isPlainObject(parsed.value) ? parsed.value : { value: parsed.value };
    return buildGroup(root, '', ctx, orderKeys(root, resolved.order));
  }, [parsed, ctx, resolved.order]);

  const rawText = parsed.ok ? safeStringify(parsed.value, 2) : parsed.raw;

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900">{title ?? 'Report Configuration'}</h2>
        {parsed.ok && (
          <div role="group" aria-label="Display format" className="inline-flex rounded-lg bg-gray-100 p-1">
            {(['readable', 'raw'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                aria-pressed={view === mode}
                className={`rounded-md px-3 py-1 text-sm font-semibold transition-colors ${focusRing} ${
                  view === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {mode === 'readable' ? 'Readable' : 'Raw JSON'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 p-6">
        {!parsed.ok && (
          <>
            <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
              <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">This configuration couldn't be displayed.</p>
                <p className="mt-1">The text isn't valid JSON ({parsed.message}). The original text is shown below.</p>
              </div>
            </div>
            <RawBlock text={rawText} />
          </>
        )}

        {parsed.ok && view === 'raw' && <RawBlock text={rawText} />}

        {parsed.ok && view === 'readable' && model && (
          <>
            {model.fields.length > 0 && (
              <CollapsibleSection title="General" level={0}>
                <FieldGrid fields={model.fields} ctx={ctx} />
              </CollapsibleSection>
            )}
            {model.sections.map((section) => (
              <CollapsibleSection key={section.path} title={section.label} level={0}>
                <SectionBody node={section} ctx={ctx} level={0} />
              </CollapsibleSection>
            ))}
            {model.fields.length === 0 && model.sections.length === 0 && (
              <p className="text-sm">
                <NotSelected text="Nothing to display." />
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===== SECTION 4: DEMO PAGE (prototype only) =====

const CUSTOM_OPTION = 'custom';

const JsonPayloadDemoPage = () => {
  const [selection, setSelection] = useState('0');
  const [pasted, setPasted] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [customResult, setCustomResult] = useState<{ value: unknown; renderId: number } | null>(null);
  const selectId = useId();
  const textareaId = useId();

  const isCustom = selection === CUSTOM_OPTION;
  const sample = isCustom ? undefined : SAMPLE_PAYLOADS[Number(selection)];

  const handleRender = () => {
    try {
      const value: unknown = JSON.parse(pasted);
      setCustomResult((prev) => ({ value, renderId: (prev?.renderId ?? 0) + 1 }));
      setPasteError(null);
    } catch (err) {
      setCustomResult(null);
      setPasteError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <div className="min-h-full">
      <Link
        to="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to Settings
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">JSON Payload Template</h1>
        <p className="text-gray-500 mt-1">Preview how report configuration payloads display to users.</p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
          <Info size={14} aria-hidden="true" /> Prototype reference for NXT-77087.
        </p>
      </header>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor={selectId} className="block text-sm font-semibold text-gray-700">
          Sample payload
        </label>
        <select
          id={selectId}
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          className="mt-2 w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {SAMPLE_PAYLOADS.map((s, i) => (
            <option key={s.name} value={String(i)}>
              {s.reportType} – {s.name}
            </option>
          ))}
          <option value={CUSTOM_OPTION}>Paste your own JSON</option>
        </select>

        {isCustom && (
          <div className="mt-5">
            <label htmlFor={textareaId} className="block text-sm font-semibold text-gray-700">
              JSON payload
            </label>
            <textarea
              id={textareaId}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={8}
              spellCheck={false}
              placeholder='{"viewName": "My View", ...}'
              aria-invalid={pasteError !== null}
              aria-describedby={pasteError ? `${textareaId}-error` : undefined}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {pasteError && (
              <p id={`${textareaId}-error`} role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-red-700">
                <AlertTriangle size={16} aria-hidden="true" /> Invalid JSON: {pasteError}
              </p>
            )}
            <button
              type="button"
              onClick={handleRender}
              className="mt-3 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              Render
            </button>
          </div>
        )}
      </div>

      {sample && <JsonPayloadViewer key={sample.name} data={sample.payload} title={sample.name} />}
      {isCustom && customResult && <JsonPayloadViewer key={customResult.renderId} data={customResult.value} title="Pasted JSON" />}
    </div>
  );
};

export default JsonPayloadDemoPage;
