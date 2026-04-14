// ── Enums ──────────────────────────────────────────────
export type Role = "student" | "instructor" | "mechanic" | "admin" | "rental_customer";
export type UserStatus = "pending" | "active" | "inactive" | "rejected";
export type ReservationActivityType = "flight" | "simulator" | "oral" | "academic" | "misc";
export type ReservationStatus =
  | "requested"
  | "approved"
  | "dispatched"
  | "flown"
  | "pending_sign_off"
  | "closed"
  | "cancelled"
  | "no_show"
  | "scrubbed";
export type LessonKind = "ground" | "flight" | "simulator" | "oral" | "written_test";
export type MaintenanceItemStatus = "current" | "due_soon" | "overdue" | "grounding";
export type MaintenanceItemKind =
  | "annual_inspection"
  | "hundred_hour_inspection"
  | "oil_change"
  | "transponder_91_413"
  | "pitot_static_91_411"
  | "elt_battery"
  | "airworthiness_directive"
  | "component_life"
  | "custom";
export type SquawkSeverity = "info" | "watch" | "grounding";
export type SquawkStatus = "open" | "triaged" | "deferred" | "in_work" | "fixed" | "returned_to_service" | "cancelled";
export type WorkOrderStatus = "draft" | "open" | "in_progress" | "pending_signoff" | "closed" | "cancelled";
export type WorkOrderKind = "annual" | "100_hour" | "ad_compliance" | "squawk_repair" | "component_replacement" | "oil_change" | "custom";
export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR";
export type CurrencyKind = "cfi" | "cfii" | "mei" | "medical" | "bfr" | "ipc";
export type UnavailabilityKind = "vacation" | "sick" | "personal" | "training" | "other";
export type LineItemClassification = "required" | "optional" | "must_pass";
export type GradingScale = "absolute_ipm" | "relative_5" | "pass_fail";
export type CourseRatingSought = "private_pilot" | "instrument_rating" | "commercial_single_engine" | "commercial_multi_engine" | "cfi" | "cfii" | "mei" | "custom";
export type LessonGradeSheetStatus = "draft" | "signed" | "sealed";

// ── Core Entities ──────────────────────────────────────

export interface School {
  id: string;
  name: string;
  timezone: string;
  createdAt: string;
}

export interface Base {
  id: string;
  schoolId: string;
  name: string;
  timezone: string | null;
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  schoolId: string;
  email: string;
  fullName: string;
  timezone: string | null;
  status: UserStatus;
}

export interface UserRole {
  id: string;
  userId: string;
  role: Role;
  isDefault: boolean;
}

export interface PersonProfile {
  userId: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  emailAlt: string | null;
  faaAirmanCertNumber: string | null;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
}

// ── Aircraft & Fleet ───────────────────────────────────

export interface Aircraft {
  id: string;
  schoolId: string;
  baseId: string;
  tailNumber: string;
  make: string;
  model: string;
  year: number;
  equipmentNotes: string | null;
  groundedAt: string | null;
  groundedReason: string | null;
  equipmentTags: string[];
}

export interface AircraftCurrentTotals {
  aircraftId: string;
  currentHobbs: number;
  currentTach: number;
  currentAirframe: number;
  lastFlownAt: string | null;
}

// ── Rooms ──────────────────────────────────────────────

export interface Room {
  id: string;
  schoolId: string;
  baseId: string;
  name: string;
  capacity: number | null;
  features: string[] | null;
}

// ── Scheduling ─────────────────────────────────────────

export interface Reservation {
  id: string;
  schoolId: string;
  baseId: string;
  activityType: ReservationActivityType;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  aircraftId: string | null;
  instructorId: string | null;
  studentId: string | null;
  roomId: string | null;
  notes: string | null;
  lessonId: string | null;
}

export interface PersonUnavailability {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  kind: UnavailabilityKind;
  reason: string | null;
}

// ── Syllabus ───────────────────────────────────────────

export interface Course {
  id: string;
  schoolId: string | null;
  code: string;
  title: string;
  ratingSought: CourseRatingSought;
  description: string | null;
}

export interface CourseVersion {
  id: string;
  courseId: string;
  versionLabel: string;
  gradingScale: GradingScale;
  publishedAt: string | null;
}

export interface Stage {
  id: string;
  courseVersionId: string;
  position: number;
  code: string;
  title: string;
  objectives: string | null;
  completionStandards: string | null;
}

export interface Lesson {
  id: string;
  courseVersionId: string;
  stageId: string;
  position: number;
  code: string;
  title: string;
  kind: LessonKind;
  objectives: string | null;
  minHours: number | null;
}

export interface LineItem {
  id: string;
  courseVersionId: string;
  lessonId: string;
  position: number;
  code: string;
  title: string;
  classification: LineItemClassification;
}

// ── Enrollment & Grading ───────────────────────────────

export interface StudentCourseEnrollment {
  id: string;
  schoolId: string;
  userId: string;
  courseVersionId: string;
  primaryInstructorId: string | null;
  enrolledAt: string;
  completedAt: string | null;
  withdrawnAt: string | null;
  notes: string | null;
}

export interface LessonGradeSheet {
  id: string;
  schoolId: string;
  reservationId: string | null;
  studentEnrollmentId: string;
  lessonId: string;
  conductedAt: string;
  conductedByUserId: string;
  groundMinutes: number;
  flightMinutes: number;
  overallRemarks: string | null;
  status: LessonGradeSheetStatus;
}

// ── Maintenance ────────────────────────────────────────

export interface MaintenanceItem {
  id: string;
  schoolId: string;
  aircraftId: string;
  kind: MaintenanceItemKind;
  title: string;
  description: string | null;
  nextDueAt: string | null;
  nextDueHours: number | null;
  status: MaintenanceItemStatus;
}

export interface AircraftSquawk {
  id: string;
  schoolId: string;
  baseId: string;
  aircraftId: string;
  severity: SquawkSeverity;
  title: string;
  description: string | null;
  status: SquawkStatus;
  openedAt: string;
  openedByUserId: string;
  resolvedAt: string | null;
}

export interface WorkOrder {
  id: string;
  schoolId: string;
  aircraftId: string;
  status: WorkOrderStatus;
  kind: WorkOrderKind;
  title: string;
  description: string | null;
  assignedToUserId: string | null;
  createdAt: string;
}

// ── Instructor Currency ────────────────────────────────

export interface InstructorCurrency {
  id: string;
  userId: string;
  kind: CurrencyKind;
  effectiveAt: string;
  expiresAt: string | null;
}

// ── Map / Weather ──────────────────────────────────────

export interface AircraftPosition {
  icaoHex: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  groundSpeedKts: number;
  headingDeg: number;
  verticalRateFpm: number;
  isSchoolAircraft: boolean;
  tailNumber?: string;
  aircraftId?: string;
}

export interface MetarReport {
  station: string;
  raw: string;
  flightCategory: FlightCategory;
  temperature: number;
  dewpoint: number;
  windDirection: number;
  windSpeed: number;
  windGust: number | null;
  visibility: number;
  altimeter: number;
  clouds: string;
}

export interface WeatherWarning {
  id: string;
  type: "AIRMET" | "SIGMET" | "CONVECTIVE_SIGMET";
  title: string;
  description: string;
  severity: "moderate" | "severe";
  expiresAt: string;
}
