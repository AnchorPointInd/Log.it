const STORE_KEY = "jtac-logbook-web-v1";
const USERNAME_AUTH_DOMAIN = "jtac.it";
const INTERNAL_AUTH_DOMAINS = [USERNAME_AUTH_DOMAIN, "users.jtac-logbook.app", "jtac-logbook.local"];
const SUPABASE_URL = "https://gildqlfchrsmdovhvyuj.supabase.co";
const SUPABASE_KEY = "sb_publishable_pPG2UaFree6CgIyFB5UAIA_bL6nLKqD";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const OPTIONS = {
  environments: ["Ground", "Airborne", "Simulator"],
  controlTypes: ["Type 1", "Type 2", "Type 3"],
  attackMethods: ["BOT", "BOC"],
  aircraftCategories: [],
  casAircraft: [],
  controllerStatuses: ["JTAC-IQ", "JTAC-Q", "FAC(A)", "Instructor"],
  aircraftNationalities: [
    "AFG", "ALA", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA", "ATG", "ARG", "ARM", "ABW", "AUS", "AUT", "AZE",
    "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES", "BIH", "BWA", "BVT", "BRA",
    "IOT", "BRN", "BGR", "BFA", "BDI", "CPV", "KHM", "CMR", "CAN", "CYM", "CAF", "TCD", "CHL", "CHN", "CXR", "CCK",
    "COL", "COM", "COG", "COD", "COK", "CRI", "CIV", "HRV", "CUB", "CUW", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM",
    "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF", "ATF",
    "GAB", "GMB", "GEO", "DEU", "GHA", "GIB", "GRC", "GRL", "GRD", "GLP", "GUM", "GTM", "GGY", "GIN", "GNB", "GUY",
    "HTI", "HMD", "VAT", "HND", "HKG", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR", "ITA", "JAM",
    "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "PRK", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY",
    "LIE", "LTU", "LUX", "MAC", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ", "MRT", "MUS", "MYT", "MEX",
    "FSM", "MDA", "MCO", "MNG", "MNE", "MSR", "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD", "NCL", "NZL", "NIC",
    "NER", "NGA", "NIU", "NFK", "MKD", "MNP", "NOR", "OMN", "PAK", "PLW", "PSE", "PAN", "PNG", "PRY", "PER", "PHL",
    "PCN", "POL", "PRT", "PRI", "QAT", "REU", "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM", "VCT",
    "WSM", "SMR", "STP", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS",
    "SSD", "ESP", "LKA", "SDN", "SUR", "SJM", "SWE", "CHE", "SYR", "TWN", "TJK", "TZA", "THA", "TLS", "TGO", "TKL",
    "TON", "TTO", "TUN", "TUR", "TKM", "TCA", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "UMI", "URY", "UZB", "VUT",
    "VEN", "VNM", "VGB", "VIR", "WLF", "ESH", "YEM", "ZMB", "ZWE"
  ],
  marks: ["Laser", "IR", "Keyhole", "Talk-On", "No Mark", "DRP", "Link 16 Handover", "Radar Offset", "VDL/FMV"],
  constraints: ["Hot", "Non-Permissive", "SEAD", "Urban", "JTAC/FAC(A)", "Remote Observer", "Supervised", "Day", "Low Level TTPs", "Night FW CAS", "Night TTPs", "Danger Area", "Suppression", "Aviator"]
};

const DEFAULT_REQUIREMENTS = [
  { name: "Rolling 6 Month Controls", windowMonths: 6, requiredCount: 6, active: true, qualifyingControlTypes: OPTIONS.controlTypes },
  { name: "Rolling 12 Month Controls", windowMonths: 12, requiredCount: 12, active: true, qualifyingControlTypes: OPTIONS.controlTypes }
];

const CURRENCY_REQUIREMENTS = [
  { key: "type1", label: "Type 1", windowMonths: 6, required: 1, predicate: (entry) => entry.controlType === "Type 1" },
  { key: "type2", label: "Type 2", windowMonths: 6, required: 1, predicate: (entry) => entry.controlType === "Type 2" },
  { key: "type3", label: "Type 3", windowMonths: 6, required: 1, predicate: (entry) => entry.controlType === "Type 3" },
  { key: "bot", label: "MoA - BoT", windowMonths: 6, required: 1, predicate: (entry) => entry.attackMethod === "BOT" },
  { key: "boc", label: "MoA - BoC", windowMonths: 6, required: 1, predicate: (entry) => entry.attackMethod === "BOC" },
  { key: "fw-cas", label: "Aircraft - FW CAS", windowMonths: 6, required: 2, predicate: (entry) => entry.aircraftCategory === "Fixed Wing CAS" },
  { key: "rw-cas", label: "Aircraft - RW CAS", windowMonths: 6, required: 1, predicate: (entry) => entry.aircraftCategory === "Rotary Wing CAS" },
  { key: "laser", label: "Mark - LASER", windowMonths: 6, required: 1, predicate: (entry) => hasMark(entry, "Laser") },
  { key: "ir", label: "Mark - IR Pointer", windowMonths: 6, required: 1, predicate: (entry) => hasMark(entry, "IR") },
  { key: "remote-observer", label: "Constraint - Remote Observer", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "Remote Observer") || hasMark(entry, "Radar Offset") },
  { key: "vdl-fmv", label: "Constraint - VDL/FMV", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "VDL/FMV") || hasMark(entry, "VDL/FMV") },
  { key: "live-hot", label: "Constraint - Live/Hot", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "Hot") },
  { key: "non-perm", label: "Constraint - 9 Line/Non Perm", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "Non-Permissive") },
  { key: "day", label: "Constraint - Day", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "Day") },
  { key: "ll-ttps", label: "Constraint - LL TTPs", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "Low Level TTPs") },
  { key: "night-ttps", label: "Constraint - Night TTPs", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "Night TTPs") },
  { key: "supervised", label: "Constraint - Supervised", windowMonths: 6, required: 1, predicate: (entry) => hasConstraint(entry, "Supervised") },
  { key: "pms-proficiency", label: "PMS Proficiency", windowMonths: 6, required: 1, profileDate: "pmsProficiencyDate" },
  { key: "type1", label: "Type 1", windowMonths: 12, required: 2, predicate: (entry) => entry.controlType === "Type 1" },
  { key: "type2", label: "Type 2", windowMonths: 12, required: 2, predicate: (entry) => entry.controlType === "Type 2" },
  { key: "type3", label: "Type 3", windowMonths: 12, required: 2, predicate: (entry) => entry.controlType === "Type 3" },
  { key: "bot", label: "MoA - BoT", windowMonths: 12, required: 2, predicate: (entry) => entry.attackMethod === "BOT" },
  { key: "boc", label: "MoA - BoC", windowMonths: 12, required: 2, predicate: (entry) => entry.attackMethod === "BOC" },
  { key: "fw-cas", label: "Aircraft - FW CAS", windowMonths: 12, required: 4, predicate: (entry) => entry.aircraftCategory === "Fixed Wing CAS" },
  { key: "rw-cas", label: "Aircraft - RW CAS", windowMonths: 12, required: 2, predicate: (entry) => entry.aircraftCategory === "Rotary Wing CAS" },
  { key: "laser", label: "Mark - LASER", windowMonths: 12, required: 2, predicate: (entry) => hasMark(entry, "Laser") },
  { key: "ir", label: "Mark - IR Pointer", windowMonths: 12, required: 2, predicate: (entry) => hasMark(entry, "IR") },
  { key: "remote-observer", label: "Constraint - Remote Observer", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "Remote Observer") || hasMark(entry, "Radar Offset") },
  { key: "vdl-fmv", label: "Constraint - VDL/FMV", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "VDL/FMV") || hasMark(entry, "VDL/FMV") },
  { key: "live-hot", label: "Constraint - Live/Hot", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "Hot") },
  { key: "non-perm", label: "Constraint - 9 Line/Non Perm", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "Non-Permissive") },
  { key: "day", label: "Constraint - Day", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "Day") },
  { key: "ll-ttps", label: "Constraint - LL TTPs", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "Low Level TTPs") },
  { key: "night-ttps", label: "Constraint - Night TTPs", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "Night TTPs") },
  { key: "supervised", label: "Constraint - Supervised", windowMonths: 12, required: 2, predicate: (entry) => hasConstraint(entry, "Supervised") },
  { key: "pms-training", label: "PMS Training", windowMonths: 12, required: 1, profileDate: "pmsTrainingDate" },
  { key: "annual-evaluation", label: "Annual Evaluation", windowMonths: 12, required: 1, profileDate: "annualEvaluationDate" }
];

const HTML_LOGBOOK_MARK_COLUMNS = [
  [17, "Laser"],
  [18, "IR"],
  [19, "Keyhole"],
  [20, "Talk-On"],
  [21, "No Mark"],
  [22, "DRP"],
  [23, "Link 16 Handover"]
];

const HTML_LOGBOOK_CONSTRAINT_COLUMNS = [
  [24, "Remote Observer"],
  [25, "VDL/FMV"],
  [26, "Hot"],
  [27, "Non-Permissive"],
  [28, "SEAD"],
  [29, "Urban"],
  [30, "JTAC/FAC(A)"],
  [31, "Day"],
  [32, "Low Level TTPs"],
  [33, "Night FW CAS"],
  [34, "Night TTPs"],
  [35, "Danger Area"],
  [36, "Supervised"],
  [37, "Aviator"]
];

const COUNTRY_ALPHA2_BY_ALPHA3 = {
  AFG: "AF", ALA: "AX", ALB: "AL", DZA: "DZ", ASM: "AS", AND: "AD", AGO: "AO", AIA: "AI", ATA: "AQ", ATG: "AG", ARG: "AR", ARM: "AM", ABW: "AW", AUS: "AU", AUT: "AT", AZE: "AZ",
  BHS: "BS", BHR: "BH", BGD: "BD", BRB: "BB", BLR: "BY", BEL: "BE", BLZ: "BZ", BEN: "BJ", BMU: "BM", BTN: "BT", BOL: "BO", BES: "BQ", BIH: "BA", BWA: "BW", BVT: "BV", BRA: "BR",
  IOT: "IO", BRN: "BN", BGR: "BG", BFA: "BF", BDI: "BI", CPV: "CV", KHM: "KH", CMR: "CM", CAN: "CA", CYM: "KY", CAF: "CF", TCD: "TD", CHL: "CL", CHN: "CN", CXR: "CX", CCK: "CC",
  COL: "CO", COM: "KM", COG: "CG", COD: "CD", COK: "CK", CRI: "CR", CIV: "CI", HRV: "HR", CUB: "CU", CUW: "CW", CYP: "CY", CZE: "CZ", DNK: "DK", DJI: "DJ", DMA: "DM", DOM: "DO",
  ECU: "EC", EGY: "EG", SLV: "SV", GNQ: "GQ", ERI: "ER", EST: "EE", SWZ: "SZ", ETH: "ET", FLK: "FK", FRO: "FO", FJI: "FJ", FIN: "FI", FRA: "FR", GUF: "GF", PYF: "PF", ATF: "TF",
  GAB: "GA", GMB: "GM", GEO: "GE", DEU: "DE", GHA: "GH", GIB: "GI", GRC: "GR", GRL: "GL", GRD: "GD", GLP: "GP", GUM: "GU", GTM: "GT", GGY: "GG", GIN: "GN", GNB: "GW", GUY: "GY",
  HTI: "HT", HMD: "HM", VAT: "VA", HND: "HN", HKG: "HK", HUN: "HU", ISL: "IS", IND: "IN", IDN: "ID", IRN: "IR", IRQ: "IQ", IRL: "IE", IMN: "IM", ISR: "IL", ITA: "IT", JAM: "JM",
  JPN: "JP", JEY: "JE", JOR: "JO", KAZ: "KZ", KEN: "KE", KIR: "KI", PRK: "KP", KOR: "KR", KWT: "KW", KGZ: "KG", LAO: "LA", LVA: "LV", LBN: "LB", LSO: "LS", LBR: "LR", LBY: "LY",
  LIE: "LI", LTU: "LT", LUX: "LU", MAC: "MO", MDG: "MG", MWI: "MW", MYS: "MY", MDV: "MV", MLI: "ML", MLT: "MT", MHL: "MH", MTQ: "MQ", MRT: "MR", MUS: "MU", MYT: "YT", MEX: "MX",
  FSM: "FM", MDA: "MD", MCO: "MC", MNG: "MN", MNE: "ME", MSR: "MS", MAR: "MA", MOZ: "MZ", MMR: "MM", NAM: "NA", NRU: "NR", NPL: "NP", NLD: "NL", NCL: "NC", NZL: "NZ", NIC: "NI",
  NER: "NE", NGA: "NG", NIU: "NU", NFK: "NF", MKD: "MK", MNP: "MP", NOR: "NO", OMN: "OM", PAK: "PK", PLW: "PW", PSE: "PS", PAN: "PA", PNG: "PG", PRY: "PY", PER: "PE", PHL: "PH",
  PCN: "PN", POL: "PL", PRT: "PT", PRI: "PR", QAT: "QA", REU: "RE", ROU: "RO", RUS: "RU", RWA: "RW", BLM: "BL", SHN: "SH", KNA: "KN", LCA: "LC", MAF: "MF", SPM: "PM", VCT: "VC",
  WSM: "WS", SMR: "SM", STP: "ST", SAU: "SA", SEN: "SN", SRB: "RS", SYC: "SC", SLE: "SL", SGP: "SG", SXM: "SX", SVK: "SK", SVN: "SI", SLB: "SB", SOM: "SO", ZAF: "ZA", SGS: "GS",
  SSD: "SS", ESP: "ES", LKA: "LK", SDN: "SD", SUR: "SR", SJM: "SJ", SWE: "SE", CHE: "CH", SYR: "SY", TWN: "TW", TJK: "TJ", TZA: "TZ", THA: "TH", TLS: "TL", TGO: "TG", TKL: "TK",
  TON: "TO", TTO: "TT", TUN: "TN", TUR: "TR", TKM: "TM", TCA: "TC", TUV: "TV", UGA: "UG", UKR: "UA", ARE: "AE", GBR: "GB", USA: "US", UMI: "UM", URY: "UY", UZB: "UZ", VUT: "VU",
  VEN: "VE", VNM: "VN", VGB: "VG", VIR: "VI", WLF: "WF", ESH: "EH", YEM: "YE", ZMB: "ZM", ZWE: "ZW"
};

const regionNames = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;

let state = loadState();
let activeView = "dashboard";
let selectedMarks = new Set();
let selectedConstraints = new Set();
let currentUser = null;
let isAdmin = false;
let adminProfiles = [];
let adminControls = [];
let syncStatus = "Sign in to sync controls.";
let optionsLoaded = false;
let filterState = {
  search: "",
  type: "",
  status: "",
  aircraft: "",
  sort: "newest"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadState() {
  const fallback = {
    schemaVersion: 1,
    profile: {},
    requirements: DEFAULT_REQUIREMENTS,
    entries: []
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY));
    return parsed && parsed.schemaVersion === 1 ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function setStatus(message) {
  syncStatus = message;
  const authStatus = $("#authStatus");
  if (authStatus) authStatus.textContent = message;
  renderAuthPanel();
}

function requireUser() {
  if (!currentUser) {
    setStatus("Sign in before saving controls.");
    return false;
  }
  return true;
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return new Date(`${value}T12:00:00`);
  return value ? new Date(value) : null;
}

function dateInputValue(value) {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function shortDate(value) {
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function monthLabel(value) {
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
}

function dayLabel(value) {
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit" });
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function daysBetween(start, end) {
  const day = 24 * 60 * 60 * 1000;
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.ceil((b - a) / day);
}

function hasMark(entry, value) {
  return (entry.marks || []).includes(value);
}

function hasConstraint(entry, value) {
  return (entry.constraints || []).includes(value);
}

function completedDatesForRequirement(requirement, successful) {
  if (requirement.profileDate) {
    const value = state.profile?.[requirement.profileDate];
    return value ? [new Date(`${String(value).slice(0, 10)}T12:00:00`)] : [];
  }
  return successful.filter(requirement.predicate).map((entry) => new Date(entry.date));
}

function requirementProgress(requirement, successful, asOf) {
  const start = addMonths(asOf, -requirement.windowMonths);
  const dates = completedDatesForRequirement(requirement, successful)
    .filter((date) => date >= start && date <= asOf)
    .sort((a, b) => b - a);
  const expiryDate = dates.length >= requirement.required
    ? addMonths(dates[requirement.required - 1], requirement.windowMonths)
    : null;
  return {
    ...requirement,
    completed: dates.length,
    remaining: Math.max(0, requirement.required - dates.length),
    isMet: dates.length >= requirement.required,
    expiryDate
  };
}

function calculateCurrency(asOf = new Date()) {
  const successful = state.entries
    .filter((entry) => entry.successful && new Date(entry.date) <= asOf)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const sixStart = addMonths(asOf, -6);
  const twelveStart = addMonths(asOf, -12);
  const progress = CURRENCY_REQUIREMENTS.map((requirement) => requirementProgress(requirement, successful, asOf));
  const nextExpiryDate = progress.map((item) => item.expiryDate).filter(Boolean).sort((a, b) => a - b)[0] || null;
  const expiringWithin30Days = progress.filter((item) => item.expiryDate && item.expiryDate > asOf && item.expiryDate <= new Date(asOf.getTime() + 30 * 86400000)).length;
  const stateName = progress.some((item) => !item.isMet) ? "RED" : expiringWithin30Days > 0 ? "AMBER" : "GREEN";
  return {
    state: stateName,
    sixMonthCount: successful.filter((entry) => new Date(entry.date) >= sixStart).length,
    twelveMonthCount: successful.filter((entry) => new Date(entry.date) >= twelveStart).length,
    requirements: progress,
    nextExpiryDate,
    expiringWithin30Days
  };
}

function aircraftText(entry) {
  return (entry.aircraft || []).map((item) => `${item.quantity} x ${item.type} ${item.nationality}`.trim()).join(", ") || "No aircraft";
}

function verificationText(entry) {
  if (entry.verification?.selfVerified) return "Self verified";
  return entry.verification && entry.verification.name ? "Verified" : "Unverified";
}

function dbControlToEntry(row) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    location: row.location || "",
    exerciseOperation: row.exercise_operation || "",
    notes: row.notes || "",
    successful: row.successful,
    environment: row.environment,
    controlType: row.control_type,
    attackMethod: row.attack_method,
    aircraftCategory: row.aircraft_category,
    marks: row.marks || [],
    constraints: row.constraints || [],
    cmp: row.cmp,
    controllerStatus: row.controller_status,
    aircraft: row.aircraft || [],
    ordnance: row.ordnance || [],
    verification: row.verification,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function entryToDbControl(entry) {
  return {
    id: entry.id,
    user_id: currentUser.id,
    date: entry.date,
    location: entry.location,
    exercise_operation: entry.exerciseOperation || "",
    notes: entry.notes || "",
    successful: entry.successful,
    environment: entry.environment,
    control_type: entry.controlType,
    attack_method: entry.attackMethod,
    aircraft_category: entry.aircraftCategory,
    marks: entry.marks || [],
    constraints: entry.constraints || [],
    cmp: Boolean(entry.cmp),
    controller_status: entry.controllerStatus,
    aircraft: entry.aircraft || [],
    ordnance: entry.ordnance || [],
    verification: entry.verification || null,
    updated_at: new Date().toISOString()
  };
}

function dbProfileToState(row) {
  if (!row) return {};
  return {
    email: row.email || "",
    name: row.name || "",
    rank: row.rank || "",
    serviceNumber: row.service_number || "",
    formationSeniorRequested: Boolean(row.formation_senior_requested),
    formationSeniorRequestedAt: row.formation_senior_requested_at || "",
    unit: row.unit || "",
    capbadge: row.capbadge || "",
    qualification: row.qualification || "",
    initialQualificationDate: row.initial_qualification_date || "",
    pmsTrainingDate: row.pms_training_date || "",
    pmsProficiencyDate: row.pms_proficiency_date || "",
    annualEvaluationDate: row.annual_evaluation_date || "",
    evaluationWaiverNumber: row.evaluation_waiver_number || ""
  };
}

function stateProfileToDb(profile) {
  const formationSeniorRequested = Boolean(profile.formationSeniorRequested);
  return {
    user_id: currentUser.id,
    email: displayIdentifierFromUser(currentUser) || profile.email || "",
    name: profile.name || "",
    rank: profile.rank || "",
    service_number: profile.serviceNumber || "",
    formation_senior_requested: formationSeniorRequested,
    formation_senior_requested_at: formationSeniorRequested
      ? (profile.formationSeniorRequestedAt || new Date().toISOString())
      : null,
    unit: profile.unit || "",
    capbadge: profile.capbadge || "",
    qualification: profile.qualification || "",
    initial_qualification_date: profile.initialQualificationDate || null,
    pms_training_date: profile.pmsTrainingDate || null,
    pms_proficiency_date: profile.pmsProficiencyDate || null,
    annual_evaluation_date: profile.annualEvaluationDate || null,
    evaluation_waiver_number: profile.evaluationWaiverNumber || "",
    updated_at: new Date().toISOString()
  };
}

function normalizeAuthIdentifier(value) {
  return value.trim().toLowerCase();
}

function authEmailFromIdentifier(value) {
  const identifier = normalizeAuthIdentifier(value);
  return identifier.includes("@") ? identifier : `${identifier}@${USERNAME_AUTH_DOMAIN}`;
}

function isValidAuthIdentifier(value) {
  const identifier = normalizeAuthIdentifier(value);
  return identifier.includes("@") || /^[a-z0-9][a-z0-9._-]{0,62}$/.test(identifier);
}

function hasValidInternalAuthDomain() {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(USERNAME_AUTH_DOMAIN);
}

function displayIdentifierFromUser(user) {
  const email = user?.email || "";
  const normalizedEmail = email.toLowerCase();
  const internalDomain = INTERNAL_AUTH_DOMAINS.find((domain) => normalizedEmail.endsWith(`@${domain.toLowerCase()}`));
  return internalDomain ? email.slice(0, -internalDomain.length - 1) : email;
}

function profileFromUserMetadata(user) {
  const metadata = user?.user_metadata || {};
  const formationSeniorRequested = Boolean(metadata.formationSeniorRequested);
  return {
    email: displayIdentifierFromUser(user),
    rank: metadata.rank || "",
    name: metadata.name || "",
    serviceNumber: metadata.serviceNumber || "",
    formationSeniorRequested,
    formationSeniorRequestedAt: formationSeniorRequested
      ? (metadata.formationSeniorRequestedAt || new Date().toISOString())
      : ""
  };
}

async function loadRemoteState() {
  if (!currentUser) return;
  setStatus("Loading account data...");
  const [, { data: profile, error: profileError }, { data: controls, error: controlsError }, { data: adminRow, error: adminError }] = await Promise.all([
    loadRemoteOptions(),
    supabaseClient.from("profiles").select("*").eq("user_id", currentUser.id).maybeSingle(),
    supabaseClient.from("controls").select("*").eq("user_id", currentUser.id).order("date", { ascending: false }),
    supabaseClient.from("app_admins").select("user_id").eq("user_id", currentUser.id).maybeSingle()
  ]);
  if (profileError) throw profileError;
  if (controlsError) throw controlsError;
  if (adminError) throw adminError;
  isAdmin = Boolean(adminRow);
  state.profile = dbProfileToState(profile);
  if (!profile) {
    state.profile = profileFromUserMetadata(currentUser);
    await saveRemoteProfile();
  }
  state.entries = (controls || []).map(dbControlToEntry);
  if (isAdmin) await loadAdminData();
  else {
    adminProfiles = [];
    adminControls = [];
  }
  saveState();
  setStatus(`Signed in as ${displayIdentifierFromUser(currentUser)}.`);
  render();
}

async function loadRemoteOptions() {
  const { data, error } = await supabaseClient
    .from("app_options")
    .select("group_key,value,label")
    .eq("active", true)
    .in("group_key", ["aircraft_categories", "aircraft_types"])
    .order("label", { ascending: true });
  if (error) throw error;

  const grouped = (data || []).reduce((groups, row) => {
    groups[row.group_key] = groups[row.group_key] || [];
    groups[row.group_key].push(row);
    return groups;
  }, {});

  const requiredGroups = ["aircraft_categories", "aircraft_types"];
  const missingGroups = requiredGroups.filter((group) => !grouped[group]?.length);
  if (missingGroups.length) {
    throw new Error(`Missing Supabase option groups: ${missingGroups.join(", ")}.`);
  }

  OPTIONS.aircraftCategories = grouped.aircraft_categories.map((row) => row.value);
  OPTIONS.casAircraft = grouped.aircraft_types.map((row) => row.value);
  optionsLoaded = true;
}

async function loadAdminData() {
  const [{ data: profiles, error: profilesError }, { data: controls, error: controlsError }] = await Promise.all([
    supabaseClient.from("profiles").select("*").order("formation_senior_requested", { ascending: false }).order("updated_at", { ascending: false }),
    supabaseClient.from("controls").select("*").order("date", { ascending: false })
  ]);
  if (profilesError) throw profilesError;
  if (controlsError) throw controlsError;
  adminProfiles = profiles || [];
  adminControls = controls || [];
}

async function saveRemoteProfile() {
  if (!currentUser) return;
  const { error } = await supabaseClient.from("profiles").upsert(stateProfileToDb(state.profile), { onConflict: "user_id" });
  if (error) throw error;
  setStatus("Profile synced.");
}

async function saveRemoteEntry(entry) {
  const { error } = await supabaseClient.from("controls").upsert(entryToDbControl(entry), { onConflict: "id" });
  if (error) throw error;
  setStatus("Control synced.");
}

async function deleteRemoteEntry(id) {
  const { error } = await supabaseClient.from("controls").delete().eq("id", id);
  if (error) throw error;
  setStatus("Control deleted.");
}

async function bootstrapAuth() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setStatus(error.message);
    return;
  }
  currentUser = data.session?.user || null;
  renderAuthPanel();
  if (currentUser) {
    try {
      await loadRemoteState();
    } catch (error) {
      setStatus(error.message || "Unable to load account data.");
    }
  } else {
    render();
  }
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    if (currentUser) loadRemoteState().catch((error) => setStatus(error.message));
    else {
      isAdmin = false;
      optionsLoaded = false;
      adminProfiles = [];
      adminControls = [];
      activeView = "dashboard";
      state = loadState();
      setStatus("Signed out.");
      render();
    }
  });
}

function render() {
  document.body.classList.toggle("signed-out", !currentUser);
  document.body.classList.toggle("is-admin", Boolean(isAdmin));
  if (!currentUser) {
    renderSignedOut();
    renderAuthPanel();
    return;
  }
  if (activeView === "admin" && !isAdmin) activeView = "dashboard";
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === activeView));
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${activeView}View`).classList.add("active");
  renderDashboard();
  renderLogbook();
  renderCurrency();
  renderReports();
  renderSettings();
  renderAdmin();
  renderAuthPanel();
}

function renderSignedOut() {
  $$(".view").forEach((view) => view.classList.remove("active"));
  $("#dashboardView").classList.add("active");
  $("#dashboardView").innerHTML = `
    <div class="auth-screen">
      <section class="auth-card">
        <div>
          <p class="eyebrow">JTAC Logbook</p>
          <h1>Account Access</h1>
        </div>
        <form id="authForm" class="stack">
          <div class="form-grid">
            <label>Username<input id="authEmail" type="text" autocomplete="username" required></label>
            <label>Password<input id="authPassword" type="password" autocomplete="current-password" minlength="6" required></label>
          </div>
          <button class="button primary" type="submit">Sign In</button>
        </form>
        <p class="entry-meta">Accounts are created by an admin.</p>
        <p class="entry-meta" id="authStatus">${escapeHTML(syncStatus)}</p>
      </section>
    </div>`;
}

function renderAuthPanel() {
  const panel = $("#authPanel");
  if (!panel) return;
  if (!currentUser) {
    panel.innerHTML = "";
    return;
  }
  if (currentUser) {
    panel.innerHTML = `
      <p class="section-label">Account</p>
      <p class="entry-meta">${escapeHTML(displayIdentifierFromUser(currentUser))}</p>
      <p class="entry-meta">${escapeHTML(syncStatus)}</p>
      <button class="button secondary" data-action="signOut">Sign Out</button>`;
  }
}

function renderHeader(title, actions = "") {
  return `<div class="page-head"><div><p class="eyebrow">JTAC Logbook</p><h2>${title}</h2></div><div class="toolbar">${actions}</div></div>`;
}

function renderDashboard() {
  const snapshot = calculateCurrency();
  const requiredSix = snapshot.requirements.find((item) => item.windowMonths === 6)?.required || 0;
  const nextText = snapshot.nextExpiryDate
    ? (daysBetween(new Date(), snapshot.nextExpiryDate) <= 0 ? "CONTROL REQUIRED NOW" : `NEXT CONTROL REQUIRED IN ${daysBetween(new Date(), snapshot.nextExpiryDate)} DAYS`)
    : (snapshot.state === "RED" ? "CONTROL REQUIRED NOW" : "NO EXPIRY CALCULATED");
  const recent = state.entries
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
    .map(entryRow)
    .join("");
  $("#dashboardView").innerHTML = `
    ${renderHeader("Dashboard", `<button class="button primary" data-action="add">+ Add Control</button>`)}
    <div class="stack">
      <section class="status-panel status-${snapshot.state.toLowerCase()}">
        <p class="eyebrow">Current Currency Status</p>
        <h3>${snapshot.state}</h3>
        <strong>${nextText}</strong>
      </section>
      <section class="grid two">
        ${metric("Last 6 months", snapshot.sixMonthCount)}
        ${metric("Last 12 months", snapshot.twelveMonthCount)}
        ${metric("6m required", requiredSix)}
        ${metric("Expiring <=30d", snapshot.expiringWithin30Days)}
      </section>
      <section class="grid two">
        <button class="button secondary" data-nav="logbook">Logbook</button>
        <button class="button secondary" data-nav="currency">Currency</button>
        <button class="button secondary" data-nav="reports">Reports</button>
        <button class="button secondary" data-nav="settings">Settings</button>
      </section>
      <section class="stack">
        <p class="section-label">Recent controls</p>
        ${recent || `<div class="empty">No controls yet. Add a control or import a backup to start tracking currency.</div>`}
      </section>
    </div>`;
}

function metric(title, value) {
  return `<div class="panel metric"><span>${title}</span><strong>${escapeHTML(value)}</strong></div>`;
}

function getFilteredEntries() {
  const search = filterState.search.trim().toLowerCase();
  const type = filterState.type;
  const status = filterState.status;
  const aircraft = filterState.aircraft.trim().toLowerCase();
  const sort = filterState.sort;
  return state.entries
    .filter((entry) => {
      const textMatch = !search || [entry.location, entry.exerciseOperation, aircraftText(entry)].join(" ").toLowerCase().includes(search);
      const typeMatch = !type || entry.controlType === type;
      const statusMatch = !status || entry.controllerStatus === status;
      const aircraftMatch = !aircraft || aircraftText(entry).toLowerCase().includes(aircraft);
      return textMatch && typeMatch && statusMatch && aircraftMatch;
    })
    .sort((a, b) => sort === "oldest" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
}

function renderLogbook() {
  const rows = getFilteredEntries().map(entryRow).join("");
  $("#logbookView").innerHTML = `
    ${renderHeader("Mission Logbook", `<button class="button primary" data-action="add">+ Add Control</button>`)}
    <div class="filters">
      <input id="searchInput" placeholder="Search location, exercise, aircraft" value="${escapeHTML(filterState.search)}">
      <select id="typeFilter"><option value="">All control types</option>${optionsHTML(OPTIONS.controlTypes, filterState.type)}</select>
      <select id="statusFilter"><option value="">All statuses</option>${optionsHTML(OPTIONS.controllerStatuses, filterState.status)}</select>
      <input id="aircraftFilter" placeholder="Aircraft type" value="${escapeHTML(filterState.aircraft)}">
      <select id="sortFilter"><option value="newest" ${filterState.sort === "newest" ? "selected" : ""}>Newest first</option><option value="oldest" ${filterState.sort === "oldest" ? "selected" : ""}>Oldest first</option></select>
    </div>
    <div class="stack" id="logbookRows">${rows || `<div class="empty">No controls match the current filters.</div>`}</div>`;
}

function entryRow(entry) {
  return `
    <article class="entry-row">
      <div class="date-box"><strong>${dayLabel(entry.date)}</strong><span>${monthLabel(entry.date)}</span></div>
      <div>
        <p class="entry-title">${escapeHTML(entry.location || "Unknown location")}</p>
        <div class="entry-meta">${shortDate(entry.date)} | ${escapeHTML(entry.controlType)} | ${escapeHTML(aircraftText(entry))}</div>
        <div class="pill-row">
          <span class="pill">${entry.successful ? "Successful" : "Unsuccessful"}</span>
          <span class="pill">${escapeHTML(entry.controllerStatus || "JTAC-Q")}</span>
          <span class="pill">${verificationText(entry)}</span>
        </div>
      </div>
      <div class="toolbar">
        <button class="button secondary" data-action="edit" data-id="${entry.id}">Edit</button>
      </div>
    </article>`;
}

function renderCurrency() {
  const snapshot = calculateCurrency();
  const requirementCard = (item) => `
    <article class="requirement-tile ${item.isMet ? "is-met" : "is-missing"}">
      <p class="section-label">${escapeHTML(item.label)}</p>
      <div class="grid three">
        ${metric("Completed", item.completed)}
        ${metric("Required", item.required)}
        ${metric("Remaining", item.remaining)}
      </div>
      <div class="entry-meta">${item.expiryDate ? `Expires ${shortDate(item.expiryDate)}` : "Requirement incomplete"}</div>
    </article>`;
  const sixMonthRequirements = snapshot.requirements.filter((item) => item.windowMonths === 6);
  const twelveMonthRequirements = snapshot.requirements.filter((item) => item.windowMonths === 12);
  $("#currencyView").innerHTML = `
    ${renderHeader("Currency Tracker")}
    <div class="stack">
      <section class="status-panel status-${snapshot.state.toLowerCase()}"><p class="eyebrow">Currency Status</p><h3>${snapshot.state}</h3></section>
      <section class="panel stack">
        <p class="section-label">Rolling 6 Month Requirements</p>
        <div class="grid three">
          ${metric("Met", sixMonthRequirements.filter((item) => item.isMet).length)}
          ${metric("Required", sixMonthRequirements.length)}
          ${metric("Missing", sixMonthRequirements.filter((item) => !item.isMet).length)}
        </div>
        <div class="grid three">${sixMonthRequirements.map(requirementCard).join("")}</div>
      </section>
      <section class="panel stack">
        <p class="section-label">Rolling 12 Month Requirements</p>
        <div class="grid three">
          ${metric("Met", twelveMonthRequirements.filter((item) => item.isMet).length)}
          ${metric("Required", twelveMonthRequirements.length)}
          ${metric("Missing", twelveMonthRequirements.filter((item) => !item.isMet).length)}
        </div>
        <div class="grid three">${twelveMonthRequirements.map(requirementCard).join("")}</div>
      </section>
      <section class="panel">
        <p class="section-label">Expiry timeline</p>
        <p>${snapshot.nextExpiryDate ? `Next control required ${shortDate(snapshot.nextExpiryDate)}.` : "Requirements are incomplete. A qualifying control is required now."}</p>
      </section>
    </div>`;
}

function renderReports() {
  $("#reportsView").innerHTML = `
    ${renderHeader("Export Reports")}
    <div class="grid two">
      <section class="panel stack">
        <p class="section-label">CAS Mission Log</p>
        <p>Printable landscape mission log with control totals and verification.</p>
        <button class="button primary" data-report="mission">Generate Print Report</button>
      </section>
      <section class="panel stack">
        <p class="section-label">JTAC Currency Summary</p>
        <p>Current status, rolling requirements, expiry dates and deficiencies.</p>
        <button class="button primary" data-report="currency">Generate Print Report</button>
      </section>
    </div>
    <div id="printArea"></div>`;
}

function renderSettings() {
  const profile = state.profile || {};
  $("#settingsView").innerHTML = `
    ${renderHeader("Settings")}
    <form class="stack" id="profileForm">
      <section class="panel stack">
        <p class="section-label">User Profile</p>
        <div class="form-grid">
          ${profileInput("name", "Name", profile.name)}
          ${profileInput("rank", "Rank", profile.rank)}
          ${profileInput("serviceNumber", "Service Number", profile.serviceNumber)}
          ${profileInput("unit", "Unit", profile.unit)}
          ${profileInput("capbadge", "Capbadge", profile.capbadge)}
          <label>JTAC Qualification<select name="qualification"><option value="">Not Set</option>${optionsHTML(OPTIONS.controllerStatuses, profile.qualification)}</select></label>
        </div>
        <label class="check-row"><input name="formationSeniorRequested" type="checkbox" value="true" ${profile.formationSeniorRequested ? "checked" : ""}> Request formation senior access</label>
        <p class="entry-meta">${profile.formationSeniorRequested ? `Request submitted${profile.formationSeniorRequestedAt ? ` ${shortDate(profile.formationSeniorRequestedAt)}` : ""}.` : "Formation senior access is reviewed by an admin."}</p>
      </section>
      <section class="panel stack">
        <p class="section-label">Currency Dates</p>
        <div class="form-grid">
          ${profileInput("initialQualificationDate", "Initial Qualification", profile.initialQualificationDate, "date")}
          ${profileInput("pmsTrainingDate", "PMS Training", profile.pmsTrainingDate, "date")}
          ${profileInput("pmsProficiencyDate", "PMS Proficiency", profile.pmsProficiencyDate, "date")}
          ${profileInput("annualEvaluationDate", "Annual Evaluation", profile.annualEvaluationDate, "date")}
          ${profileInput("evaluationWaiverNumber", "Evaluation Extension / Waiver", profile.evaluationWaiverNumber)}
        </div>
      </section>
      <section class="panel stack">
        <p class="section-label">Data</p>
        <div class="toolbar">
          <button class="button secondary" type="button" data-action="import">Upload Logbook or Backup</button>
          <button class="button secondary" type="button" data-action="export">Export Data / Backup</button>
          <button class="button ghost" type="button" data-action="deleteAll" ${state.entries.length ? "" : "disabled"}>Delete All Controls</button>
        </div>
        <p class="entry-meta">${currentUser ? "Data is synced to this signed-in Supabase account. Export a JSON backup before major changes." : "Sign in to sync data to your account. Unsigned data is stored in this browser only."}</p>
      </section>
    </form>`;
}

function renderAdmin() {
  if (!isAdmin) {
    $("#adminView").innerHTML = "";
    return;
  }
  const controlsByUser = adminControls.reduce((counts, control) => {
    counts[control.user_id] = (counts[control.user_id] || 0) + 1;
    return counts;
  }, {});
  const profilesByUser = new Map(adminProfiles.map((profile) => [profile.user_id, profile]));
  const accountRows = adminProfiles.map((profile) => `
    <article class="entry-row">
      <div class="date-box"><strong>${controlsByUser[profile.user_id] || 0}</strong><span>CTRL</span></div>
      <div>
        <p class="entry-title">${escapeHTML([profile.rank, profile.name].filter(Boolean).join(" ") || profile.email || "Unnamed account")}</p>
        <div class="entry-meta">${escapeHTML([profile.email, profile.service_number].filter(Boolean).join(" | "))}</div>
        <div class="pill-row">
          <span class="pill">${profile.formation_senior_requested ? "Formation senior requested" : "Standard access"}</span>
          ${profile.formation_senior_requested_at ? `<span class="pill">${shortDate(profile.formation_senior_requested_at)}</span>` : ""}
        </div>
      </div>
    </article>`).join("");
  const recentControls = adminControls.slice(0, 12).map((control) => {
    const profile = profilesByUser.get(control.user_id) || {};
    return `
      <article class="entry-row">
        <div class="date-box"><strong>${dayLabel(control.date)}</strong><span>${monthLabel(control.date)}</span></div>
        <div>
          <p class="entry-title">${escapeHTML(control.location || "Unknown location")}</p>
          <div class="entry-meta">${escapeHTML([profile.rank, profile.name, control.control_type, control.aircraft?.[0]?.type].filter(Boolean).join(" | "))}</div>
        </div>
      </article>`;
  }).join("");
  $("#adminView").innerHTML = `
    ${renderHeader("Admin")}
    <div class="stack">
      <section class="grid three">
        ${metric("Accounts", adminProfiles.length)}
        ${metric("Senior requests", adminProfiles.filter((profile) => profile.formation_senior_requested).length)}
        ${metric("Controls", adminControls.length)}
      </section>
      <section class="stack">
        <p class="section-label">Accounts</p>
        ${accountRows || `<div class="empty">No account profiles have been created yet.</div>`}
      </section>
      <section class="stack">
        <p class="section-label">Recent controls</p>
        ${recentControls || `<div class="empty">No controls have been logged yet.</div>`}
      </section>
    </div>`;
}

function profileInput(name, label, value = "", type = "text") {
  const formatted = type === "date" && value ? String(value).slice(0, 10) : (value || "");
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeHTML(formatted)}"></label>`;
}

function optionsHTML(options, selected = "") {
  return options.map((option) => `<option value="${escapeHTML(option)}" ${option === selected ? "selected" : ""}>${escapeHTML(option)}</option>`).join("");
}

function nationalityOptionsHTML(selected = "GBR") {
  return OPTIONS.aircraftNationalities.map((code) => {
    const alpha2 = COUNTRY_ALPHA2_BY_ALPHA3[code];
    const countryName = alpha2 && regionNames ? regionNames.of(alpha2) : "";
    const label = countryName ? `${countryName} (${code})` : code;
    return `<option value="${escapeHTML(code)}" ${code === selected ? "selected" : ""}>${escapeHTML(label)}</option>`;
  }).join("");
}

function setupFormControls() {
  if (!optionsLoaded) throw new Error("Reference options have not loaded from Supabase.");
  $("#entryEnvironment").innerHTML = optionsHTML(OPTIONS.environments);
  $("#entryControlType").innerHTML = optionsHTML(OPTIONS.controlTypes);
  $("#entryAttackMethod").innerHTML = optionsHTML(OPTIONS.attackMethods);
  $("#entryAircraftCategory").innerHTML = optionsHTML(OPTIONS.aircraftCategories);
  $("#entryAircraftType").innerHTML = `<option value="">Select aircraft</option>${optionsHTML(OPTIONS.casAircraft)}`;
  $("#entryControllerStatus").innerHTML = optionsHTML(OPTIONS.controllerStatuses);
  $("#entryAircraftNationality").innerHTML = nationalityOptionsHTML("GBR");
}

function renderTagPickers() {
  $("#marksPicker").innerHTML = OPTIONS.marks.map((mark) => tagHTML(mark, selectedMarks.has(mark), "mark")).join("");
  $("#constraintsPicker").innerHTML = OPTIONS.constraints.map((constraint) => tagHTML(constraint, selectedConstraints.has(constraint), "constraint")).join("");
}

function tagHTML(value, checked, kind) {
  return `<label class="tag"><input type="checkbox" data-kind="${kind}" value="${escapeHTML(value)}" ${checked ? "checked" : ""}>${escapeHTML(value)}</label>`;
}

function parseAircraftCell(value) {
  const text = String(value || "").trim();
  if (!text) return { quantity: 1, type: "Unknown", nationality: "" };
  const match = text.match(/^(\d+)\s*x\s*(.+)$/i);
  if (!match) return { quantity: 1, type: text, nationality: "" };
  const quantity = Math.max(1, Number(match[1] || 1));
  let type = match[2].trim();
  let nationality = "";
  const suffixMatch = type.match(/\s+([A-Z]{3})$/);
  if (suffixMatch && OPTIONS.aircraftNationalities.includes(suffixMatch[1])) {
    nationality = suffixMatch[1];
    type = type.slice(0, -suffixMatch[1].length).trim();
  }
  return { quantity, type: type || "Unknown", nationality };
}

function applySelfVerificationState() {
  const selfVerified = $("#entrySelfVerified").checked;
  const verifierFields = [$("#entryVerifierName"), $("#entryVerifierRank")];
  if (selfVerified) verifierFields.forEach((field) => { field.value = ""; });
  verifierFields.forEach((field) => { field.disabled = selfVerified; });
}

function openEntryDialog(entry = null) {
  if (!optionsLoaded) {
    setStatus("Reference options are still loading from Supabase.");
    return;
  }
  setupFormControls();
  selectedMarks = new Set(entry?.marks || []);
  selectedConstraints = new Set(entry?.constraints || []);
  renderTagPickers();
  $("#entryDialogTitle").textContent = entry ? "Edit Control" : "Add Control";
  $("#deleteEntry").style.display = entry ? "inline-flex" : "none";
  $("#entryId").value = entry?.id || "";
  $("#entryDate").value = dateInputValue(entry?.date);
  $("#entryLocation").value = entry?.location || "";
  $("#entryExercise").value = entry?.exerciseOperation || "";
  $("#entryNotes").value = entry?.notes || "";
  $("#entryAircraftQty").value = entry?.aircraft?.[0]?.quantity || 1;
  const aircraftType = entry?.aircraft?.[0]?.type || "";
  if (aircraftType && !OPTIONS.casAircraft.includes(aircraftType)) {
    $("#entryAircraftType").insertAdjacentHTML("beforeend", `<option value="${escapeHTML(aircraftType)}">${escapeHTML(aircraftType)}</option>`);
  }
  $("#entryAircraftType").value = aircraftType;
  const aircraftNationality = entry?.aircraft?.[0]?.nationality || "GBR";
  if (!OPTIONS.aircraftNationalities.includes(aircraftNationality)) {
    $("#entryAircraftNationality").insertAdjacentHTML("beforeend", `<option value="${escapeHTML(aircraftNationality)}">${escapeHTML(aircraftNationality)}</option>`);
  }
  $("#entryAircraftNationality").value = aircraftNationality;
  $("#entryOrdnanceQty").value = entry?.ordnance?.[0]?.quantity || 1;
  $("#entryOrdnanceType").value = entry?.ordnance?.[0]?.type || "";
  $("#entrySuccessful").value = String(entry?.successful ?? true);
  $("#entryEnvironment").value = entry?.environment || "Ground";
  $("#entryControlType").value = entry?.controlType || "Type 1";
  $("#entryAttackMethod").value = entry?.attackMethod || "BOT";
  $("#entryAircraftCategory").value = entry?.aircraftCategory || OPTIONS.aircraftCategories[0] || "";
  $("#entryControllerStatus").value = entry?.controllerStatus || "JTAC-Q";
  $("#entryCmp").checked = Boolean(entry?.cmp);
  $("#entrySelfVerified").checked = Boolean(entry?.verification?.selfVerified);
  $("#entryVerifierName").value = entry?.verification?.name || "";
  $("#entryVerifierRank").value = entry?.verification?.rank || "";
  $("#entryVerificationDate").value = entry?.verification?.date ? String(entry.verification.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
  applySelfVerificationState();
  $("#entryDialog").showModal();
}

async function saveEntryFromForm() {
  if (!requireUser()) return;
  const id = $("#entryId").value || uid();
  const selfVerified = $("#entrySelfVerified").checked;
  const verifierName = $("#entryVerifierName").value.trim();
  const verificationDate = $("#entryVerificationDate").value || new Date().toISOString().slice(0, 10);
  const entry = {
    id,
    date: parseDate($("#entryDate").value).toISOString(),
    location: $("#entryLocation").value.trim(),
    exerciseOperation: $("#entryExercise").value.trim(),
    notes: $("#entryNotes").value.trim(),
    successful: $("#entrySuccessful").value === "true",
    environment: $("#entryEnvironment").value,
    controlType: $("#entryControlType").value,
    attackMethod: $("#entryAttackMethod").value,
    aircraftCategory: $("#entryAircraftCategory").value,
    marks: Array.from(selectedMarks).sort(),
    constraints: Array.from(selectedConstraints).sort(),
    cmp: $("#entryCmp").checked,
    controllerStatus: $("#entryControllerStatus").value,
    aircraft: [{
      quantity: Math.max(1, Number($("#entryAircraftQty").value || 1)),
      type: $("#entryAircraftType").value.trim(),
      nationality: $("#entryAircraftNationality").value || "GBR"
    }],
    ordnance: $("#entryOrdnanceType").value.trim() ? [{
      quantity: Math.max(1, Number($("#entryOrdnanceQty").value || 1)),
      type: $("#entryOrdnanceType").value.trim()
    }] : [],
    verification: selfVerified ? {
      selfVerified: true,
      date: verificationDate
    } : verifierName ? {
      name: verifierName,
      rank: $("#entryVerifierRank").value.trim(),
      date: verificationDate
    } : null,
    updatedAt: new Date().toISOString()
  };
  const index = state.entries.findIndex((item) => item.id === id);
  if (index >= 0) state.entries[index] = entry;
  else state.entries.push({ ...entry, createdAt: new Date().toISOString() });
  await saveRemoteEntry(entry);
  saveState();
  $("#entryDialog").close();
  render();
}

async function deleteEntry(id) {
  if (!requireUser()) return;
  state.entries = state.entries.filter((entry) => entry.id !== id);
  await deleteRemoteEntry(id);
  saveState();
  $("#entryDialog").close();
  render();
}

function exportData() {
  const archive = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    entries: state.entries
  };
  const blob = new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `JTAC-Logbook-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importArchive(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result);
      if (file.name.toLowerCase().endsWith(".json")) {
        const archive = JSON.parse(text);
        if (archive.schemaVersion !== 1 || !Array.isArray(archive.entries)) throw new Error("Unsupported JSON backup.");
        const existing = new Set(state.entries.map((entry) => entry.id));
        const incoming = archive.entries.filter((entry) => !existing.has(entry.id));
        state.entries.push(...incoming);
        if (archive.profile) state.profile = archive.profile;
        saveState();
        if (currentUser) syncAllLocalData().catch((error) => setStatus(error.message));
        alert(`Imported ${incoming.length} control${incoming.length === 1 ? "" : "s"}.`);
      } else {
        const imported = importHTMLLogbook(text);
        if (currentUser) syncAllLocalData().catch((error) => setStatus(error.message));
        alert(`Imported ${imported} control${imported === 1 ? "" : "s"}.`);
      }
      render();
    } catch (error) {
      alert(error.message || "Import failed.");
    }
  };
  reader.readAsText(file);
}

function importHTMLLogbook(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = Array.from(doc.querySelectorAll("tr")).map((row) => Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim()));
  const controls = rows.filter((cells) => cells.length >= 46 && /^\d{2}\/\d{2}\/\d{4}$/.test(cells[0]));
  controls.forEach((cells) => state.entries.push(entryFromHTMLCells(cells)));
  saveState();
  return controls.length;
}

function entryFromHTMLCells(cells) {
  const [day, month, year] = cells[0].split("/");
  const aircraft = parseAircraftCell(cells[2]);
  const marked = (index) => Boolean((cells[index] || "").trim());
  return {
    id: uid(),
    date: new Date(`${year}-${month}-${day}T12:00:00`).toISOString(),
    location: cells[1] || "",
    exerciseOperation: "",
    notes: "",
    successful: Number(cells[5] || 0) > 0 && Number(cells[6] || 0) === 0,
    environment: marked(9) ? "Simulator" : marked(8) ? "Airborne" : "Ground",
    controlType: marked(10) ? "Type 1" : marked(11) ? "Type 2" : "Type 3",
    attackMethod: marked(14) ? "BOC" : "BOT",
    aircraftCategory: marked(16) ? "Rotary Wing CAS" : "Fixed Wing CAS",
    marks: HTML_LOGBOOK_MARK_COLUMNS.filter(([index]) => marked(index)).map(([, value]) => value),
    constraints: HTML_LOGBOOK_CONSTRAINT_COLUMNS.filter(([index]) => marked(index)).map(([, value]) => value),
    cmp: marked(43),
    controllerStatus: OPTIONS.controllerStatuses.includes(cells[44]) ? cells[44] : "JTAC-Q",
    aircraft: [aircraft],
    ordnance: cells[4] ? [{ quantity: Math.max(1, Number(cells[3] || 1)), type: cells[4] }] : [],
    verification: cells[45] ? { name: cells[45].split(/\n/)[0], rank: "", appointment: cells[45], date: `${year}-${month}-${day}` } : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function saveProfile() {
  const previousProfile = state.profile || {};
  const data = new FormData($("#profileForm"));
  state.profile = Object.fromEntries(data.entries());
  state.profile.email = displayIdentifierFromUser(currentUser) || state.profile.email || "";
  state.profile.formationSeniorRequested = data.get("formationSeniorRequested") === "true";
  state.profile.formationSeniorRequestedAt = state.profile.formationSeniorRequested
    ? (previousProfile.formationSeniorRequestedAt || new Date().toISOString())
    : "";
  saveState();
  if (currentUser) saveRemoteProfile().catch((error) => setStatus(error.message));
}

async function syncAllLocalData() {
  if (!currentUser) return;
  setStatus("Syncing imported data...");
  await saveRemoteProfile();
  for (const entry of state.entries) {
    await saveRemoteEntry(entry);
  }
  setStatus("Imported data synced.");
}

function generateReport(type) {
  const snapshot = calculateCurrency();
  const profile = state.profile || {};
  const rows = state.entries.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const content = type === "currency" ? `
    <div class="report">
      <h1>JTAC Currency Summary</h1>
      <p>${escapeHTML([profile.rank, profile.name, profile.unit].filter(Boolean).join(" | "))}</p>
      <h2>Status: ${snapshot.state}</h2>
      <table><thead><tr><th>Requirement</th><th>Completed</th><th>Required</th><th>Remaining</th><th>Expiry</th></tr></thead>
      <tbody>${snapshot.requirements.map((item) => `<tr><td>${escapeHTML(item.name)}</td><td>${item.completed}</td><td>${item.required}</td><td>${item.remaining}</td><td>${item.expiryDate ? shortDate(item.expiryDate) : "Due now"}</td></tr>`).join("")}</tbody></table>
    </div>` : `
    <div class="report">
      <h1>CAS Mission Log</h1>
      <p>${escapeHTML([profile.rank, profile.name, profile.unit].filter(Boolean).join(" | "))}</p>
      <table><thead><tr><th>Date</th><th>Location</th><th>Aircraft</th><th>Type</th><th>Attack</th><th>Status</th><th>Verification</th></tr></thead>
      <tbody>${rows.map((entry) => `<tr><td>${shortDate(entry.date)}</td><td>${escapeHTML(entry.location)}</td><td>${escapeHTML(aircraftText(entry))}</td><td>${escapeHTML(entry.controlType)}</td><td>${escapeHTML(entry.attackMethod)}</td><td>${entry.successful ? "Successful" : "Unsuccessful"}</td><td>${escapeHTML(verificationText(entry))}</td></tr>`).join("")}</tbody></table>
    </div>`;
  $("#printArea").innerHTML = content;
  window.print();
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.closest("#authForm")) return;
  if (target.dataset.view) activeView = target.dataset.view;
  if (target.dataset.nav) activeView = target.dataset.nav;
  if (target.dataset.action === "add" || target.id === "quickAdd") openEntryDialog();
  if (target.dataset.action === "edit") openEntryDialog(state.entries.find((entry) => entry.id === target.dataset.id));
  if (target.dataset.action === "import") $("#fileImport").click();
  if (target.dataset.action === "export") exportData();
  if (target.dataset.action === "closeDialog") $("#entryDialog").close();
  if (target.dataset.action === "signOut") {
    await supabaseClient.auth.signOut();
  }
  if (target.dataset.action === "deleteAll" && confirm("Delete all controls from this browser?")) {
    if (currentUser) {
      const { error } = await supabaseClient.from("controls").delete().eq("user_id", currentUser.id);
      if (error) setStatus(error.message);
    }
    state.entries = [];
    saveState();
  }
  if (target.dataset.report) generateReport(target.dataset.report);
  render();
});

document.addEventListener("input", (event) => {
  if (["searchInput", "typeFilter", "statusFilter", "aircraftFilter", "sortFilter"].includes(event.target.id)) {
    filterState = {
      search: $("#searchInput")?.value || "",
      type: $("#typeFilter")?.value || "",
      status: $("#statusFilter")?.value || "",
      aircraft: $("#aircraftFilter")?.value || "",
      sort: $("#sortFilter")?.value || "newest"
    };
    renderLogbook();
  }
  if (event.target.closest("#profileForm")) saveProfile();
  if (event.target.dataset.kind === "mark") event.target.checked ? selectedMarks.add(event.target.value) : selectedMarks.delete(event.target.value);
  if (event.target.dataset.kind === "constraint") event.target.checked ? selectedConstraints.add(event.target.value) : selectedConstraints.delete(event.target.value);
});

document.addEventListener("submit", async (event) => {
  if (event.target.id !== "authForm") return;
  event.preventDefault();
  const identifier = normalizeAuthIdentifier($("#authEmail").value);
  if (!isValidAuthIdentifier(identifier)) {
    setStatus("Use letters, numbers, dots, hyphens or underscores for username.");
    return;
  }
  if (!hasValidInternalAuthDomain()) {
    setStatus("Username sign-in is not configured correctly.");
    return;
  }
  const email = authEmailFromIdentifier(identifier);
  const password = $("#authPassword").value;
  try {
    setStatus("Signing in...");
    const result = await supabaseClient.auth.signInWithPassword({ email, password });
    if (result.error) {
      setStatus(result.error.message);
      return;
    }
    if (result.data.session && result.data.user) {
      currentUser = result.data.user;
      await loadRemoteState();
      return;
    }
    setStatus("Unable to sign in. Check the email and password.");
  } catch (error) {
    setStatus(error.message || "Account action failed.");
  }
});

$("#entryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveEntryFromForm().catch((error) => setStatus(error.message || "Unable to save control."));
});

$("#entrySelfVerified").addEventListener("change", applySelfVerificationState);

$("#deleteEntry").addEventListener("click", () => {
  const id = $("#entryId").value;
  if (id && confirm("Delete this control?")) deleteEntry(id).catch((error) => setStatus(error.message || "Unable to delete control."));
});

$("#fileImport").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) importArchive(file);
  event.target.value = "";
});

bootstrapAuth();
