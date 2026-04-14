# UI ↔ Database Connection Map

> **Living document** — Auto-updated as UI pages and DB schema evolve.  
> Last scanned: 2026-04-14  
> UI Prototype: `Part-61-UI-Prototype/`  
> Database Schema: `Part-61-School/packages/db/src/schema/`

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | UI field has a matching DB column — ready to wire |
| ⚠️ | UI field exists but uses hardcoded/mock data — DB column exists, connection pending |
| 🔴 | **UI field with NO matching DB column** — needs DB work or design decision |
| 🟡 | **DB column with NO UI representation** — not yet surfaced in the prototype |
| 🔁 | Computed/derived field — requires query logic, not a direct column |

---

## 1. Landing Page (`app/page.tsx`)

### Login Form
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Email input | `users.email` | ✅ |
| Password input | Supabase `auth.users` | ✅ (Supabase Auth) |
| Role-based routing | `user_roles.role` | ✅ |

### School Branding
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| School name ("Alpha Flight Academy") | `schools.name` | ⚠️ Hardcoded |
| School logo | — | 🔴 No `logo_url` column on `schools` |
| "5 Aircraft in Fleet" | `COUNT(aircraft)` | 🔁 Derived |
| "3 Certified Instructors" | `COUNT(user_roles WHERE role='instructor')` | 🔁 Derived |
| "Austin, TX (KAUS)" | `bases.name`, `bases.latitude/longitude` | ⚠️ Hardcoded |

### Prospective Students Section
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Programs list (PPL, IR, etc.) | `course.title`, `course.rating_sought` | ⚠️ Hardcoded, could pull from `course` |
| "How to Apply" steps | — | 🔴 No CMS/content table — static content |
| Contact form (name, email, message) | — | 🔴 No `contact_inquiry` or `lead` table |

### DB Columns NOT in UI (schools/bases)
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `schools.timezone` | schools | Not displayed anywhere |
| 🟡 `bases.timezone` | bases | Not displayed (falls back to school) |

---

## 2. Instructor Dashboard Shell (`app/instructor/layout.tsx`)

### Top Bar
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| User full name | `users.full_name` | ✅ |
| User email | `users.email` | ✅ |
| User initials (avatar) | `person_profile.first_name`, `last_name` | ✅ |
| Profile avatar image | — | 🔴 No `avatar_url` column on `users` or `person_profile` |

### Profile Dropdown Menu
| UI Element | DB Operation | Status |
|------------|-------------|--------|
| Update Profile | UPDATE `person_profile` | ⚠️ UI exists, no form wired |
| Customize Home Page | — | 🔴 No `user_preferences` table |
| Create Blockout Times | INSERT `person_unavailability` | ⚠️ Dialog exists, not wired |
| Pull Training Report | READ `lesson_grade_sheet` + `flight_log_time` | ⚠️ Not implemented |
| Change Password | Supabase Auth `updateUser` | ⚠️ Not implemented |
| Logout | Supabase Auth `signOut` | ⚠️ Mock only |

---

## 3. Schedule Tab (`app/instructor/schedule/`)

### Calendar Events
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Event start time | `reservation.time_range` (lower bound) | ✅ |
| Event end time | `reservation.time_range` (upper bound) | ✅ |
| Activity type | `reservation.activity_type` | ✅ |
| Activity color | Derived from `activity_type` | 🔁 App logic |
| Student name | `users.full_name` via `reservation.student_id` | ✅ |
| Event status | `reservation.status` | ✅ |

### Event Detail Sheet
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Status badge | `reservation.status` | ✅ |
| Activity type badge | `reservation.activity_type` | ✅ |
| Date & time | `reservation.time_range` | ✅ |
| Student name | `users.full_name` via `reservation.student_id` | ✅ |
| Aircraft tail + make/model | `aircraft.tail_number`, `.make`, `.model` via `reservation.aircraft_id` | ✅ |
| Room name | `room.name` via `reservation.room_id` | ✅ |
| Lesson code & title | `lesson.code`, `.title` via `reservation.lesson_id` | ✅ |
| Notes | `reservation.notes` | ✅ |

### Add Training Dialog
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Date picker | → `reservation.time_range` | ✅ |
| Time of Day filter | — | 🔴 No DB column — UI-only filter concept. Maps to time_range hour ranges. |
| Student selector | `users` WHERE role='student' + `student_course_enrollment.primary_instructor_id` | ✅ |
| Student progress % | 🔁 Derived from `lesson_grade_sheet` count | 🔁 |
| Next training (auto-populated) | `lesson.code`, `.title`, `.kind`, `.min_hours`, `.objectives` via enrollment | ✅ |
| Duration input | `lesson.min_hours` (editable) → stored where? | ⚠️ Maps to `reservation.time_range` duration |
| Aircraft selector | `aircraft` WHERE `grounded_at IS NULL` | ✅ |
| Room selector | `room.name`, `.capacity` | ✅ |
| Resource availability | Requires EXCLUDE constraint check on `reservation.time_range` | 🔁 |

### New Student Onboarding (within Add Training)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| First name | `person_profile.first_name` | ✅ |
| Last name | `person_profile.last_name` | ✅ |
| Email | `users.email` | ✅ |
| Phone | `person_profile.phone` | ✅ |
| Prior flight hours | `instructor_experience` table? or new field? | ⚠️ `instructor_experience` exists but is for instructors. No `student_experience` table. |
| Medical class | — | 🔴 No dedicated medical class column. `documents.kind='medical'` stores file only, not class type. UI needs: medical class enum + expiry date fields. |
| Medical expiry | `instructor_currency.expires_at` WHERE kind='medical' | ⚠️ Currency table exists but for instructors. Students need similar tracking. |
| Training program selector | `course.id` → `course_version.id` → `student_course_enrollment.course_version_id` | ✅ |
| Email invitation trigger | — | 🔴 No email/notification system table. Would need Supabase Edge Function or external service. |

### Blockout Time Dialog
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Start/End date | `person_unavailability.time_range` | ✅ |
| Start/End time | `person_unavailability.time_range` | ✅ |
| Reason | `person_unavailability.kind` | ✅ |
| Notes | `person_unavailability.reason` | ✅ |

### Set Availability
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Weekly time slot grid | — | 🔴 No `instructor_availability` or recurring availability table. `schedule_block` + `schedule_block_instance` could serve this, but no direct weekly template model. |

---

## 4. Students Tab (`app/instructor/students/`)

### Student List Table
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Student name (link) | `users.full_name` | ✅ |
| Student email | `users.email` | ✅ |
| Status badge (Active/Idle) | 🔁 Derived: `NOW() - MAX(lesson_grade_sheet.conducted_at) > 30 days` | 🔁 |
| Program name | `course.title` via enrollment → course_version → course | ✅ |
| Last activity date | `MAX(lesson_grade_sheet.conducted_at)` per enrollment | 🔁 |
| Days since activity | 🔁 Computed from last activity | 🔁 |
| Progress bar + % | 🔁 `COUNT(sealed grade_sheets) / COUNT(lessons in course_version)` | 🔁 |

### Filters
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Status filter | 🔁 Derived from activity recency | 🔁 |
| Instructor filter | `student_course_enrollment.primary_instructor_id` | ✅ |
| Syllabus filter | — | ⚠️ Not yet implemented. Would filter by `student_course_enrollment.course_version_id` → `course.title` |

---

## 5. Student Detail (`app/instructor/students/[id]/`)

### Demographics Tab
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Full name | `person_profile.first_name`, `.last_name` | ✅ |
| Date of birth | `person_profile.date_of_birth` | ✅ |
| Phone | `person_profile.phone` | ✅ |
| Email | `users.email` | ✅ |
| Address | `person_profile.address_line1`, `.city`, `.state`, `.postal_code` | ✅ |
| FAA Cert # | `person_profile.faa_airman_cert_number` | ✅ |
| Emergency contact name | `emergency_contact.name` | ✅ |
| Emergency contact relationship | `emergency_contact.relationship` | ✅ |
| Emergency contact phone | `emergency_contact.phone` | ✅ |
| Emergency contact email | `emergency_contact.email` | ✅ |
| Medical class | — | 🔴 See note above — no medical class column |
| Medical expiry | — | 🔴 See note above |
| Enrolled date | `student_course_enrollment.enrolled_at` | ✅ |
| Program | `course.title` via enrollment chain | ✅ |
| Primary instructor | `users.full_name` via `enrollment.primary_instructor_id` | ✅ |

### Progress Tab
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Overall progress bar | 🔁 Derived from grade_sheet counts | 🔁 |
| Next lesson card | 🔁 First lesson without sealed grade_sheet | 🔁 |
| Stage accordion headers | `stage.code`, `.title` | ✅ |
| Stage completion counts | 🔁 `COUNT(sealed grade_sheets for stage lessons)` | 🔁 |
| Lesson list (code, title) | `lesson.code`, `.title` | ✅ |
| Lesson kind badge | `lesson.kind` | ✅ |
| Lesson completion dot | 🔁 `lesson_grade_sheet.status = 'sealed'` | 🔁 |
| Completion date | `lesson_grade_sheet.conducted_at` | ✅ |

### Schedule Tab
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Session lesson ref | `lesson.code`, `.title` via `reservation.lesson_id` | ✅ |
| Session date/time | `reservation.time_range` | ✅ |
| Activity type badge | `reservation.activity_type` | ✅ |
| Past/future styling | 🔁 Derived from `time_range` vs `NOW()` | 🔁 |

### Action Buttons
| UI Element | DB Operation | Status |
|------------|-------------|--------|
| Schedule Training | INSERT `reservation` | ⚠️ Dialog exists, not wired |
| Change Instructor | UPDATE `student_course_enrollment.primary_instructor_id` | ⚠️ Button only, no form |
| Change Syllabus | UPDATE `student_course_enrollment.course_version_id` | ⚠️ Button only, no form |
| Remove Student | Soft-delete or `withdrawn_at` on enrollment? | ⚠️ Button only, no confirm flow |

### DB Columns NOT in Student Detail UI
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `person_profile.address_line2` | person_profile | Not displayed |
| 🟡 `person_profile.country` | person_profile | Not displayed |
| 🟡 `person_profile.email_alt` | person_profile | Not displayed |
| 🟡 `person_profile.citizenship_status` | person_profile | Not displayed |
| 🟡 `person_profile.tsa_afsp_status` | person_profile | Not displayed — important for foreign nationals |
| 🟡 `emergency_contact.is_primary` | emergency_contact | Not indicated in UI |
| 🟡 `info_release_authorization.*` | info_release_authorization | Entire table not represented |
| 🟡 `student_endorsement.*` | student_endorsement | Entire table not represented |
| 🟡 `student_course_enrollment.notes` | enrollment | Not displayed |
| 🟡 `student_course_enrollment.plan_cadence_hours_per_week` | enrollment | Not displayed |
| 🟡 `student_course_enrollment.completed_at` | enrollment | Status not shown |
| 🟡 `student_course_enrollment.withdrawn_at` | enrollment | Status not shown |
| 🟡 `student_progress_forecast_cache.*` | forecast | Entire cache table not represented |
| 🟡 `lesson_override.*` | lesson_override | Not surfaced |
| 🟡 `training_record_audit_exception.*` | audit_exception | Not surfaced |
| 🟡 `test_grade.*` | test_grade | Not surfaced |
| 🟡 `stage_check.*` | stage_check | Not surfaced |
| 🟡 `flight_log_time.*` | flight_log_time | Not surfaced in student view |
| 🟡 `line_item_grade.*` | line_item_grade | Grade detail not shown per line item |
| 🟡 `no_show.*` | no_show | Not tracked in UI |
| 🟡 `person_hold.*` | person_hold | Not displayed — holds/groundings for students |
| 🟡 `documents.*` | documents | Student documents not displayed |

---

## 6. School Schedule (`app/instructor/school-schedule/`)

### Resource Grid
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Room name + capacity | `room.name`, `.capacity` | ✅ |
| Room features | `room.features` (in detail sheet) | ✅ |
| Aircraft tail + model | `aircraft.tail_number`, `.make`, `.model` | ✅ |
| Aircraft year | `aircraft.year` (in detail sheet) | ✅ |
| Aircraft equipment notes | `aircraft.equipment_notes` (in detail sheet) | ✅ |
| Aircraft grounded status | `aircraft.grounded_at` | ✅ |
| Time block events | `reservation` filtered by `aircraft_id` or `room_id` | ✅ |
| Event student name | `users.full_name` via `reservation.student_id` | ✅ |
| Event color | Derived from `reservation.activity_type` | 🔁 |

### DB Columns NOT in School Schedule UI
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `room.features` | room | Only shown in detail sheet, not grid |
| 🟡 `schedule_block.*` | schedule_block | Recurring blocks not visualized |
| 🟡 `schedule_block_instance.*` | schedule_block_instance | Not shown |
| 🟡 `aircraft_engine.*` | aircraft_engine | Engine details not shown |
| 🟡 `aircraft_equipment.*` | aircraft_equipment | Equipment tags not shown on grid |

---

## 7. Live Map (`app/instructor/live-map/`)

### Map Display
| UI Element | DB Table.Column / Data Source | Status |
|------------|-------------------------------|--------|
| Base marker position | `bases.latitude`, `.longitude` | ✅ |
| Base name | `bases.name` | ✅ |
| Geofence radius | `geofence.radius_nm`, `.geometry` | ⚠️ Hardcoded 50NM circle. DB has `geofence` table. |
| School aircraft positions | External ADS-B API | 🔴 Not a DB table — real-time external feed |
| Traffic positions | External ADS-B API | 🔴 External feed |
| METAR data | External aviation weather API | 🔴 Not in DB |
| Weather warnings | External API (AWC) | 🔴 Not in DB |

### Flying Aircraft Bottom Bar
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Tail number | `aircraft.tail_number` matched via ADS-B | ✅ (match) |
| Student on flight | `users.full_name` via `reservation` WHERE status='dispatched' | ✅ |
| "On Schedule" badge | `reservation.status = 'dispatched'` match | ✅ |

### DB Columns NOT in Live Map UI
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `geofence.kind` | geofence | UI hardcodes circle, DB supports polygon |
| 🟡 `geofence.label` | geofence | Not displayed |
| 🟡 `fif_notice.*` | fif_notice | FIF notices not shown on map |
| 🟡 `fif_acknowledgement.*` | fif_acknowledgement | Not tracked |
| 🟡 `passenger_manifest.*` | passenger_manifest | Not shown for flying aircraft |

---

## 8. Maintenance (`app/instructor/maintenance/`)

### Fleet Status Cards
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Tail number | `aircraft.tail_number` | ✅ |
| Make/model | `aircraft.make`, `.model` | ✅ |
| Airworthy/Grounded badge | `aircraft.grounded_at IS NULL` | ✅ |
| Current Hobbs | `aircraft_current_totals.current_hobbs` (view) | ✅ |
| Due Soon count | `COUNT(maintenance_item WHERE status='due_soon')` | 🔁 |
| Overdue count | `COUNT(maintenance_item WHERE status IN ('overdue','grounding'))` | 🔁 |

### Due Items Table
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Aircraft tail | `aircraft.tail_number` via `maintenance_item.aircraft_id` | ✅ |
| Item title | `maintenance_item.title` | ✅ |
| Kind badge | `maintenance_item.kind` | ✅ |
| Status badge | `maintenance_item.status` | ✅ |
| Next due date | `maintenance_item.next_due_at` | ✅ |
| Next due hours | `maintenance_item.next_due_hours` | ✅ |

### Squawk Table & Detail
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Aircraft tail | `aircraft.tail_number` | ✅ |
| Severity badge | `aircraft_squawk.severity` | ✅ |
| Title | `aircraft_squawk.title` | ✅ |
| Status badge | `aircraft_squawk.status` | ✅ |
| Opened date | `aircraft_squawk.opened_at` | ✅ |
| Description | `aircraft_squawk.description` | ✅ |
| Reported by | `users.full_name` via `aircraft_squawk.opened_by` | ✅ |

### Work Order Table
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Aircraft tail | `aircraft.tail_number` | ✅ |
| Title | `work_order.title` | ✅ |
| Kind badge | `work_order.kind` | ✅ |
| Status badge | `work_order.status` | ✅ |
| Assigned to | `users.full_name` via `work_order.assigned_to_user_id` | ✅ |
| Created date | `work_order.created_at` | ✅ |

### DB Columns NOT in Maintenance UI
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `maintenance_item.description` | maintenance_item | Not in table (only title) |
| 🟡 `maintenance_item.interval_rule` | maintenance_item | JSONB rule not displayed |
| 🟡 `maintenance_item.last_completed_at` | maintenance_item | Not shown |
| 🟡 `maintenance_item.last_completed_hours` | maintenance_item | Not shown |
| 🟡 `maintenance_item.engine_id` | maintenance_item | Engine association not shown |
| 🟡 `aircraft_squawk.triaged_at/by` | aircraft_squawk | Triage info not shown |
| 🟡 `aircraft_squawk.deferred_until` | aircraft_squawk | Deferral date not shown |
| 🟡 `aircraft_squawk.deferral_justification` | aircraft_squawk | Not shown |
| 🟡 `aircraft_squawk.work_order_id` | aircraft_squawk | Link to WO not shown |
| 🟡 `aircraft_squawk.returned_to_service_at` | aircraft_squawk | RTS info not shown |
| 🟡 `work_order.description` | work_order | Not in table |
| 🟡 `work_order.source_squawk_id` | work_order | Link to source squawk not shown |
| 🟡 `work_order.source_maintenance_item_id` | work_order | Link to source MX item not shown |
| 🟡 `work_order.started_at` | work_order | Timeline not shown |
| 🟡 `work_order.completed_at` | work_order | Timeline not shown |
| 🟡 `work_order.signed_off_at/by` | work_order | Sign-off not shown |
| 🟡 `work_order_task.*` | work_order_task | Task breakdown not shown |
| 🟡 `work_order_part_consumption.*` | work_order_part_consumption | Parts used not shown |
| 🟡 `aircraft_component.*` | aircraft_component | Components not shown |
| 🟡 `aircraft_component_overhaul.*` | aircraft_component_overhaul | Overhaul history not shown |
| 🟡 `airworthiness_directive.*` | airworthiness_directive | AD tracking not shown |
| 🟡 `aircraft_ad_compliance.*` | aircraft_ad_compliance | AD compliance not shown |
| 🟡 `ad_compliance_history.*` | ad_compliance_history | Not shown |
| 🟡 `logbook_entry.*` | logbook_entry | Aircraft logbook not shown |
| 🟡 `maintenance_overrun.*` | maintenance_overrun | Overruns not shown |
| 🟡 `aircraft_downtime_forecast.*` | aircraft_downtime_forecast | Forecast not shown |
| 🟡 `part.*` | part | Parts inventory not shown |
| 🟡 `part_lot.*` | part_lot | Not shown |

---

## 9. Support (`app/instructor/support/`)

### Support Ticket Form
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Subject | — | 🔴 No `support_ticket` table |
| Category | — | 🔴 |
| Priority | — | 🔴 |
| Description | — | 🔴 |
| Submit action | — | 🔴 Would need a tickets table or external integration |

### Contact Info
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Phone, email, address | — | 🔴 Hardcoded. Could come from `schools` table if columns added. |
| Office hours | — | 🔴 No hours column on `schools` or `bases` |

---

## Summary: Gap Analysis

### 🔴 UI Elements with NO DB Column (needs schema work)
| # | UI Element | Page | Suggested DB Solution |
|---|-----------|------|----------------------|
| 1 | School logo | Landing | Add `logo_url` to `schools` table |
| 2 | Contact inquiries | Landing | Create `contact_inquiry` table |
| 3 | User avatar/profile picture | Dashboard | Add `avatar_url` to `users` or `person_profile` |
| 4 | User preferences (home customization) | Dashboard | Create `user_preference` table (JSONB) |
| 5 | Student prior flight hours | Add Training dialog | Create `student_flight_experience` table or repurpose `instructor_experience` for all roles |
| 6 | Medical class & expiry (for students) | Student detail | Add medical tracking columns or use `documents` + `instructor_currency` pattern for students |
| 7 | Email invitation trigger | New Student flow | External service (Supabase Edge Functions, Resend, etc.) |
| 8 | Time-of-day filter concept | Add Training | App-level logic only — no DB change needed |
| 9 | Instructor weekly availability template | Set Availability | Create `instructor_availability_template` or use `schedule_block` with recurrence |
| 10 | Support tickets | Support | Create `support_ticket` table or use external service |
| 11 | School contact info (phone, hours) | Support | Add columns to `schools` or `bases` |

### 🟡 DB Tables with NO UI Representation (not yet surfaced)
| # | DB Table | Priority | Notes |
|---|---------|----------|-------|
| 1 | `student_endorsement` | High | Critical for checkride eligibility |
| 2 | `stage_check` | High | Stage check scheduling & results |
| 3 | `flight_log_time` | High | Student flight time tracking |
| 4 | `line_item_grade` | High | Detailed grading per line item |
| 5 | `test_grade` | High | Knowledge/oral test results |
| 6 | `person_hold` | High | Safety holds on students |
| 7 | `documents` | Medium | Uploaded documents (medical, license, etc.) |
| 8 | `info_release_authorization` | Medium | FERPA-like release tracking |
| 9 | `student_progress_forecast_cache` | Medium | Predicted completion dates |
| 10 | `lesson_override` | Medium | Prerequisite waivers |
| 11 | `training_record_audit_exception` | Medium | Compliance warnings |
| 12 | `no_show` | Medium | No-show tracking |
| 13 | `fif_notice` / `fif_acknowledgement` | Medium | Flight Information Folder |
| 14 | `passenger_manifest` | Low | Dispatch feature |
| 15 | `course_phase` / `unit` | Low | Syllabus depth (phases within stages) |
| 16 | `aircraft_component` | Low | Detailed component tracking |
| 17 | `airworthiness_directive` | Low | AD compliance tracking |
| 18 | `logbook_entry` | Low | Aircraft maintenance logbook |
| 19 | `work_order_task` | Low | WO task breakdown |
| 20 | `part` / `part_lot` | Low | Parts inventory |
| 21 | `audit_log` | Low | System audit trail |
| 22 | `flight_log_entry` / `flight_log_entry_engine` | Low | Hobbs/tach recording |

---

## Enum Alignment Check

| UI Enum Values | DB Enum Name | Match? |
|---------------|-------------|--------|
| flight, simulator, oral, academic, misc | `reservation_activity_type` | ✅ Exact match |
| requested, approved, dispatched, closed, cancelled... | `reservation_status` | ✅ Exact match |
| ground, flight, simulator, oral, written_test | `lesson_kind` | ✅ Exact match |
| current, due_soon, overdue, grounding | `maintenance_item_status` | ✅ Exact match |
| info, watch, grounding | `squawk_severity` | ✅ Exact match |
| open, triaged, deferred, in_work, fixed, returned_to_service, cancelled | `squawk_status` | ✅ Exact match |
| draft, open, in_progress, pending_signoff, closed, cancelled | `work_order_status` | ✅ Exact match |
| vacation, sick, personal, training, other | `unavailability_kind` | ✅ Exact match |
| student, instructor, mechanic, admin, rental_customer | `role` | ✅ Exact match |
| VFR, MVFR, IFR, LIFR | — | 🔴 UI-only (external weather data) |
| bug, layout, suggestion, question, general | — | 🔴 Feedback widget only (mailto) |

---

*This document is maintained by the UI-DB Connection Agent. Update triggers: any change to UI components, mock data types, or DB schema files.*
