import { IDS } from "./ids";
import type {
  School, Base, User, UserRole, PersonProfile, EmergencyContact,
  Aircraft, AircraftCurrentTotals, Room, Reservation, PersonUnavailability,
  Course, CourseVersion, Stage, Lesson, LineItem,
  StudentCourseEnrollment, LessonGradeSheet,
  MaintenanceItem, AircraftSquawk, WorkOrder, InstructorCurrency,
  AircraftPosition, MetarReport, WeatherWarning, Role,
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
  id: IDS.school, name: "Alpha Flight Academy", timezone: "America/Chicago", createdAt: "2024-01-15T00:00:00Z",
};

export const base: Base = {
  id: IDS.base, schoolId: IDS.school, name: "Austin Executive (KAUS)", timezone: null,
  latitude: 30.1945, longitude: -97.6699,
};

// ── Users ──────────────────────────────────────────────
export const users: User[] = [
  { id: IDS.instructorMike, schoolId: IDS.school, email: "instructor@alpha.test", fullName: "Mike Reynolds", timezone: null, status: "active" },
  { id: IDS.instructorSarah, schoolId: IDS.school, email: "sarah.chen@alpha.test", fullName: "Sarah Chen", timezone: null, status: "active" },
  { id: IDS.instructorJames, schoolId: IDS.school, email: "james.wright@alpha.test", fullName: "James Wright", timezone: null, status: "active" },
  { id: IDS.studentAlex, schoolId: IDS.school, email: "student@alpha.test", fullName: "Alex Martinez", timezone: null, status: "active" },
  { id: IDS.studentEmma, schoolId: IDS.school, email: "emma.johnson@alpha.test", fullName: "Emma Johnson", timezone: null, status: "active" },
  { id: IDS.studentLiam, schoolId: IDS.school, email: "liam.williams@alpha.test", fullName: "Liam Williams", timezone: null, status: "active" },
  { id: IDS.studentOlivia, schoolId: IDS.school, email: "olivia.brown@alpha.test", fullName: "Olivia Brown", timezone: null, status: "active" },
  { id: IDS.studentNoah, schoolId: IDS.school, email: "noah.davis@alpha.test", fullName: "Noah Davis", timezone: null, status: "active" },
  { id: IDS.studentAva, schoolId: IDS.school, email: "ava.wilson@alpha.test", fullName: "Ava Wilson", timezone: null, status: "inactive" },
  { id: IDS.mechanicDan, schoolId: IDS.school, email: "dan.garcia@alpha.test", fullName: "Dan Garcia", timezone: null, status: "active" },
  { id: IDS.adminLisa, schoolId: IDS.school, email: "admin@alpha.test", fullName: "Lisa Park", timezone: null, status: "active" },
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
  { userId: IDS.instructorMike, schoolId: IDS.school, firstName: "Mike", lastName: "Reynolds", dateOfBirth: "1985-03-12", addressLine1: "1234 Airport Blvd", addressLine2: null, city: "Austin", state: "TX", postalCode: "78719", country: "US", phone: "512-555-0101", emailAlt: null, faaAirmanCertNumber: "3456789" },
  { userId: IDS.instructorSarah, schoolId: IDS.school, firstName: "Sarah", lastName: "Chen", dateOfBirth: "1990-07-22", addressLine1: "5678 Runway Dr", addressLine2: "Apt 4B", city: "Austin", state: "TX", postalCode: "78723", country: "US", phone: "512-555-0102", emailAlt: null, faaAirmanCertNumber: "4567890" },
  { userId: IDS.instructorJames, schoolId: IDS.school, firstName: "James", lastName: "Wright", dateOfBirth: "1982-11-05", addressLine1: "910 Hangar Ln", addressLine2: null, city: "Round Rock", state: "TX", postalCode: "78664", country: "US", phone: "512-555-0103", emailAlt: null, faaAirmanCertNumber: "5678901" },
  { userId: IDS.studentAlex, schoolId: IDS.school, firstName: "Alex", lastName: "Martinez", dateOfBirth: "1998-05-18", addressLine1: "2345 Oak Hill Ave", addressLine2: null, city: "Austin", state: "TX", postalCode: "78749", country: "US", phone: "512-555-0201", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentEmma, schoolId: IDS.school, firstName: "Emma", lastName: "Johnson", dateOfBirth: "2001-01-30", addressLine1: "4567 Lake Austin Blvd", addressLine2: null, city: "Austin", state: "TX", postalCode: "78703", country: "US", phone: "512-555-0202", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentLiam, schoolId: IDS.school, firstName: "Liam", lastName: "Williams", dateOfBirth: "1995-09-08", addressLine1: "789 East Side Dr", addressLine2: null, city: "Pflugerville", state: "TX", postalCode: "78660", country: "US", phone: "512-555-0203", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentOlivia, schoolId: IDS.school, firstName: "Olivia", lastName: "Brown", dateOfBirth: "2000-12-14", addressLine1: "321 Congress Ave", addressLine2: "Unit 12", city: "Austin", state: "TX", postalCode: "78701", country: "US", phone: "512-555-0204", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentNoah, schoolId: IDS.school, firstName: "Noah", lastName: "Davis", dateOfBirth: "1997-06-25", addressLine1: "654 South First St", addressLine2: null, city: "Austin", state: "TX", postalCode: "78704", country: "US", phone: "512-555-0205", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.studentAva, schoolId: IDS.school, firstName: "Ava", lastName: "Wilson", dateOfBirth: "1999-04-02", addressLine1: "987 Research Blvd", addressLine2: null, city: "Austin", state: "TX", postalCode: "78759", country: "US", phone: "512-555-0206", emailAlt: null, faaAirmanCertNumber: null },
  { userId: IDS.mechanicDan, schoolId: IDS.school, firstName: "Dan", lastName: "Garcia", dateOfBirth: "1978-08-16", addressLine1: "111 Mechanic Way", addressLine2: null, city: "Austin", state: "TX", postalCode: "78719", country: "US", phone: "512-555-0301", emailAlt: null, faaAirmanCertNumber: "2345678" },
  { userId: IDS.adminLisa, schoolId: IDS.school, firstName: "Lisa", lastName: "Park", dateOfBirth: "1988-02-28", addressLine1: "222 Admin Plaza", addressLine2: null, city: "Austin", state: "TX", postalCode: "78702", country: "US", phone: "512-555-0401", emailAlt: null, faaAirmanCertNumber: null },
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
  { id: IDS.enrollAlex, schoolId: IDS.school, userId: IDS.studentAlex, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorMike, enrolledAt: "2025-09-15T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "Progressing well through Stage 2" },
  { id: IDS.enrollEmma, schoolId: IDS.school, userId: IDS.studentEmma, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorMike, enrolledAt: "2026-01-10T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "New student, started Stage 1" },
  { id: IDS.enrollLiam, schoolId: IDS.school, userId: IDS.studentLiam, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorSarah, enrolledAt: "2025-06-01T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "In Stage 3, preparing for checkride" },
  { id: IDS.enrollOlivia, schoolId: IDS.school, userId: IDS.studentOlivia, courseVersionId: IDS.courseVersionPPL, primaryInstructorId: IDS.instructorMike, enrolledAt: "2025-11-20T00:00:00Z", completedAt: null, withdrawnAt: null, notes: "Stage 1, landing practice" },
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
  { id: resId(), schoolId: IDS.school, baseId: IDS.base, activityType: "flight", startTime: iso(addHours(fri, 8)), endTime: iso(addHours(fri, 12)), status: "approved", aircraftId: IDS.aircraftN172SP, instructorId: IDS.instructorSarah, studentId: IDS.studentLiam, roomId: null, notes: "Solo XC KAUS-KGTU-KHYI-KAUS", lessonId: lIds.soloXC },
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
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, kind: "annual_inspection", title: "Annual Inspection", description: null, nextDueAt: iso(addDays(now, 45)), nextDueHours: null, status: "current" },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, kind: "oil_change", title: "Oil Change", description: "Full oil and filter change", nextDueAt: null, nextDueHours: 4875, status: "due_soon" },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, kind: "hundred_hour_inspection", title: "100-Hour Inspection", description: null, nextDueAt: null, nextDueHours: 4900, status: "current" },
  // N152AB
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN152AB, kind: "annual_inspection", title: "Annual Inspection", description: null, nextDueAt: iso(addDays(now, 12)), nextDueHours: null, status: "due_soon" },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN152AB, kind: "transponder_91_413", title: "Transponder Check (91.413)", description: "Biennial transponder/encoder test", nextDueAt: iso(addDays(now, 90)), nextDueHours: null, status: "current" },
  // N28PA
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN28PA, kind: "oil_change", title: "Oil Change", description: null, nextDueAt: null, nextDueHours: 6240, status: "due_soon" },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN28PA, kind: "hundred_hour_inspection", title: "100-Hour Inspection", description: null, nextDueAt: null, nextDueHours: 6250, status: "due_soon" },
  // N182RG - grounded
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN182RG, kind: "annual_inspection", title: "Annual Inspection", description: "Currently in annual", nextDueAt: iso(subDays(now, 5)), nextDueHours: null, status: "overdue" },
  // N44ME
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN44ME, kind: "annual_inspection", title: "Annual Inspection", description: null, nextDueAt: iso(addDays(now, 120)), nextDueHours: null, status: "current" },
  { id: mxId(), schoolId: IDS.school, aircraftId: IDS.aircraftN44ME, kind: "oil_change", title: "Oil Change (L)", description: "Left engine oil", nextDueAt: null, nextDueHours: 3180, status: "due_soon" },
];

export const squawks: AircraftSquawk[] = [
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN152AB, severity: "info", title: "Slight paint chip on left wing tip", description: "Cosmetic only, no structural concern", status: "deferred", openedAt: iso(subDays(now, 10)), openedByUserId: IDS.instructorSarah, resolvedAt: null },
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN182RG, severity: "grounding", title: "Nose gear indicator intermittent", description: "Gear indicator light flickers during retraction cycle. Needs relay inspection.", status: "in_work", openedAt: iso(subDays(now, 4)), openedByUserId: IDS.instructorJames, resolvedAt: null },
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN172SP, severity: "watch", title: "Alternator output low on hot days", description: "Voltage drops below 13.5V after extended ground ops on hot days. Monitor.", status: "triaged", openedAt: iso(subDays(now, 7)), openedByUserId: IDS.instructorMike, resolvedAt: null },
  { id: sqId(), schoolId: IDS.school, baseId: IDS.base, aircraftId: IDS.aircraftN28PA, severity: "info", title: "Seat track needs lubrication", description: "Pilot seat track slightly stiff", status: "open", openedAt: iso(subDays(now, 2)), openedByUserId: IDS.studentAlex, resolvedAt: null },
];

export const workOrders: WorkOrder[] = [
  { id: woId(), schoolId: IDS.school, aircraftId: IDS.aircraftN182RG, status: "in_progress", kind: "annual", title: "N182RG Annual Inspection", description: "Full annual inspection including gear system check", assignedToUserId: IDS.mechanicDan, createdAt: iso(subDays(now, 3)) },
  { id: woId(), schoolId: IDS.school, aircraftId: IDS.aircraftN182RG, status: "open", kind: "squawk_repair", title: "Nose Gear Indicator Repair", description: "Investigate and repair intermittent nose gear indicator", assignedToUserId: IDS.mechanicDan, createdAt: iso(subDays(now, 4)) },
  { id: woId(), schoolId: IDS.school, aircraftId: IDS.aircraftN172SP, status: "draft", kind: "oil_change", title: "N172SP Oil Change", description: "Scheduled oil and filter change at 4875 hrs", assignedToUserId: null, createdAt: iso(subDays(now, 1)) },
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
  { station: "KAUS", raw: "KAUS 131753Z 18010KT 10SM FEW045 SCT250 32/18 A2992 RMK AO2 SLP128", flightCategory: "VFR", temperature: 32, dewpoint: 18, windDirection: 180, windSpeed: 10, windGust: null, visibility: 10, altimeter: 29.92, clouds: "FEW045 SCT250" },
  { station: "KGTU", raw: "KGTU 131755Z AUTO 17008KT 10SM CLR 31/17 A2993", flightCategory: "VFR", temperature: 31, dewpoint: 17, windDirection: 170, windSpeed: 8, windGust: null, visibility: 10, altimeter: 29.93, clouds: "CLR" },
  { station: "KHYI", raw: "KHYI 131756Z AUTO 20012G18KT 7SM BKN025 OVC040 28/21 A2990", flightCategory: "MVFR", temperature: 28, dewpoint: 21, windDirection: 200, windSpeed: 12, windGust: 18, visibility: 7, altimeter: 29.90, clouds: "BKN025 OVC040" },
  { station: "KGRK", raw: "KGRK 131755Z 19015G22KT 4SM BR OVC015 25/22 A2988", flightCategory: "IFR", temperature: 25, dewpoint: 22, windDirection: 190, windSpeed: 15, windGust: 22, visibility: 4, altimeter: 29.88, clouds: "OVC015" },
  { station: "KBAZ", raw: "KBAZ 131754Z AUTO 21008KT 10SM SCT060 30/16 A2991", flightCategory: "VFR", temperature: 30, dewpoint: 16, windDirection: 210, windSpeed: 8, windGust: null, visibility: 10, altimeter: 29.91, clouds: "SCT060" },
];

// ── Aircraft Positions (ADS-B mock) ────────────────────
export const aircraftPositions: AircraftPosition[] = [
  // School aircraft - flying
  { icaoHex: "A12345", callsign: "N172SP", latitude: 30.35, longitude: -97.55, altitudeFt: 3500, groundSpeedKts: 105, headingDeg: 270, verticalRateFpm: 0, isSchoolAircraft: true, tailNumber: "N172SP", aircraftId: IDS.aircraftN172SP },
  { icaoHex: "A23456", callsign: "N28PA", latitude: 30.08, longitude: -97.80, altitudeFt: 4500, groundSpeedKts: 115, headingDeg: 180, verticalRateFpm: -200, isSchoolAircraft: true, tailNumber: "N28PA", aircraftId: IDS.aircraftN28PA },
  // School aircraft - on ground
  { icaoHex: "A34567", callsign: "N152AB", latitude: 30.1945, longitude: -97.6699, altitudeFt: 0, groundSpeedKts: 0, headingDeg: 0, verticalRateFpm: 0, isSchoolAircraft: true, tailNumber: "N152AB", aircraftId: IDS.aircraftN152AB },
  // Traffic
  { icaoHex: "B11111", callsign: "SWA1234", latitude: 30.30, longitude: -97.45, altitudeFt: 8000, groundSpeedKts: 250, headingDeg: 320, verticalRateFpm: -500, isSchoolAircraft: false },
  { icaoHex: "B22222", callsign: "UAL567", latitude: 30.50, longitude: -97.70, altitudeFt: 12000, groundSpeedKts: 300, headingDeg: 45, verticalRateFpm: 0, isSchoolAircraft: false },
  { icaoHex: "B33333", callsign: "N789XY", latitude: 30.05, longitude: -97.50, altitudeFt: 5500, groundSpeedKts: 130, headingDeg: 90, verticalRateFpm: 500, isSchoolAircraft: false },
  { icaoHex: "B44444", callsign: "AAL890", latitude: 30.40, longitude: -97.90, altitudeFt: 15000, groundSpeedKts: 350, headingDeg: 200, verticalRateFpm: -1000, isSchoolAircraft: false },
  { icaoHex: "B55555", callsign: "N456PP", latitude: 30.15, longitude: -97.40, altitudeFt: 2500, groundSpeedKts: 90, headingDeg: 150, verticalRateFpm: 0, isSchoolAircraft: false },
  { icaoHex: "B66666", callsign: "SKW321", latitude: 30.60, longitude: -97.60, altitudeFt: 10000, groundSpeedKts: 280, headingDeg: 260, verticalRateFpm: 0, isSchoolAircraft: false },
  { icaoHex: "B77777", callsign: "N901AB", latitude: 30.25, longitude: -98.00, altitudeFt: 6000, groundSpeedKts: 140, headingDeg: 30, verticalRateFpm: 200, isSchoolAircraft: false },
];

// ── Weather Warnings ───────────────────────────────────
export const weatherWarnings: WeatherWarning[] = [
  { id: "wx-01", type: "AIRMET", title: "AIRMET TANGO - Turbulence", description: "Moderate turbulence below 8000ft MSL due to low-level wind shear. Area from KAUS 30NM NW to 50NM NE.", severity: "moderate", expiresAt: iso(addHours(now, 4)) },
];

// ── Helper: Auth lookup ────────────────────────────────
export const mockCredentials: Record<string, { userId: string; role: Role }> = {
  "instructor@alpha.test": { userId: IDS.instructorMike, role: "instructor" },
  "student@alpha.test": { userId: IDS.studentAlex, role: "student" },
  "admin@alpha.test": { userId: IDS.adminLisa, role: "admin" },
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

