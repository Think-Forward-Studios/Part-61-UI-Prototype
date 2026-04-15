import { IDS } from "./ids";
import type {
  School, Base, User, UserRole, PersonProfile, EmergencyContact,
  Aircraft, AircraftCurrentTotals, Room, Reservation, PersonUnavailability,
  Course, CourseVersion, Stage, Lesson, LineItem,
  StudentCourseEnrollment, LessonGradeSheet,
  MaintenanceItem, AircraftSquawk, WorkOrder, InstructorCurrency,
  AircraftPosition, MetarReport, WeatherWarning, Role,
  StudentEndorsement, StageCheck, FlightLogTime, LineItemGrade,
  TestGrade, PersonHold, Document, InfoReleaseAuthorization,
  LessonOverride, NoShow, FifNotice, FifAcknowledgement,
  StudentProgressForecast, TrainingRecordAuditException,
  ScheduleBlock, ScheduleBlockInstance, AircraftEngine, AircraftEquipment,
  Geofence, PassengerManifest,
} from "@/lib/types";
import { addDays, addHours, format, subDays, startOfWeek } from "date-fns";

// ── Helpers ────────────────────────────────────────────
const now = new Date();
const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
const iso = (d: Date) => d.toISOString();
const dateStr = (d: Date) => format(d, "yyyy-MM-dd");
let lessonSeq = 0;
const lessonId = () => `AAAAAA00-lesson-0001-0001-${String(++lessonSeq).padStart(12, "0")}`;
let liSeq = 0;
const lineItemId = () => `BBBBBB00-li-00000001-0001-${String(++liSeq).padStart(12, "0")}`;
let resSeq = 0;
const resId = () => `CCCCCC00-res-0001-0001-${String(++resSeq).padStart(12, "0")}`;
let mxSeq = 0;
const mxId = () => `DDDDDD00-mx-00000001-0001-${String(++mxSeq).padStart(12, "0")}`;
let sqSeq = 0;
const sqId = () => `EEEEEE00-sq-00000001-0001-${String(++sqSeq).padStart(12, "0")}`;
let woSeq = 0;
const woId = () => `FFFFFF00-wo-00000001-0001-${String(++woSeq).padStart(12, "0")}`;
let gsSeq = 0;
const gsId = () => `GGGGGG00-gs-00000001-0001-${String(++gsSeq).padStart(12, "0")}`;

// ── School & Base ──────────────────────────────────────
export const school: School = {
  id: IDS.school, name: "TFS Flight School", timezone: "America/Chicago", createdAt: "2024-01-15T00:00:00Z",
};

export const base: Base = {
  id: IDS.base, schoolId: IDS.school, name: "Dothan Regional (KDHN)", timezone: null,
  latitude: 31.3213, longitude: -85.4496,
};

// ── Users ──────────────────────────────────────────────
export const users: User[] = [
  { id: IDS.instructorMike, schoolId: IDS.school, email: "instructor@tfs.test", fullName: "Mike Reynolds", timezone: null, status: "active" },
  { id: IDS.instructorSarah, schoolId: IDS.school, email: "sarah.chen@tfs.test", fullName: "Sarah Chen", timezone: null, status: "active" },
  { id: IDS.instructorJames, schoolId: IDS.school, email: "james.wright@tfs.test", fullName: "James Wright", timezone: null, status: "active" },
  { id: IDS.studentAlex, schoolId: IDS.school, email: "student@tfs.test", fullName: "Alex Martinez", timezone: null, status: "active" },
  { id: IDS.studentEmma, schoolId: IDS.school, email: "emma.johnson@tfs.test", fullName: "Emma Johnson", timezone: null, status: "active" },
  { id: IDS.studentLiam, schoolId: IDS.school, email: "liam.williams@tfs.test", fullName: "Liam Williams", timezone: null, status: "active" },
  { id: IDS.studentOlivia, schoolId: IDS.school, email: "olivia.brown@tfs.test", fullName: "Olivia Brown", timezone: null, status: "active" },
  { id: IDS.studentNoah, schoolId: IDS.school, email: "noah.davis@tfs.test", fullName: "Noah Davis", timezone: null, status: "active" },
  { id: IDS.studentAva, schoolId: IDS.school, email: "ava.wilson@tfs.test", fullName: "Ava Wilson", timezone: null, status: "inactive" },
  { id: IDS.mechanicDan, schoolId: IDS.school, email: "dan.garcia@tfs.test", fullName: "Dan Garcia", timezone: null, status: "active" },
  { id: IDS.adminLisa, schoolId: IDS.school, email: "admin@tfs.test", fullName: "Lisa Park", timezone: null, status: "active" },
];

export const userRoles: UserRole[] = [
  { id: "role-01", userId: IDS.instructorMike, role: "instructor", isDefault: true },
  { id: "role-02", userId: IDS.instructorSarah, role: "instructor", isDefault: true },
  { id: "role-03", userId: IDS.instructorJames, role: "instructor", isDefault: true },
  { id: "role-04", userId: IDS.studentAlex, role: "student", isDefault: true },
  { id: "role-05", userId: IDS.studentEmma, role: "student", isDefault: true },
  { id: "role-06", userId: IDS.studentLiam, role: "student", isDefault: true },
  { id: "role-07", userId: IDS.studentOlivia, role: "student", isDefault: true },
  { id: "role-08", userId: IDS.studentNoah, role: "student", isDefault: true },
  { id: "role-09", userId: IDS.studentAva, role: "student", isDefault: true },
  { id: "role-10", userId: IDS.mechanicDan, role: "mechanic", isDefault: true },
  { id: "role-11", userId: IDS.adminLisa, role: "admin", isDefault: true },
];

export const personProfiles: PersonProfile[] = [
  { userId: IDS.instructorMike, schoolId: IDS.school, firstName: "Mike", lastName: "Reynolds", dateOfBirth: "1985-03-12", addressLine1: "1234 Airport Blvd", addressLine2: null, city: "Dothan", state: "AL", postalCode: "36303", country: "US", phone: "334-555-0101", emailAlt: null, faaAirmanCertNumber: "3456789" },
  { userId: IDS.instructorSarah, schoolId: IDS.school, firstName: "Sarah", lastName: "Chen", dateOfBirth: "1990-07-22", addressLine1: "5678 Runway Dr", addressLine2: "Apt 4B", city: "Dothan", state: "AL", postalCode: "36301", country: "US", phone: "334-555-0102", emailAlt: null, faaAirmanCertNumber: "4567890" },
  { userId: IDS.instructorJames, schoolId: IDS.school, firstName: "James", lastName: "Wright", dateOfBirth: "1982-11-05", addressLine1: "910 Hangar Ln", addressLine2: null, city: "Enterprise", state: "AL", postalCode: "36330", country: "US", phone: "334-555-0103", emailAlt: null, faaAirmanCertNumber: "5678901" },
  { userId: IDS.studentAlex, schoolId: IDS.school, firstName: "Alex", lastName: "Martinez", dateOfBirth: "1998-05-18", addressLine1: "2345 Westgate Pkwy", addressLine2: null, city: "Dothan", state: "AL", postalCode: "36303", country: "US", phone: "334-555-0201", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentEmma, schoolId: IDS.school, firstName: "Emma", lastName: "Johnson", dateOfBirth: "2001-01-30", addressLine1: "4567 Ross Clark Cir", addressLine2: null, city: "Dothan", state: "AL", postalCode: "36301", country: "US", phone: "334-555-0202", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentLiam, schoolId: IDS.school, firstName: "Liam", lastName: "Williams", dateOfBirth: "1995-09-08", addressLine1: "789 Rucker Blvd", addressLine2: null, city: "Enterprise", state: "AL", postalCode: "36330", country: "US", phone: "334-555-0203", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentOlivia, schoolId: IDS.school, firstName: "Olivia", lastName: "Brown", dateOfBirth: "2000-12-14", addressLine1: "321 Main St", addressLine2: "Unit 12", city: "Enterprise", state: "AL", postalCode: "36330", country: "US", phone: "334-555-0204", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentNoah, schoolId: IDS.school, firstName: "Noah", lastName: "Davis", dateOfBirth: "1997-06-25", addressLine1: "654 Honeysuckle Rd", addressLine2: null, city: "Ozark", state: "AL", postalCode: "36360", country: "US", phone: "334-555-0205", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentAva, schoolId: IDS.school, firstName: "Ava", lastName: "Wilson", dateOfBirth: "1999-04-02", addressLine1: "987 Geneva Hwy", addressLine2: null, city: "Dothan", state: "AL", postalCode: "36305", country: "US", phone: "334-555-0206", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.mechanicDan, schoolId: IDS.school, firstName: "Dan", lastName: "Garcia", dateOfBirth: "1978-08-16", addressLine1: "111 Napier Field Rd", addressLine2: null, city: "Dothan", state: "AL", postalCode: "36303", country: "US", phone: "334-555-0301", emailAlt: null, faaAirmanCertNumber: "2345678" },
  { userId: IDS.adminLisa, schoolId: IDS.school, firstName: "Lisa", lastName: "Park", dateOfBirth: "1988-02-28", addressLine1: "222 Foster St", addressLine2: null, city: "Dothan", state: "AL", postalCode: "36301", country: "US", phone: "334-555-0401", emailAlt: null, faaAirmanCertNumber: null },
];

export const emergencyContacts: EmergencyContact[] = [
  { id: "ec-01", userId: IDS.studentAlex, name: "Maria Martinez", relationship: "Mother", phone: "512-555-0901", email: "maria.m@email.com", isPrimary: true },
  { id: "ec-02", userId: IDS.studentEmma, name: "Robert Johnson", relationship: "Father", phone: "512-555-0902", email: null, isPrimary: true },
  { id: "ec-03", userId: IDS.studentLiam, name: "Susan Williams", relationship: "Spouse", phone: "512-555-0903", email: "susan.w@email.com", isPrimary: true },
  { id: "ec-04", userId: IDS.studentOlivia, name: "James Brown", relationship: "Father", phone: "512-555-0904", email: null, isPrimary: true },
];

// ── Aircraft ───────────────────────────────────────────
export const aircraft: Aircraft[] = [
  { id: IDS.aircraftN172SP, schoolId: IDS.school, baseId: IDS.base, tailNumber: "N172SP", make: "Cessna", model: "172S Skyhawk SP", year: 2019, equipmentNotes: "G1000 NXi, GFC 700 autopilot", groundedAt: null, groundedReason: null, equipmentTags: ["ifr_equipped", "glass_panel", "g1000", "autopilot", "ads_b_out"] },
  { id: IDS.aircraftN152AB, schoolId: IDS.school, baseId: IDS.base, tailNumber: "N152AB", make: "Cessna", model: "152", year: 1978, equipmentNotes: "Basic VFR trainer, KLN-94 GPS", groundedAt: null, groundedReason: null, equipmentTags: ["kln_94"] },
  { id: IDS.aircraftN28PA, schoolId: IDS.school, baseId: IDS.base, tailNumber: "N28PA", make: "Piper", model: "PA-28-181 Archer III", year: 2005, equipmentNotes: "Garmin GTN 650, dual NAV/COM", groundedAt: null, groundedReason: null, equipmentTags: ["ifr_equipped", "gtn_650", "ads_b_out"] },
  { id: IDS.aircraftN182RG, schoolId: IDS.school, baseId: IDS.base, tailNumber: "N182RG", make: "Cessna", model: "182RG Skylane", year: 1985, equipmentNotes: "Retractable gear, complex aircraft", groundedAt: iso(subDays(now, 3)), groundedReason: "Annual inspection in progress", equipmentTags: ["ifr_equipped", "complex", "retractable_gear", "garmin_530"] },
  { id: IDS.aircraftN44ME, schoolId: IDS.school, baseId: IDS.base, tailNumber: "N44ME", make: "Piper", model: "PA-44 Seminole", year: 2010, equipmentNotes: "Multi-engine trainer, G500 TXi", groundedAt: null, groundedReason: null, equipmentTags: ["ifr_equipped", "glass_panel", "autopilot", "ads_b_out", "ads_b_in"] },
];

export const aircraftTotals: AircraftCurrentTotals[] = [
  { aircraftId: IDS.aircraftN172SP, currentHobbs: 4832.5, currentTach: 4210.3, currentAirframe: 4832.5, lastFlownAt: iso(subDays(now, 1)) },
  { aircraftId: IDS.aircraftN152AB, currentHobbs: 12450.8, currentTach: 11200.1, currentAirframe: 12450.8, lastFlownAt: iso(subDays(now, 2)) },
  { aircraftId: IDS.aircraftN28PA, currentHobbs: 6220.1, currentTach: 5510.7, currentAirframe: 6220.1, lastFlownAt: iso(subDays(now, 0)) },
  { aircraftId: IDS.aircraftN182RG, currentHobbs: 8915.3, currentTach: 7800.2, currentAirframe: 8915.3, lastFlownAt: iso(subDays(now, 5)) },
  { aircraftId: IDS.aircraftN44ME, currentHobbs: 3150.6, currentTach: 2840.9, currentAirframe: 3150.6, lastFlownAt: iso(subDays(now, 1)) },
];

// ── Rooms ──────────────────────────────────────────────
export const rooms: Room[] = [
  { id: IDS.roomBriefingA, schoolId: IDS.school, baseId: IDS.base, name: "Briefing Room A", capacity: 4, features: ["whiteboard", "projector", "wifi"] },
  { id: IDS.roomClassroomB, schoolId: IDS.school, baseId: IDS.base, name: "Classroom B", capacity: 12, features: ["projector", "wifi", "a/v system"] },
  { id: IDS.roomSimBay, schoolId: IDS.school, baseId: IDS.base, name: "Sim Bay", capacity: 3, features: ["AATD simulator", "dual controls"] },
];

// ── Syllabus (PPL) ─────────────────────────────────────
export const course: Course = {
  id: IDS.coursePPL, schoolId: IDS.school, code: "PPL-01",
  title: "Private Pilot Certificate", ratingSought: "private_pilot",
  description: "Part 61 Private Pilot training program covering all required knowledge and skill areas.",
};

export const courseVersion: CourseVersion = {
  id: IDS.courseVersionPPL, courseId: IDS.coursePPL, versionLabel: "v2024.1",
  gradingScale: "absolute_ipm", publishedAt: "2024-06-01T00:00:00Z",
};

export const stages: Stage[] = [
  { id: IDS.stagePreflight, courseVersionId: IDS.courseVersionPPL, position: 1, code: "STG-1", title: "Pre-Solo", objectives: "Achieve proficiency in basic maneuvers and procedures required for solo flight.", completionStandards: "Pass Stage 1 check with designated examiner." },
  { id: IDS.stageSoloPrep, courseVersionId: IDS.courseVersionPPL, position: 2, code: "STG-2", title: "Solo & Maneuvers", objectives: "Build solo experience and master all Private Pilot maneuvers.", completionStandards: "Complete required solo hours and pass Stage 2 check." },
  { id: IDS.stageXC, courseVersionId: IDS.courseVersionPPL, position: 3, code: "STG-3", title: "Cross-Country & Checkride Prep", objectives: "Complete cross-country requirements and prepare for practical test.", completionStandards: "Meet all Part 61 hour requirements and pass end-of-course check." },
];

// Lessons
const lIds = {
  intro: lessonId(), groundSchool1: lessonId(), preFlight: lessonId(),
  straightLevel: lessonId(), slowFlight: lessonId(), stalls: lessonId(),
  patterns: lessonId(), soloPrep: lessonId(), soloFlight: lessonId(),
  steepTurns: lessonId(), groundRef: lessonId(), xcPlanning: lessonId(),
  dualXC: lessonId(), soloXC: lessonId(), nightFlight: lessonId(),
  checkridePrep: lessonId(),
};

export const lessons: Lesson[] = [
  // Stage 1: Pre-Solo
  { id: lIds.intro, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 1, code: "L-1.1", title: "Introduction to Flight", kind: "flight", objectives: "Familiarization flight, cockpit orientation", minHours: 1.0 },
  { id: lIds.groundSchool1, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 2, code: "L-1.2", title: "Aerodynamics & Principles of Flight", kind: "ground", objectives: "Four forces, airfoils, angle of attack", minHours: 2.0 },
  { id: lIds.preFlight, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 3, code: "L-1.3", title: "Preflight Procedures", kind: "flight", objectives: "Checklist usage, preflight inspection, engine start", minHours: 1.0 },
  { id: lIds.straightLevel, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 4, code: "L-1.4", title: "Straight & Level Flight", kind: "flight", objectives: "Maintain altitude, heading, airspeed coordination", minHours: 1.5 },
  { id: lIds.slowFlight, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 5, code: "L-1.5", title: "Slow Flight", kind: "flight", objectives: "Flight at minimum controllable airspeed", minHours: 1.0 },
  { id: lIds.stalls, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 6, code: "L-1.6", title: "Stall Recognition & Recovery", kind: "flight", objectives: "Power-on and power-off stalls, departure stalls", minHours: 1.5 },
  { id: lIds.patterns, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 7, code: "L-1.7", title: "Traffic Patterns & Landings", kind: "flight", objectives: "Normal, crosswind, short field, soft field landings", minHours: 2.0 },
  { id: lIds.soloPrep, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stagePreflight, position: 8, code: "L-1.8", title: "Solo Preparation & Stage Check", kind: "flight", objectives: "Review all Stage 1 maneuvers, pre-solo written test", minHours: 1.5 },
  // Stage 2: Solo & Maneuvers
  { id: lIds.soloFlight, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageSoloPrep, position: 1, code: "L-2.1", title: "First Solo", kind: "flight", objectives: "Three solo takeoffs and landings in the traffic pattern", minHours: 1.0 },
  { id: lIds.steepTurns, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageSoloPrep, position: 2, code: "L-2.2", title: "Steep Turns & Performance Maneuvers", kind: "flight", objectives: "45-degree bank turns, chandelles, lazy eights", minHours: 1.5 },
  { id: lIds.groundRef, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageSoloPrep, position: 3, code: "L-2.3", title: "Ground Reference Maneuvers", kind: "flight", objectives: "Turns around a point, S-turns, rectangular course", minHours: 1.5 },
  // Stage 3: XC & Checkride
  { id: lIds.xcPlanning, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageXC, position: 1, code: "L-3.1", title: "Cross-Country Planning", kind: "ground", objectives: "Navigation log, weight & balance, fuel planning", minHours: 2.0 },
  { id: lIds.dualXC, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageXC, position: 2, code: "L-3.2", title: "Dual Cross-Country", kind: "flight", objectives: "Dual cross-country flight >50NM with instructor", minHours: 3.0 },
  { id: lIds.soloXC, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageXC, position: 3, code: "L-3.3", title: "Solo Cross-Country", kind: "flight", objectives: "Solo cross-country >150NM with full-stop landings at 3 points", minHours: 4.0 },
  { id: lIds.nightFlight, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageXC, position: 4, code: "L-3.4", title: "Night Flight", kind: "flight", objectives: "Night cross-country, 10 night takeoffs/landings", minHours: 3.0 },
  { id: lIds.checkridePrep, courseVersionId: IDS.courseVersionPPL, stageId: IDS.stageXC, position: 5, code: "L-3.5", title: "Checkride Preparation", kind: "flight", objectives: "Review all ACS areas, mock oral and flight test", minHours: 2.0 },
];

// Line items (sample for first few lessons)
export const lineItems: LineItem[] = [
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.intro, position: 1, code: "LI-1.1.1", title: "Cockpit Familiarization", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.intro, position: 2, code: "LI-1.1.2", title: "Four Fundamentals of Flight", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.intro, position: 3, code: "LI-1.1.3", title: "Use of Trim", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.straightLevel, position: 1, code: "LI-1.4.1", title: "Altitude Control (+/- 100ft)", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.straightLevel, position: 2, code: "LI-1.4.2", title: "Heading Control (+/- 10 deg)", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.straightLevel, position: 3, code: "LI-1.4.3", title: "Airspeed Control (+/- 10kts)", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.stalls, position: 1, code: "LI-1.6.1", title: "Power-Off Stall Recovery", classification: "must_pass" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.stalls, position: 2, code: "LI-1.6.2", title: "Power-On Stall Recovery", classification: "must_pass" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.patterns, position: 1, code: "LI-1.7.1", title: "Normal Landing", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.patterns, position: 2, code: "LI-1.7.2", title: "Crosswind Landing", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.patterns, position: 3, code: "LI-1.7.3", title: "Short Field Landing", classification: "required" },
  { id: lineItemId(), courseVersionId: IDS.courseVersionPPL, lessonId: lIds.patterns, position: 4, code: "LI-1.7.4", title: "Soft Field Landing", classification: "optional" },
];

// ── Enrollments ────────────────────────────────────────
export const enrollments: StudentCourseEnrollment[] = [
  { id: IDS.enrollAlex, schoolId: IDS.school, userId: IDS.studentAlex, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorMike, enrolledAt: "2025-09-15T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "Progressing well through Stage 2", planCadenceHoursPerWeek: 3 },
  { id: IDS.enrollEmma, schoolId: IDS.school, userId: IDS.studentEmma, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorMike, enrolledAt: "2026-01-10T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "New student, started Stage 1", planCadenceHoursPerWeek: 2 },
  { id: IDS.enrollLiam, schoolId: IDS.school, userId: IDS.studentLiam, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorSarah, enrolledAt: "2025-06-01T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "In Stage 3, preparing for checkride", planCadenceHoursPerWeek: 4 },
  { id: IDS.enrollOlivia, schoolId: IDS.school, userId: IDS.studentOlivia, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorMike, enrolledAt: "2025-11-20T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "Stage 1, landing practice", planCadenceHoursPerWeek: 2.5 },
];

// ── Grade Sheets (progress tracking) ───────────────────
export const gradeSheets: LessonGradeSheet[] = [
  // Alex - through Stage 1 complete + some Stage 2
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.intro, conductedAt: "2025-09-20T14:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 15, flightMinutes: 60, overallRemarks: "Good first flight, comfortable with controls", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.groundSchool1, conductedAt: "2025-09-22T10:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 120, flightMinutes: 0, overallRemarks: "Strong understanding of aerodynamics", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.preFlight, conductedAt: "2025-09-25T09:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 20, flightMinutes: 60, overallRemarks: "Thorough preflight, good checklist usage", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.straightLevel, conductedAt: "2025-10-01T14:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 10, flightMinutes: 90, overallRemarks: "Maintaining altitude well, heading needs work", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.slowFlight, conductedAt: "2025-10-05T08:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 10, flightMinutes: 60, overallRemarks: "Good slow flight, needs more rudder coordination", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.stalls, conductedAt: "2025-10-10T14:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 15, flightMinutes: 90, overallRemarks: "Stall recognition excellent, recovery prompt", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.patterns, conductedAt: "2025-10-20T08:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 10, flightMinutes: 120, overallRemarks: "Landings improving, crosswind technique developing", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.soloPrep, conductedAt: "2025-11-01T09:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 30, flightMinutes: 90, overallRemarks: "Ready for solo, passed pre-solo written", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.soloFlight, conductedAt: "2025-11-05T10:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 0, flightMinutes: 60, overallRemarks: "Successful first solo! Three full-stop landings", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollAlex, lessonId: lIds.steepTurns, conductedAt: "2025-11-15T14:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 10, flightMinutes: 90, overallRemarks: "Steep turns within standards, good bank control", status: "sealed" },
  // Emma - early Stage 1
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollEmma, lessonId: lIds.intro, conductedAt: "2026-01-15T14:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 20, flightMinutes: 60, overallRemarks: "Enthusiastic, natural feel for controls", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollEmma, lessonId: lIds.groundSchool1, conductedAt: "2026-01-18T10:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 120, flightMinutes: 0, overallRemarks: "Good grasp of theory", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollEmma, lessonId: lIds.preFlight, conductedAt: "2026-01-22T09:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 25, flightMinutes: 60, overallRemarks: "Thorough but slow, will improve with practice", status: "sealed" },
  // Olivia - early Stage 1
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollOlivia, lessonId: lIds.intro, conductedAt: "2025-11-25T14:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 15, flightMinutes: 60, overallRemarks: "Good orientation flight", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollOlivia, lessonId: lIds.groundSchool1, conductedAt: "2025-11-28T10:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 120, flightMinutes: 0, overallRemarks: "Needs review on lift/drag concepts", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollOlivia, lessonId: lIds.preFlight, conductedAt: "2025-12-02T09:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 20, flightMinutes: 60, overallRemarks: "Good preflight habits forming", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollOlivia, lessonId: lIds.straightLevel, conductedAt: "2025-12-08T14:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 10, flightMinutes: 90, overallRemarks: "Altitude control needs work, heading good", status: "sealed" },
  { id: gsId(), schoolId: IDS.school, reservationId: null, studentEnrollmentId: IDS.enrollOlivia, lessonId: lIds.slowFlight, conductedAt: "2025-12-15T08:00:00Z", conductedByUserId: IDS.instructorMike, groundMinutes: 10, flightMinutes: 60, overallRemarks: "Progressing well with slow flight", status: "sealed" },
];

// ── Reservations (current week) ────────────────────────
const mon = weekStart;
const tue = addDays(mon, 1);
const wed = addDays(mon, 2);
const thu = addDays(mon, 3);
const fri = addDays(mon, 4);

export const reservations: Reservation[] = [
  // Monday
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(mon, 8)), endTime: iso(addHours(mon, 10)), status: "approved", aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorMike, studentId: IDS.studentAlex, roomId: null, notes: "Ground reference maneuvers", lessonId: lIds.groundRef },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "academic", startTime: iso(addHours(mon, 10)), endTime: iso(addHours(mon, 12)), status: "approved", aircraftId: null, instructorId: IDS.instructorMike, studentId: IDS.studentEmma, roomId: IDS.roomBriefingA, notes: "Straight & level ground school", lessonId: lIds.straightLevel },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(mon, 13)), endTime: iso(addHours(mon, 15)), status: "approved", aircraftId: IDS.aircraftN28PA, instructorId: IDS.instructorMike, studentId: IDS.studentOlivia, roomId: null, notes: "Stall practice", lessonId: lIds.stalls },
  // Tuesday
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(tue, 7)), endTime: iso(addHours(tue, 9)), status: "approved", aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorMike, studentId: IDS.studentAlex, roomId: null, notes: "Solo practice area", lessonId: lIds.groundRef },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "oral", startTime: iso(addHours(tue, 10)), endTime: iso(addHours(tue, 11)), status: "requested", aircraftId: null, instructorId: IDS.instructorMike, studentId: IDS.studentEmma, roomId: IDS.roomBriefingA, notes: "Pre-flight procedures oral", lessonId: lIds.preFlight },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(tue, 14)), endTime: iso(addHours(tue, 16)), status: "approved", aircraftId: IDS.aircraftN152AB, instructorId: IDS.instructorSarah, studentId: IDS.studentLiam, roomId: null, notes: "Night XC planning", lessonId: lIds.nightFlight },
  // Wednesday
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(wed, 8)), endTime: iso(addHours(wed, 11)), status: "approved", aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorMike, studentId: IDS.studentOlivia, roomId: null, notes: "Pattern work - landings", lessonId: lIds.patterns },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "simulator", startTime: iso(addHours(wed, 13)), endTime: iso(addHours(wed, 15)), status: "approved", aircraftId: null, instructorId: IDS.instructorMike, studentId: IDS.studentAlex, roomId: IDS.roomSimBay, notes: "Instrument approaches practice", lessonId: null },
  // Thursday
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(thu, 7)), endTime: iso(addHours(thu, 10)), status: "requested", aircraftId: IDS.aircraftN28PA, instructorId: IDS.instructorMike, studentId: IDS.studentEmma, roomId: null, notes: "Slow flight & stalls intro", lessonId: lIds.slowFlight },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "academic", startTime: iso(addHours(thu, 10)), endTime: iso(addHours(thu, 12)), status: "approved", aircraftId: null, instructorId: IDS.instructorMike, studentId: IDS.studentAlex, roomId: IDS.roomClassroomB, notes: "XC planning ground school", lessonId: lIds.xcPlanning },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(thu, 14)), endTime: iso(addHours(thu, 17)), status: "approved", aircraftId: IDS.aircraftN44ME, instructorId: IDS.instructorJames, studentId: IDS.studentNoah, roomId: null, notes: "Multi-engine familiarization", lessonId: null },
  // Friday
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(fri, 8)), endTime: iso(addHours(fri, 12)), status: "approved", aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorSarah, studentId: IDS.studentLiam, roomId: null, notes: "Solo XC KDHN-KEUF-KTOI-KDHN", lessonId: lIds.soloXC },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(fri, 8)), endTime: iso(addHours(fri, 10)), status: "approved", aircraftId: IDS.aircraftN28PA, instructorId: IDS.instructorMike, studentId: IDS.studentOlivia, roomId: null, notes: "Traffic pattern practice", lessonId: lIds.patterns },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "oral", startTime: iso(addHours(fri, 13)), endTime: iso(addHours(fri, 14)), status: "approved", aircraftId: null, instructorId: IDS.instructorMike, studentId: IDS.studentAlex, roomId: IDS.roomBriefingA, notes: "Stage 2 oral review", lessonId: null },
  // Past - closed
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(addDays(mon, -3), 8)), endTime: iso(addHours(addDays(mon, -3), 10)), status: "closed", aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorMike, studentId: IDS.studentAlex, roomId: null, notes: "Steep turns review - completed", lessonId: lIds.steepTurns },
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(addDays(mon, -5), 14)), endTime: iso(addHours(addDays(mon, -5), 16)), status: "cancelled", aircraftId: IDS.aircraftN152AB, instructorId: IDS.instructorMike, studentId: IDS.studentEmma, roomId: null, notes: "Cancelled - weather", lessonId: lIds.straightLevel },
];

// ── Unavailabilities ───────────────────────────────────
export const unavailabilities: PersonUnavailability[] = [
  { id: "unav-01", userId: IDS.instructorMike, startTime: iso(addHours(wed, 16)), endTime: iso(addHours(wed, 20)), kind: "personal", reason: "Family commitment" },
  { id: "unav-02", userId: IDS.instructorSarah, startTime: iso(addHours(thu, 0)), endTime: iso(addHours(fri, 0)), kind: "training", reason: "CFII renewal workshop" },
];

// ── Maintenance ────────────────────────────────────────
export const maintenanceItems: MaintenanceItem[] = [
  // N172SP
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, kind: "annual_inspection", title: "Annual Inspection", description: "FAR 91.409 annual airworthiness inspection. Covers airframe, engine, propeller, and all installed equipment.", nextDueAt: iso(addDays(now, 45)), nextDueHours: null, status: "current", lastCompletedAt: iso(subDays(now, 320)) },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, kind: "oil_change", title: "Oil Change", description: "Full oil and filter change. Phillips X/C 20W-50, Champion CH48110-1 filter.", nextDueAt: null, nextDueHours: 4875, status: "due_soon", lastCompletedAt: iso(subDays(now, 45)) },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, kind: "hundred_hour_inspection", title: "100-Hour Inspection", description: "Required for aircraft used in flight instruction. Covers same scope as annual.", nextDueAt: null, nextDueHours: 4900, status: "current", lastCompletedAt: iso(subDays(now, 60)) },
  // N152AB
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN152AB, kind: "annual_inspection", title: "Annual Inspection", description: "FAR 91.409 annual airworthiness inspection.", nextDueAt: iso(addDays(now, 12)), nextDueHours: null, status: "due_soon", lastCompletedAt: iso(subDays(now, 353)) },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN152AB, kind: "transponder_91_413", title: "Transponder Check (91.413)", description: "Biennial transponder/encoder test per FAR 91.413. Must be performed by certified repair station.", nextDueAt: iso(addDays(now, 90)), nextDueHours: null, status: "current", lastCompletedAt: iso(subDays(now, 640)) },
  // N28PA
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN28PA, kind: "oil_change", title: "Oil Change", description: "Scheduled engine oil and filter change.", nextDueAt: null, nextDueHours: 6240, status: "due_soon", lastCompletedAt: iso(subDays(now, 40)) },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN28PA, kind: "hundred_hour_inspection", title: "100-Hour Inspection", description: "Required 100-hour inspection for flight training aircraft.", nextDueAt: null, nextDueHours: 6250, status: "due_soon", lastCompletedAt: iso(subDays(now, 55)) },
  // N182RG - grounded
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN182RG, kind: "annual_inspection", title: "Annual Inspection", description: "Currently in annual. Gear system requires additional inspection time due to intermittent indicator issue.", nextDueAt: iso(subDays(now, 5)), nextDueHours: null, status: "overdue", lastCompletedAt: iso(subDays(now, 370)) },
  // N44ME
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN44ME, kind: "annual_inspection", title: "Annual Inspection", description: "FAR 91.409 annual airworthiness inspection for twin-engine aircraft.", nextDueAt: iso(addDays(now, 120)), nextDueHours: null, status: "current", lastCompletedAt: iso(subDays(now, 245)) },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN44ME, kind: "oil_change", title: "Oil Change (L)", description: "Left engine oil and filter change. AeroShell W100 Plus.", nextDueAt: null, nextDueHours: 3180, status: "due_soon", lastCompletedAt: iso(subDays(now, 50)) },
];

export const squawks: AircraftSquawk[] = [
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN152AB, severity: "info", title: "Slight paint chip on left wing tip", description: "Cosmetic only, no structural concern", status: "deferred", openedAt: iso(subDays(now, 10)), openedByUserId: IDS.instructorSarah, resolvedAt: null, deferredUntil: iso(addDays(now, 60)), deferralJustification: "Cosmetic only. Will address during next annual inspection." },
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN182RG, severity: "grounding", title: "Nose gear indicator intermittent", description: "Gear indicator light flickers during retraction cycle. Needs relay inspection.", status: "in_work", openedAt: iso(subDays(now, 4)), openedByUserId: IDS.instructorJames, resolvedAt: null, deferredUntil: null, deferralJustification: null },
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN172SP, severity: "watch", title: "Alternator output low on hot days", description: "Voltage drops below 13.5V after extended ground ops on hot days. Monitor.", status: "triaged", openedAt: iso(subDays(now, 7)), openedByUserId: IDS.instructorMike, resolvedAt: null, deferredUntil: null, deferralJustification: null },
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN28PA, severity: "info", title: "Seat track needs lubrication", description: "Pilot seat track slightly stiff", status: "open", openedAt: iso(subDays(now, 2)), openedByUserId: IDS.studentAlex, resolvedAt: null, deferredUntil: null, deferralJustification: null },
];

export const workOrders: WorkOrder[] = [
  { id: woId(), schoolId: IDS.school, aircraftId: IDS.aircraftN182RG, status: "in_progress", kind: "annual", title: "N182RG Annual Inspection", description: "Full annual inspection including gear system check. Gear swing test required. Engine compression check, prop inspection, and all AD compliance verification.", assignedToUserId: IDS.mechanicDan, createdAt: iso(subDays(now, 3)), startedAt: iso(subDays(now, 2)), completedAt: null, signedOffAt: null, signedOffByUserId: null },
  { id: woId(), schoolId: IDS.school, aircraftId: IDS.aircraftN182RG, status: "open", kind: "squawk_repair", title: "Nose Gear Indicator Repair", description: "Investigate and repair intermittent nose gear indicator relay. Check wiring harness and micro-switch alignment. Replace relay if needed.", assignedToUserId: IDS.mechanicDan, createdAt: iso(subDays(now, 4)), startedAt: null, completedAt: null, signedOffAt: null, signedOffByUserId: null },
  { id: woId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, status: "draft", kind: "oil_change", title: "N172SP Oil Change", description: "Scheduled oil and filter change at 4875 hrs. Use Phillips X/C 20W-50 and Champion CH48110-1 filter. Cut open old filter for inspection.", assignedToUserId: null, createdAt: iso(subDays(now, 1)), startedAt: null, completedAt: null, signedOffAt: null, signedOffByUserId: null },
];

// ── Instructor Currencies ──────────────────────────────
export const instructorCurrencies: InstructorCurrency[] = [
  { id: "cur-01", userId: IDS.instructorMike, kind: "cfi", effectiveAt: "2025-06-15T00:00:00Z", expiresAt: "2027-06-30T00:00:00Z" },
  { id: "cur-02", userId: IDS.instructorMike, kind: "cfii", effectiveAt: "2025-06-15T00:00:00Z", expiresAt: "2027-06-30T00:00:00Z" },
  { id: "cur-03", userId: IDS.instructorMike, kind: "medical", effectiveAt: "2026-01-10T00:00:00Z", expiresAt: "2027-01-31T00:00:00Z" },
  { id: "cur-04", userId: IDS.instructorMike, kind: "bfr", effectiveAt: "2025-06-15T00:00:00Z", expiresAt: "2027-06-30T00:00:00Z" },
  { id: "cur-05", userId: IDS.instructorSarah, kind: "cfi", effectiveAt: "2025-03-01T00:00:00Z", expiresAt: "2027-02-28T00:00:00Z" },
  { id: "cur-06", userId: IDS.instructorSarah, kind: "medical", effectiveAt: "2025-08-20T00:00:00Z", expiresAt: "2026-08-31T00:00:00Z" },
];

// ── METAR ──────────────────────────────────────────────
export const metarReports: MetarReport[] = [
  { station: "KDHN", raw: "KDHN 131753Z 18010KT 10SM FEW045 SCT250 32/18 A2992 RMK AO2 SLP128", flightCategory: "VFR", temperature: 32, dewpoint: 18, windDirection: 180, windSpeed: 10, windGust: null, visibility: 10, altimeter: 29.92, clouds: "FEW045 SCT250" },
  { station: "KEUF", raw: "KEUF 131755Z AUTO 17008KT 10SM CLR 31/17 A2993", flightCategory: "VFR", temperature: 31, dewpoint: 17, windDirection: 170, windSpeed: 8, windGust: null, visibility: 10, altimeter: 29.93, clouds: "CLR" },
  { station: "KTOI", raw: "KTOI 131756Z AUTO 20012G18KT 7SM BKN025 OVC040 28/21 A2990", flightCategory: "MVFR", temperature: 28, dewpoint: 21, windDirection: 200, windSpeed: 12, windGust: 18, visibility: 7, altimeter: 29.90, clouds: "BKN025 OVC040" },
  { station: "KOZR", raw: "KOZR 131755Z 19015G22KT 4SM BR OVC015 25/22 A2988", flightCategory: "IFR", temperature: 25, dewpoint: 22, windDirection: 190, windSpeed: 15, windGust: 22, visibility: 4, altimeter: 29.88, clouds: "OVC015" },
  { station: "KPAM", raw: "KPAM 131754Z AUTO 21008KT 10SM SCT060 30/16 A2991", flightCategory: "VFR", temperature: 30, dewpoint: 16, windDirection: 210, windSpeed: 8, windGust: null, visibility: 10, altimeter: 29.91, clouds: "SCT060" },
];

// ── Aircraft Positions (ADS-B mock) ────────────────────
export const aircraftPositions: AircraftPosition[] = [
  // School aircraft - flying
  { icaoHex: "A12345", callsign: "N172SP", latitude: 31.48, longitude: -85.30, altitudeFt: 3500, groundSpeedKts: 105, headingDeg: 270, verticalRateFpm: 0, isSchoolAircraft: true, tailNumber: "N172SP", aircraftId: IDS.aircraftN172SP },
  { icaoHex: "A23456", callsign: "N28PA", latitude: 31.15, longitude: -85.60, altitudeFt: 4500, groundSpeedKts: 115, headingDeg: 180, verticalRateFpm: -200, isSchoolAircraft: true, tailNumber: "N28PA", aircraftId: IDS.aircraftN28PA },
  // School aircraft - on ground
  { icaoHex: "A34567", callsign: "N152AB", latitude: 31.3213, longitude: -85.4496, altitudeFt: 0, groundSpeedKts: 0, headingDeg: 0, verticalRateFpm: 0, isSchoolAircraft: true, tailNumber: "N152AB", aircraftId: IDS.aircraftN152AB },
  // Traffic
  { icaoHex: "B11111", callsign: "SWA1234", latitude: 31.50, longitude: -85.20, altitudeFt: 8000, groundSpeedKts: 250, headingDeg: 320, verticalRateFpm: -500, isSchoolAircraft: false },
  { icaoHex: "B22222", callsign: "UAL567", latitude: 31.70, longitude: -85.50, altitudeFt: 12000, groundSpeedKts: 300, headingDeg: 45, verticalRateFpm: 0, isSchoolAircraft: false },
  { icaoHex: "B33333", callsign: "N789XY", latitude: 31.10, longitude: -85.25, altitudeFt: 5500, groundSpeedKts: 130, headingDeg: 90, verticalRateFpm: 500, isSchoolAircraft: false },
  { icaoHex: "B44444", callsign: "AAL890", latitude: 31.60, longitude: -85.70, altitudeFt: 15000, groundSpeedKts: 350, headingDeg: 200, verticalRateFpm: -1000, isSchoolAircraft: false },
  { icaoHex: "B55555", callsign: "N456PP", latitude: 31.25, longitude: -85.15, altitudeFt: 2500, groundSpeedKts: 90, headingDeg: 150, verticalRateFpm: 0, isSchoolAircraft: false },
  { icaoHex: "B66666", callsign: "SKW321", latitude: 31.80, longitude: -85.40, altitudeFt: 10000, groundSpeedKts: 280, headingDeg: 260, verticalRateFpm: 0, isSchoolAircraft: false },
  { icaoHex: "B77777", callsign: "N901AB", latitude: 31.35, longitude: -85.80, altitudeFt: 6000, groundSpeedKts: 140, headingDeg: 30, verticalRateFpm: 200, isSchoolAircraft: false },
];

// ── Weather Warnings ───────────────────────────────────
export const weatherWarnings: WeatherWarning[] = [
  { id: "wx-01", type: "AIRMET", title: "AIRMET TANGO - Turbulence", description: "Moderate turbulence below 8000ft MSL due to low-level wind shear. Area from KDHN 30NM NW to 50NM NE.", severity: "moderate", expiresAt: iso(addHours(now, 4)) },
];

// ── Student Endorsements ───────────────────────────────
export const studentEndorsements: StudentEndorsement[] = [
  // Alex - has several endorsements (through Stage 2)
  { id: "end-01", schoolId: IDS.school, studentUserId: IDS.studentAlex, templateId: null, renderedText: "I certify that I have given Alex Martinez the training required by 14 CFR 61.87(b) and find them competent to make solo flights.", issuedAt: "2025-11-01T09:00:00Z", issuedByUserId: IDS.instructorMike, category: "solo", expiresAt: "2026-11-01T00:00:00Z", aircraftContext: "Cessna 172S (N172SP)", sealed: true, revokedAt: null },
  { id: "end-02", schoolId: IDS.school, studentUserId: IDS.studentAlex, templateId: null, renderedText: "I certify that Alex Martinez has received the required training of 14 CFR 61.93 and is competent for solo cross-country flight.", issuedAt: "2025-12-15T10:00:00Z", issuedByUserId: IDS.instructorMike, category: "xc", expiresAt: "2026-12-15T00:00:00Z", aircraftContext: "Cessna 172S (N172SP)", sealed: true, revokedAt: null },
  { id: "end-03", schoolId: IDS.school, studentUserId: IDS.studentAlex, templateId: null, renderedText: "I certify that Alex Martinez has satisfactorily completed the aeronautical knowledge areas of 14 CFR 61.105 for Private Pilot.", issuedAt: "2026-01-20T14:00:00Z", issuedByUserId: IDS.instructorMike, category: "knowledge_test", expiresAt: null, aircraftContext: null, sealed: true, revokedAt: null },
  // Emma - student pilot endorsement only
  { id: "end-04", schoolId: IDS.school, studentUserId: IDS.studentEmma, templateId: null, renderedText: "I certify that Emma Johnson has received the training required by 14 CFR 61.87(b) for student pilot privileges.", issuedAt: "2026-01-15T14:00:00Z", issuedByUserId: IDS.instructorMike, category: "student_pilot", expiresAt: null, aircraftContext: null, sealed: true, revokedAt: null },
];

// ── Stage Checks ───────────────────────────────────────
export const stageChecks: StageCheck[] = [
  { id: "sc-01", schoolId: IDS.school, studentEnrollmentId: IDS.enrollAlex, stageId: IDS.stagePreflight, checkerUserId: IDS.instructorSarah, scheduledAt: "2025-11-01T08:00:00Z", conductedAt: "2025-11-01T08:00:00Z", status: "passed", remarks: "Excellent performance. Ready for solo.", sealed: true },
  { id: "sc-02", schoolId: IDS.school, studentEnrollmentId: IDS.enrollAlex, stageId: IDS.stageSoloPrep, checkerUserId: IDS.instructorJames, scheduledAt: iso(addDays(now, 7)), conductedAt: null, status: "scheduled", remarks: null, sealed: false },
  { id: "sc-03", schoolId: IDS.school, studentEnrollmentId: IDS.enrollOlivia, stageId: IDS.stagePreflight, checkerUserId: IDS.instructorSarah, scheduledAt: iso(addDays(now, 14)), conductedAt: null, status: "scheduled", remarks: null, sealed: false },
];

// ── Flight Log Time ────────────────────────────────────
export const flightLogTimes: FlightLogTime[] = [
  // Alex cumulative times
  { id: "flt-01", schoolId: IDS.school, reservationId: null, userId: IDS.studentAlex, kind: "dual_received", dayMinutes: 1080, nightMinutes: 120, crossCountryMinutes: 360, instrumentActualMinutes: 0, instrumentSimulatedMinutes: 60, isSimulator: false, dayLandings: 85, nightLandings: 10, instrumentApproaches: 3 },
  { id: "flt-02", schoolId: IDS.school, reservationId: null, userId: IDS.studentAlex, kind: "solo", dayMinutes: 420, nightMinutes: 0, crossCountryMinutes: 180, instrumentActualMinutes: 0, instrumentSimulatedMinutes: 0, isSimulator: false, dayLandings: 35, nightLandings: 0, instrumentApproaches: 0 },
  // Emma
  { id: "flt-03", schoolId: IDS.school, reservationId: null, userId: IDS.studentEmma, kind: "dual_received", dayMinutes: 240, nightMinutes: 0, crossCountryMinutes: 0, instrumentActualMinutes: 0, instrumentSimulatedMinutes: 0, isSimulator: false, dayLandings: 15, nightLandings: 0, instrumentApproaches: 0 },
  // Olivia
  { id: "flt-04", schoolId: IDS.school, reservationId: null, userId: IDS.studentOlivia, kind: "dual_received", dayMinutes: 480, nightMinutes: 0, crossCountryMinutes: 0, instrumentActualMinutes: 0, instrumentSimulatedMinutes: 0, isSimulator: false, dayLandings: 40, nightLandings: 0, instrumentApproaches: 0 },
];

// ── Line Item Grades ───────────────────────────────────
export const lineItemGrades: LineItemGrade[] = [
  // Grades for Alex's completed lessons (sample for intro lesson line items)
  { id: "lig-01", gradeSheetId: gradeSheets[0]!.id, lineItemId: lineItems[0]!.id, gradeValue: "3", gradeRemarks: "Good cockpit familiarization", position: 1 },
  { id: "lig-02", gradeSheetId: gradeSheets[0]!.id, lineItemId: lineItems[1]!.id, gradeValue: "3", gradeRemarks: "Understands four fundamentals", position: 2 },
  { id: "lig-03", gradeSheetId: gradeSheets[0]!.id, lineItemId: lineItems[2]!.id, gradeValue: "2", gradeRemarks: "Needs more practice with trim", position: 3 },
];

// ── Test Grades ────────────────────────────────────────
export const testGrades: TestGrade[] = [
  { id: "tg-01", schoolId: IDS.school, studentEnrollmentId: IDS.enrollAlex, componentKind: "course", componentId: IDS.coursePPL, testKind: "knowledge", score: 88, maxScore: 100, remarks: "PAR score: Private Pilot Airplane", sealed: true, recordedAt: "2026-02-10T14:00:00Z", recordedByUserId: IDS.instructorMike },
  { id: "tg-02", schoolId: IDS.school, studentEnrollmentId: IDS.enrollAlex, componentKind: "stage", componentId: IDS.stagePreflight, testKind: "oral", score: null, maxScore: null, remarks: "Satisfactory oral on Stage 1 areas", sealed: true, recordedAt: "2025-11-01T08:00:00Z", recordedByUserId: IDS.instructorSarah },
];

// ── Person Holds ───────────────────────────────────────
export const personHolds: PersonHold[] = [
  { id: "ph-01", schoolId: IDS.school, userId: IDS.studentNoah, kind: "hold", reason: "Medical certificate expired - awaiting renewal documentation", createdByUserId: IDS.adminLisa, createdAt: iso(subDays(now, 5)), clearedAt: null, clearedByUserId: null, clearedReason: null },
];

// ── Documents ──────────────────────────────────────────
export const documents: Document[] = [
  { id: "doc-01", schoolId: IDS.school, userId: IDS.studentAlex, kind: "medical", storagePath: "/docs/alex-medical-3rd.pdf", mimeType: "application/pdf", byteSize: 245000, expiresAt: "2027-05-31T00:00:00Z", uploadedAt: "2025-09-20T10:00:00Z", uploadedByUserId: IDS.studentAlex },
  { id: "doc-02", schoolId: IDS.school, userId: IDS.studentAlex, kind: "government_id", storagePath: "/docs/alex-id.jpg", mimeType: "image/jpeg", byteSize: 1200000, expiresAt: "2028-03-12T00:00:00Z", uploadedAt: "2025-09-15T09:00:00Z", uploadedByUserId: IDS.studentAlex },
  { id: "doc-03", schoolId: IDS.school, userId: IDS.studentEmma, kind: "medical", storagePath: "/docs/emma-medical-3rd.pdf", mimeType: "application/pdf", byteSize: 198000, expiresAt: "2027-01-31T00:00:00Z", uploadedAt: "2026-01-10T11:00:00Z", uploadedByUserId: IDS.studentEmma },
  { id: "doc-04", schoolId: IDS.school, userId: IDS.studentOlivia, kind: "medical", storagePath: "/docs/olivia-medical-3rd.pdf", mimeType: "application/pdf", byteSize: 210000, expiresAt: "2026-12-31T00:00:00Z", uploadedAt: "2025-11-20T09:00:00Z", uploadedByUserId: IDS.studentOlivia },
  { id: "doc-05", schoolId: IDS.school, userId: IDS.studentOlivia, kind: "pilot_license", storagePath: "/docs/olivia-student-cert.pdf", mimeType: "application/pdf", byteSize: 156000, expiresAt: null, uploadedAt: "2025-11-22T10:00:00Z", uploadedByUserId: IDS.studentOlivia },
];

// ── Info Release Authorizations ────────────────────────
export const infoReleaseAuthorizations: InfoReleaseAuthorization[] = [
  { id: "ira-01", schoolId: IDS.school, userId: IDS.studentAlex, name: "Maria Martinez", relationship: "Mother", grantedAt: "2025-09-15T00:00:00Z", revokedAt: null, notes: "Can receive all training progress updates" },
  { id: "ira-02", schoolId: IDS.school, userId: IDS.studentEmma, name: "Robert Johnson", relationship: "Father", grantedAt: "2026-01-10T00:00:00Z", revokedAt: null, notes: "Billing and progress inquiries" },
];

// ── Lesson Overrides ───────────────────────────────────
export const lessonOverrides: LessonOverride[] = [
  { id: "lo-01", schoolId: IDS.school, studentEnrollmentId: IDS.enrollAlex, lessonId: lessons[12]!.id, kind: "prerequisite_skip", justification: "Student demonstrated XC planning competency in ground school; skipping redundant lesson.", grantedAt: "2026-03-01T10:00:00Z", grantedByUserId: IDS.instructorMike, expiresAt: "2026-03-31T00:00:00Z", consumedAt: null, revokedAt: null },
];

// ── No-Shows ───────────────────────────────────────────
export const noShows: NoShow[] = [
  { id: "ns-01", schoolId: IDS.school, userId: IDS.studentNoah, scheduledAt: iso(subDays(now, 12)), aircraftId: IDS.aircraftN28PA, instructorId: IDS.instructorMike, recordedByUserId: IDS.instructorMike, recordedAt: iso(subDays(now, 12)), reason: "No contact - did not show for scheduled flight" },
  { id: "ns-02", schoolId: IDS.school, userId: IDS.studentEmma, scheduledAt: iso(subDays(now, 45)), aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorMike, recordedByUserId: IDS.instructorMike, recordedAt: iso(subDays(now, 45)), reason: "Called 10 min before - car trouble" },
];

// ── FIF Notices ────────────────────────────────────────
export const fifNotices: FifNotice[] = [
  { id: "fif-01", schoolId: IDS.school, baseId: IDS.base, title: "Runway 14/32 NOTAM - Displaced Threshold", body: "Effective immediately: Runway 14 threshold displaced 500ft for construction. Expect reduced landing distance available. Use caution during approach. Construction estimated through May 2026.", severity: "important", postedAt: iso(subDays(now, 2)), postedByUserId: IDS.adminLisa, effectiveAt: iso(subDays(now, 2)), expiresAt: iso(addDays(now, 45)) },
  { id: "fif-02", schoolId: IDS.school, baseId: IDS.base, title: "Bird Activity Advisory", body: "Increased bird activity reported in the vicinity of KDHN, particularly during morning and evening hours. Exercise caution during takeoff and landing. Report any bird strikes immediately.", severity: "info", postedAt: iso(subDays(now, 1)), postedByUserId: IDS.instructorJames, effectiveAt: iso(subDays(now, 1)), expiresAt: iso(addDays(now, 14)) },
  { id: "fif-03", schoolId: IDS.school, baseId: IDS.base, title: "Temporary Flight Restriction - Military Exercise", body: "TFR active R-2907 complex (Ft Novosel). Altitude: SFC-15000 MSL. Contact Cairns Approach for transition. Active daily 0800-2200L through end of month.", severity: "critical", postedAt: iso(subDays(now, 0)), postedByUserId: IDS.adminLisa, effectiveAt: iso(subDays(now, 0)), expiresAt: iso(addDays(now, 30)) },
];

export const fifAcknowledgements: FifAcknowledgement[] = [
  { id: "fif-ack-01", noticeId: "fif-01", userId: IDS.instructorMike, acknowledgedAt: iso(subDays(now, 1)) },
  { id: "fif-ack-02", noticeId: "fif-02", userId: IDS.instructorMike, acknowledgedAt: iso(subDays(now, 0)) },
  // fif-03 (TFR) NOT acknowledged by Mike yet
];

// ── Progress Forecasts ─────────────────────────────────
export const progressForecasts: StudentProgressForecast[] = [
  { studentEnrollmentId: IDS.enrollAlex, computedAt: iso(subDays(now, 1)), expectedHoursToDate: 28.0, actualHoursToDate: 25.0, aheadBehindHours: -3.0, aheadBehindWeeks: -0.75, remainingHours: 15.0, projectedCheckrideDate: "2026-07-15", projectedCompletionDate: "2026-07-20", confidence: "high" },
  { studentEnrollmentId: IDS.enrollEmma, computedAt: iso(subDays(now, 1)), expectedHoursToDate: 8.0, actualHoursToDate: 4.0, aheadBehindHours: -4.0, aheadBehindWeeks: -1.0, remainingHours: 36.0, projectedCheckrideDate: "2026-11-01", projectedCompletionDate: "2026-11-15", confidence: "medium" },
  { studentEnrollmentId: IDS.enrollOlivia, computedAt: iso(subDays(now, 1)), expectedHoursToDate: 16.0, actualHoursToDate: 8.0, aheadBehindHours: -8.0, aheadBehindWeeks: -2.0, remainingHours: 32.0, projectedCheckrideDate: "2026-10-01", projectedCompletionDate: "2026-10-15", confidence: "low" },
];

// ── Training Record Audit Exceptions ───────────────────
export const auditExceptions: TrainingRecordAuditException[] = [
  { id: "ae-01", schoolId: IDS.school, studentEnrollmentId: IDS.enrollOlivia, kind: "hours_deficit", severity: "warn", details: { expectedHours: 16, actualHours: 8, deficit: 8 }, firstDetectedAt: iso(subDays(now, 7)), lastDetectedAt: iso(subDays(now, 1)), resolvedAt: null },
  { id: "ae-02", schoolId: IDS.school, studentEnrollmentId: IDS.enrollAlex, kind: "expired_overrides", severity: "info", details: { overrideId: "lo-01", lessonCode: "L-3.1", expiresAt: "2026-03-31" }, firstDetectedAt: iso(subDays(now, 3)), lastDetectedAt: iso(subDays(now, 1)), resolvedAt: null },
];

// ── Helper: Auth lookup ────────────────────────────────
export const mockCredentials: Record<string, { userId: string; role: Role }> = {
  "instructor@tfs.test": { userId: IDS.instructorMike, role: "instructor" },
  "student@tfs.test": { userId: IDS.studentAlex, role: "student" },
  "admin@tfs.test": { userId: IDS.adminLisa, role: "admin" },
};

// ── Helper: get user's students ────────────────────────
export function getInstructorStudents(instructorId: string) {
  const studentEnrollments = enrollments.filter(e => e.primaryInstructorId === instructorId && !e.completedAt && !e.withdrawnAt);
  return studentEnrollments.map(e => {
    const user = users.find(u => u.id === e.userId)!;
    const profile = personProfiles.find(p => p.userId === e.userId)!;
    const completedLessons = gradeSheets.filter(gs => gs.studentEnrollmentId === e.id && gs.status === "sealed");
    const totalLessons = lessons.length;
    const lastActivity = completedLessons.length > 0
      ? completedLessons.sort((a, b) => b.conductedAt.localeCompare(a.conductedAt))[0]!.conductedAt
      : e.enrolledAt;
    const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

    return {
      user,
      profile,
      enrollment: e,
      completedLessons: completedLessons.length,
      totalLessons,
      progressPercent: Math.round((completedLessons.length / totalLessons) * 100),
      lastActivity,
      daysSinceActivity,
      status: daysSinceActivity > 30 ? "idle" as const : "active" as const,
    };
  });
}

// ── Helper: get next lesson for student ────────────────
export function getNextLesson(enrollmentId: string) {
  const completed = new Set(gradeSheets.filter(gs => gs.studentEnrollmentId === enrollmentId && gs.status === "sealed").map(gs => gs.lessonId));
  return lessons.find(l => !completed.has(l.id)) ?? null;
}

// ── Helper: get instructor reservations ────────────────
export function getInstructorReservations(instructorId: string) {
  return reservations.filter(r => r.instructorId === instructorId && r.status !== "cancelled");
}

// ── Activity type display helpers ──────────────────────
export const activityTypeColors: Record<string, string> = {
  flight: "#3b82f6",
  simulator: "#8b5cf6",
  oral: "#f59e0b",
  academic: "#10b981",
  misc: "#6b7280",
};

export const activityTypeLabels: Record<string, string> = {
  flight: "Flight",
  simulator: "Simulator",
  oral: "Oral",
  academic: "Academic",
  misc: "Misc",
};

export const reservationStatusLabels: Record<string, string> = {
  requested: "Pending",
  approved: "Confirmed",
  dispatched: "Dispatched",
  flown: "Flown",
  pending_sign_off: "Awaiting Sign-Off",
  closed: "Closed",
  cancelled: "Cancelled",
  no_show: "No Show",
  scrubbed: "Scrubbed",
};

// ── Dispatched Reservations (currently flying) ────────
export const dispatchedReservationN172SP = resId();
export const dispatchedReservationN28PA = resId();

// Add dispatched reservations for flying aircraft
reservations.push(
  { id: dispatchedReservationN172SP, schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(now, -1)), endTime: iso(addHours(now, 1)), status: "dispatched", aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorMike, studentId: IDS.studentAlex, roomId: null, notes: "Practice area - ground reference maneuvers", lessonId: null },
  { id: dispatchedReservationN28PA, schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(now, -1)), endTime: iso(addHours(now, 1.5)), status: "dispatched", aircraftId: IDS.aircraftN28PA, instructorId: IDS.instructorSarah, studentId: IDS.studentOlivia, roomId: null, notes: "Stall series and slow flight", lessonId: null },
);

// ── Geofences ─────────────────────────────────────────
export const geofences: Geofence[] = [
  {
    id: "gf-01",
    schoolId: IDS.school,
    baseId: IDS.base,
    kind: "circle",
    label: "Training Area",
    radiusNm: 50,
    geometry: null,
    centerLat: base.latitude,
    centerLng: base.longitude,
  },
  {
    id: "gf-02",
    schoolId: IDS.school,
    baseId: IDS.base,
    kind: "polygon",
    label: "R-2907 Restricted (Ft Novosel)",
    radiusNm: null,
    geometry: [
      [31.38, -85.72],
      [31.38, -85.58],
      [31.28, -85.58],
      [31.28, -85.72],
    ],
    centerLat: 31.33,
    centerLng: -85.65,
  },
];

// ── Passenger Manifests ───────────────────────────────
export const passengerManifests: PassengerManifest[] = [
  // N172SP - Mike (PIC) + Alex (student)
  { id: "pm-01", reservationId: dispatchedReservationN172SP, position: "pic", name: "Mike Reynolds", weightLbs: 185, notes: "CFI" },
  { id: "pm-02", reservationId: dispatchedReservationN172SP, position: "sic", name: "Alex Martinez", weightLbs: 165, notes: "Student PIC" },
  { id: "pm-03", reservationId: dispatchedReservationN172SP, position: "pax_1", name: "Dan Garcia", weightLbs: 195, notes: "Observer ride-along" },
  // N28PA - Sarah (PIC) + Olivia (student)
  { id: "pm-04", reservationId: dispatchedReservationN28PA, position: "pic", name: "Sarah Chen", weightLbs: 140, notes: "CFI" },
  { id: "pm-05", reservationId: dispatchedReservationN28PA, position: "sic", name: "Olivia Brown", weightLbs: 130, notes: "Student" },
];

// ── Schedule Blocks ───────────────────────────────────

export const scheduleBlocks: ScheduleBlock[] = [
  { id: "sblock-01", schoolId: IDS.school, kind: "aircraft", instructorId: null, aircraftId: IDS.aircraftN172SP, roomId: null, validFrom: "2024-01-01", validUntil: null, notes: "N172SP available Mon-Fri 7am-7pm" },
  { id: "sblock-02", schoolId: IDS.school, kind: "aircraft", instructorId: null, aircraftId: IDS.aircraftN152AB, roomId: null, validFrom: "2024-01-01", validUntil: null, notes: "N152AB available Mon-Sat 6am-8pm" },
  { id: "sblock-03", schoolId: IDS.school, kind: "aircraft", instructorId: null, aircraftId: IDS.aircraftN28PA, roomId: null, validFrom: "2024-01-01", validUntil: null, notes: "N28PA available Mon-Fri 7am-6pm" },
  { id: "sblock-04", schoolId: IDS.school, kind: "room", instructorId: null, aircraftId: null, roomId: IDS.roomBriefingA, validFrom: "2024-01-01", validUntil: null, notes: "Briefing Room A available Mon-Sat 6am-9pm" },
  { id: "sblock-05", schoolId: IDS.school, kind: "room", instructorId: null, aircraftId: null, roomId: IDS.roomClassroomB, validFrom: "2024-01-01", validUntil: null, notes: "Classroom B available Mon-Fri 8am-5pm" },
];

const blockWeekStart = startOfWeek(now, { weekStartsOn: 1 });

export const scheduleBlockInstances: ScheduleBlockInstance[] = [
  // N172SP: Mon-Fri 7am-7pm
  { id: "sbinst-01", blockId: "sblock-01", startTime: iso(addHours(addDays(blockWeekStart, 0), 7)), endTime: iso(addHours(addDays(blockWeekStart, 0), 19)) },
  { id: "sbinst-02", blockId: "sblock-01", startTime: iso(addHours(addDays(blockWeekStart, 1), 7)), endTime: iso(addHours(addDays(blockWeekStart, 1), 19)) },
  // N152AB: Mon-Sat 6am-8pm
  { id: "sbinst-03", blockId: "sblock-02", startTime: iso(addHours(addDays(blockWeekStart, 0), 6)), endTime: iso(addHours(addDays(blockWeekStart, 0), 20)) },
  { id: "sbinst-04", blockId: "sblock-02", startTime: iso(addHours(addDays(blockWeekStart, 1), 6)), endTime: iso(addHours(addDays(blockWeekStart, 1), 20)) },
  // N28PA: Mon-Fri 7am-6pm
  { id: "sbinst-05", blockId: "sblock-03", startTime: iso(addHours(addDays(blockWeekStart, 0), 7)), endTime: iso(addHours(addDays(blockWeekStart, 0), 18)) },
  // Briefing Room A: Mon-Sat 6am-9pm
  { id: "sbinst-06", blockId: "sblock-04", startTime: iso(addHours(addDays(blockWeekStart, 0), 6)), endTime: iso(addHours(addDays(blockWeekStart, 0), 21)) },
  { id: "sbinst-07", blockId: "sblock-04", startTime: iso(addHours(addDays(blockWeekStart, 1), 6)), endTime: iso(addHours(addDays(blockWeekStart, 1), 21)) },
  // Classroom B: Mon-Fri 8am-5pm
  { id: "sbinst-08", blockId: "sblock-05", startTime: iso(addHours(addDays(blockWeekStart, 0), 8)), endTime: iso(addHours(addDays(blockWeekStart, 0), 17)) },
];

// ── Aircraft Engines ──────────────────────────────────

export const aircraftEngines: AircraftEngine[] = [
  { id: "eng-01", aircraftId: IDS.aircraftN172SP, position: "single", serialNumber: "L-28456-51A", manufacturer: "Lycoming", model: "IO-360-L2A" },
  { id: "eng-02", aircraftId: IDS.aircraftN152AB, position: "single", serialNumber: "L-15789-40A", manufacturer: "Lycoming", model: "O-235-L2C" },
  { id: "eng-03", aircraftId: IDS.aircraftN28PA, position: "single", serialNumber: "L-32100-51A", manufacturer: "Lycoming", model: "O-360-A4M" },
  { id: "eng-04", aircraftId: IDS.aircraftN182RG, position: "single", serialNumber: "L-44521-52A", manufacturer: "Lycoming", model: "O-540-J3C5D" },
  { id: "eng-05l", aircraftId: IDS.aircraftN44ME, position: "left", serialNumber: "L-51200-61A", manufacturer: "Lycoming", model: "O-360-A1H6" },
  { id: "eng-05r", aircraftId: IDS.aircraftN44ME, position: "right", serialNumber: "L-51201-61A", manufacturer: "Lycoming", model: "O-360-A1H6" },
];

// ── Aircraft Equipment ────────────────────────────────

export const aircraftEquipment: AircraftEquipment[] = [
  { id: "equip-01", aircraftId: IDS.aircraftN172SP, tag: "g1000" },
  { id: "equip-02", aircraftId: IDS.aircraftN172SP, tag: "ifr_certified" },
  { id: "equip-03", aircraftId: IDS.aircraftN172SP, tag: "autopilot" },
  { id: "equip-04", aircraftId: IDS.aircraftN152AB, tag: "steam_gauges" },
  { id: "equip-05", aircraftId: IDS.aircraftN152AB, tag: "vfr_only" },
  { id: "equip-06", aircraftId: IDS.aircraftN28PA, tag: "gtn_650" },
  { id: "equip-07", aircraftId: IDS.aircraftN28PA, tag: "ifr_certified" },
  { id: "equip-08", aircraftId: IDS.aircraftN28PA, tag: "autopilot" },
  { id: "equip-09", aircraftId: IDS.aircraftN44ME, tag: "g500_txi" },
  { id: "equip-10", aircraftId: IDS.aircraftN44ME, tag: "ifr_certified" },
  { id: "equip-11", aircraftId: IDS.aircraftN44ME, tag: "multi_engine" },
];

