# UI ↔ Database Connection Map

> **Living document** — Auto-updated as UI pages and DB schema evolve.  
> Last scanned: 2026-04-15 (comprehensive scan — ~40 field-level updates from batch UI work across student detail, FIF banner, maintenance, live map, and school schedule)  
> UI Prototype: `Part-61-UI-Prototype/`  
> Database Schema: `Part-61-School/packages/db/src/schema/`  
> **Role scope:** INSTRUCTOR role only. Student, Maintenance, Admin, and Guest role views will be mapped separately.

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
| School/Base timezone | `schools.timezone`, `bases.timezone` (fallback) | ✅ |

### Prospective Students Section
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Programs list (PPL, IR, etc.) | `course.title`, `course.rating_sought` | ⚠️ Hardcoded, could pull from `course` |
| "How to Apply" steps | — | 🔴 No CMS/content table — static content |
| Contact form (name, email, message) | — | 🔴 No `contact_inquiry` or `lead` table |

---

## 2. Instructor Dashboard Shell (`app/instructor/layout.tsx`)

### Instructor Homepage (`app/instructor/home/page.tsx`)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| School/Base timezone (header, next to date) | `schools.timezone`, `bases.timezone` (fallback) | ✅ |

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
| HOLD badge | `person_hold` WHERE `user_id = ? AND cleared_at IS NULL` | ✅ |
| No-Show count badge | `COUNT(no_show WHERE user_id = ?)` | ✅ |

### Filters
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Status filter | 🔁 Derived from activity recency | 🔁 |
| Instructor filter | `student_course_enrollment.primary_instructor_id` | ✅ |
| Syllabus filter | — | ⚠️ Not yet implemented. Would filter by `student_course_enrollment.course_version_id` → `course.title` |

---

## 5. Student Detail (`app/instructor/students/[id]/`)

### Active Hold Alert Banner
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Hold alert banner | `person_hold` WHERE `user_id = ? AND cleared_at IS NULL` | ✅ |
| Hold kind badge | `person_hold.kind` | ✅ |
| Hold reason | `person_hold.reason` | ✅ |
| Hold date | `person_hold.created_at` | ✅ |

### Compliance Warning Banner
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Compliance warning alert | `training_record_audit_exception` WHERE `student_enrollment_id = ? AND resolved_at IS NULL` | ✅ |
| Exception severity badge | `training_record_audit_exception.severity` | ✅ |
| Exception kind label | `training_record_audit_exception.kind` | ✅ |
| First detected date | `training_record_audit_exception.first_detected_at` | ✅ |

### Header
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Student name | `users.full_name` | ✅ |
| Student email | `users.email` | ✅ |
| HOLD badge (next to name) | `person_hold` WHERE `cleared_at IS NULL` | ✅ |
| No-Show count badge (next to name) | `COUNT(no_show WHERE user_id = ?)` | ✅ |

### Demographics Tab
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Full name | `person_profile.first_name`, `.last_name` | ✅ |
| Date of birth | `person_profile.date_of_birth` | ✅ |
| Phone | `person_profile.phone` | ✅ |
| Email | `users.email` | ✅ |
| Alt. Email | `person_profile.email_alt` | ✅ |
| Address | `person_profile.address_line1`, `.address_line2`, `.city`, `.state`, `.postal_code` | ✅ |
| Country | `person_profile.country` | ✅ |
| FAA Cert # | `person_profile.faa_airman_cert_number` | ✅ |
| Emergency contact name | `emergency_contact.name` | ✅ |
| Emergency contact relationship | `emergency_contact.relationship` | ✅ |
| Emergency contact phone | `emergency_contact.phone` | ✅ |
| Emergency contact email | `emergency_contact.email` | ✅ |
| Emergency contact "Primary" badge | `emergency_contact.is_primary` | ✅ |
| Medical on File indicator | `documents` WHERE `kind='medical' AND user_id = ?` | ✅ |
| Medical expiry date | `documents.expires_at` WHERE `kind='medical'` | ✅ |
| Enrolled date | `student_course_enrollment.enrolled_at` | ✅ |
| Program | `course.title` via enrollment chain | ✅ |
| Primary instructor | `users.full_name` via `enrollment.primary_instructor_id` | ✅ |
| Target Pace | `student_course_enrollment.plan_cadence_hours_per_week` | ✅ |
| Enrollment completed status badge | `student_course_enrollment.completed_at` | ✅ |
| Enrollment withdrawn status badge | `student_course_enrollment.withdrawn_at` | ✅ |
| Enrollment notes | `student_course_enrollment.notes` | ✅ |

### Demographics Tab — Documents Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Document kind label | `documents.kind` | ✅ |
| Document expiry badge | `documents.expires_at` | ✅ |
| Expired/valid status | 🔁 Derived: `expires_at < NOW()` | 🔁 |
| Upload date | `documents.uploaded_at` | ✅ |

### Demographics Tab — Info Release Authorizations Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Authorized person name | `info_release_authorization.name` | ✅ |
| Relationship | `info_release_authorization.relationship` | ✅ |
| Notes | `info_release_authorization.notes` | ✅ |
| Granted date | `info_release_authorization.granted_at` | ✅ |
| Active filter | `info_release_authorization.revoked_at IS NULL` | ✅ |

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

### Progress Tab — Flight Time Summary Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Aircraft vs Simulator section split | `flight_log_time.is_simulator` | ✅ |
| Dual received total | `flight_log_time` WHERE `kind='dual_received'` → SUM(`day_minutes` + `night_minutes`) | ✅ |
| Solo total | `flight_log_time` WHERE `kind='solo'` → SUM(`day_minutes` + `night_minutes`) | ✅ |
| Cross-country total | `flight_log_time` → SUM(`cross_country_minutes`) | ✅ |
| Night total | `flight_log_time` → SUM(`night_minutes`) | ✅ |
| Instrument total | `flight_log_time` → SUM(`instrument_actual_minutes` + `instrument_simulated_minutes`) | ✅ |
| Instrument approaches count | `flight_log_time` → SUM(`instrument_approaches`) | ✅ |
| Landing count | `flight_log_time` → SUM(`day_landings` + `night_landings`) | ✅ |

### Progress Tab — Endorsements Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Endorsement category badge | `student_endorsement.category` | ✅ |
| Sealed badge | `student_endorsement.sealed` | ✅ |
| Expiry badge | `student_endorsement.expires_at` | ✅ |
| Expired status | 🔁 Derived: `expires_at < NOW()` | 🔁 |
| Rendered text | `student_endorsement.rendered_text` | ✅ |
| Issued date | `student_endorsement.issued_at` | ✅ |
| Issued by name | `users.full_name` via `student_endorsement.issued_by_user_id` | ✅ |
| Aircraft context | `student_endorsement.aircraft_context` | ✅ |
| Active filter | `student_endorsement.revoked_at IS NULL` | ✅ |

### Progress Tab — Test Results Table (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Test kind badge | `test_grade.test_kind` | ✅ |
| Score / max score | `test_grade.score`, `test_grade.max_score` | ✅ |
| Recorded date | `test_grade.recorded_at` | ✅ |
| Remarks | `test_grade.remarks` | ✅ |
| Recorded By column | `users.full_name` via `test_grade.recorded_by_user_id` | ✅ |

### Progress Tab — Stage Checks Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Stage name | `stage.title` via `stage_check.stage_id` | ✅ |
| Checker name | `users.full_name` via `stage_check.checker_user_id` | ✅ |
| Conducted date | `stage_check.conducted_at` | ✅ |
| Scheduled date | `stage_check.scheduled_at` | ✅ |
| Status badge (passed/failed/scheduled) | `stage_check.status` | ✅ |
| Status dot color | 🔁 Derived from `stage_check.status` | 🔁 |
| Remarks | `stage_check.remarks` | ✅ |
| Stage check badge on accordion header | `stage_check.status` matched by `stage_id` | ✅ |

### Progress Tab — Active Overrides Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Override kind badge | `lesson_override.kind` | ✅ |
| Lesson code + title | `lesson.code`, `.title` via `lesson_override.lesson_id` | ✅ |
| Justification | `lesson_override.justification` | ✅ |
| Granted date | `lesson_override.granted_at` | ✅ |
| Granted by name | `users.full_name` via `lesson_override.granted_by_user_id` | ✅ |
| Expiry date | `lesson_override.expires_at` | ✅ |
| Consumed status | `lesson_override.consumed_at` (null = unused) | ✅ |
| Active filter | `lesson_override.revoked_at IS NULL` | ✅ |

### Progress Tab — Line Item Grades (nested under lessons in accordion) (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Line item title | `line_item.title` via `line_item_grade.line_item_id` | ✅ |
| Grade value badge | `line_item_grade.grade_value` | ✅ |
| Grade remarks | `line_item_grade.grade_remarks` | ✅ |
| Grade sheet association | `line_item_grade.grade_sheet_id` | ✅ |

### Progress Tab — Forecast Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Confidence badge | `student_progress_forecast_cache.confidence` | ✅ |
| Actual hours to date | `student_progress_forecast_cache.actual_hours_to_date` | ✅ |
| Expected hours to date | `student_progress_forecast_cache.expected_hours_to_date` | ✅ |
| Ahead/behind hours | `student_progress_forecast_cache.ahead_behind_hours` | ✅ |
| Ahead/behind weeks | `student_progress_forecast_cache.ahead_behind_weeks` | ✅ |
| Remaining hours | `student_progress_forecast_cache.remaining_hours` | ✅ |
| Projected checkride date | `student_progress_forecast_cache.projected_checkride_date` | ✅ |
| Projected completion date | `student_progress_forecast_cache.projected_completion_date` | ✅ |

### Schedule Tab
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Session lesson ref | `lesson.code`, `.title` via `reservation.lesson_id` | ✅ |
| Session date/time | `reservation.time_range` | ✅ |
| Activity type badge | `reservation.activity_type` | ✅ |
| Past/future styling | 🔁 Derived from `time_range` vs `NOW()` | 🔁 |

### Schedule Tab — No-Show History Card (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| No-show date | `no_show.scheduled_at` | ✅ |
| No-show reason | `no_show.reason` | ✅ |
| No-show aircraft tail | `aircraft.tail_number` via `no_show.aircraft_id` | ✅ |
| No-show instructor name | `users.full_name` via `no_show.instructor_id` | ✅ |
| No-show count | 🔁 `COUNT(no_show WHERE user_id = ?)` | 🔁 |

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
| 🟡 `person_profile.citizenship_status` | person_profile | Not displayed |
| 🟡 `person_profile.tsa_afsp_status` | person_profile | Not displayed — important for foreign nationals |
| 🟡 `student_endorsement.template_id` | student_endorsement | Not displayed |
| 🟡 `stage_check.sealed` | stage_check | Not displayed |
| 🟡 `flight_log_time.reservation_id` | flight_log_time | Link to reservation not shown |
| 🟡 `test_grade.component_kind` | test_grade | Not displayed |
| 🟡 `test_grade.component_id` | test_grade | Not displayed |
| 🟡 `test_grade.sealed` | test_grade | Not displayed |
| 🟡 `person_hold.created_by_user_id` | person_hold | Creator not shown |
| 🟡 `person_hold.cleared_at/by/reason` | person_hold | Clearance info not shown (filtered out) |
| 🟡 `documents.storage_path` | documents | Not displayed (internal) |
| 🟡 `documents.mime_type` | documents | Not displayed |
| 🟡 `documents.byte_size` | documents | Not displayed |
| 🟡 `documents.uploaded_by_user_id` | documents | Uploader not shown |
| 🟡 `no_show.recorded_by_user_id` | no_show | Recorder not shown |
| 🟡 `no_show.recorded_at` | no_show | Record timestamp not shown |
| 🟡 `student_progress_forecast_cache.computed_at` | forecast | Computation time not shown |
| 🟡 `training_record_audit_exception.details` | audit_exception | JSONB details not displayed |
| 🟡 `training_record_audit_exception.last_detected_at` | audit_exception | Only first_detected_at shown |
| 🟡 `line_item_grade.position` | line_item_grade | Not displayed (used for ordering) |

---

## 6. School Schedule (`app/instructor/school-schedule/`)

### Resource Grid
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Room name + capacity | `room.name`, `.capacity` | ✅ |
| Room features badges | `room.features` | ✅ |
| Aircraft tail + model | `aircraft.tail_number`, `.make`, `.model` | ✅ |
| Aircraft year | `aircraft.year` (in detail sheet) | ✅ |
| Aircraft equipment notes | `aircraft.equipment_notes` (in detail sheet) | ✅ |
| Aircraft grounded status | `aircraft.grounded_at` | ✅ |
| Aircraft engine info | `aircraft_engine.designation`, `.make`, `.model`, `.total_time_hours` (in detail sheet) | ✅ |
| Aircraft equipment tags | `aircraft_equipment.kind`, `.label` (badges in detail sheet) | ✅ |
| Availability background bands | `schedule_block` (rendered as availability bands) | ✅ |
| Rendered time ranges | `schedule_block_instance` (drives rendered time ranges) | ✅ |
| Time block events | `reservation` filtered by `aircraft_id` or `room_id` | ✅ |
| Event student name | `users.full_name` via `reservation.student_id` | ✅ |
| Event color | Derived from `reservation.activity_type` | 🔁 |

### DB Columns NOT in School Schedule UI
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `schedule_block.recurrence_rule` | schedule_block | JSONB recurrence details not exposed in UI |
| 🟡 `aircraft_engine.serial_number` | aircraft_engine | Serial not shown |
| 🟡 `aircraft_engine.overhaul_hours` | aircraft_engine | Overhaul info not shown |
| 🟡 `aircraft_equipment.installed_at` | aircraft_equipment | Install date not shown |
| 🟡 `aircraft_equipment.expires_at` | aircraft_equipment | Expiry not shown |

---

## 7. Live Map (`app/instructor/live-map/`)

### Map Display
| UI Element | DB Table.Column / Data Source | Status |
|------------|-------------------------------|--------|
| Base marker position | `bases.latitude`, `.longitude` | ✅ |
| Base name | `bases.name` | ✅ |
| Geofence (circle + polygon) | `geofence.kind`, `.radius_nm`, `.geometry` | ✅ |
| Geofence label | `geofence.label` | ✅ |
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

### Aircraft Click — Passenger Manifest (NEW)
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Passenger position | `passenger_manifest.position` | ✅ |
| Passenger name | `passenger_manifest.name` | ✅ |
| Passenger weight | `passenger_manifest.weight_lbs` | ✅ |

### DB Columns NOT in Live Map UI
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `geofence.alert_on_exit` | geofence | Alert config not shown |
| 🟡 `passenger_manifest.reservation_id` | passenger_manifest | Link to reservation not shown |
| 🟡 `passenger_manifest.is_pilot` | passenger_manifest | Pilot flag not shown |

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
| Description (expandable row) | `maintenance_item.description` | ✅ |
| Last Done column | `maintenance_item.last_completed_at` | ✅ |

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
| Deferred until (detail sheet) | `aircraft_squawk.deferred_until` | ✅ |
| Deferral justification (detail sheet) | `aircraft_squawk.deferral_justification` | ✅ |

### Work Order Table & Detail
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Aircraft tail | `aircraft.tail_number` | ✅ |
| Title | `work_order.title` | ✅ |
| Kind badge | `work_order.kind` | ✅ |
| Status badge | `work_order.status` | ✅ |
| Assigned to | `users.full_name` via `work_order.assigned_to_user_id` | ✅ |
| Created date | `work_order.created_at` | ✅ |
| Description (detail sheet) | `work_order.description` | ✅ |
| Started at (timeline in detail sheet) | `work_order.started_at` | ✅ |
| Completed at (timeline in detail sheet) | `work_order.completed_at` | ✅ |
| Signed off at (timeline in detail sheet) | `work_order.signed_off_at` | ✅ |
| Signed off by (timeline in detail sheet) | `users.full_name` via `work_order.signed_off_by` | ✅ |

### DB Columns NOT in Maintenance UI
| DB Column | Table | Note |
|-----------|-------|------|
| 🟡 `maintenance_item.interval_rule` | maintenance_item | JSONB rule not displayed |
| 🟡 `maintenance_item.last_completed_hours` | maintenance_item | Not shown |
| 🟡 `maintenance_item.engine_id` | maintenance_item | Engine association not shown |
| 🟡 `aircraft_squawk.triaged_at/by` | aircraft_squawk | Triage info not shown |
| 🟡 `aircraft_squawk.work_order_id` | aircraft_squawk | Link to WO not shown |
| 🟡 `aircraft_squawk.returned_to_service_at` | aircraft_squawk | RTS info not shown |
| 🟡 `work_order.source_squawk_id` | work_order | Link to source squawk not shown |
| 🟡 `work_order.source_maintenance_item_id` | work_order | Link to source MX item not shown |
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

## 10. FIF Notice Banner (`app/instructor/layout.tsx`) (NEW)

### FIF Notice List
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Notice severity badge | `fif_notice.severity` | ✅ |
| Notice title | `fif_notice.title` | ✅ |
| Notice body | `fif_notice.body` | ✅ |
| Posted date (expanded view) | `fif_notice.posted_at` | ✅ |
| Posted by name (expanded view) | `users.full_name` via `fif_notice.posted_by_user_id` | ✅ |
| Effective date (when different from posted_at) | `fif_notice.effective_at` | ✅ |
| Base name | `bases.name` via `fif_notice.base_id` | ✅ |
| Expiry filter | `fif_notice.expires_at` (expired notices hidden) | ✅ |
| Severity sort order | 🔁 Derived: critical > important > info | 🔁 |
| Severity-based styling (bg, border, icon) | 🔁 Derived from `fif_notice.severity` | 🔁 |

### FIF Acknowledgement
| UI Element | DB Table.Column | Status |
|------------|----------------|--------|
| Acknowledged state per user | `fif_acknowledgement` WHERE `user_id = ? AND notice_id = ?` | ✅ |
| Acknowledge button | INSERT `fif_acknowledgement` | ✅ |
| Unacknowledged count | 🔁 `COUNT(active notices) - COUNT(acknowledged)` | 🔁 |
| Acknowledge action | INSERT `fif_acknowledgement(notice_id, user_id, acknowledged_at)` | ✅ |

### DB Columns NOT in FIF Banner UI
| DB Column | Table | Note |
|-----------|-------|------|
| (none — all FIF columns now surfaced) | | |

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
| 1 | `course_phase` / `unit` | Low | Syllabus depth (phases within stages) |
| 2 | `aircraft_component` | Low | Detailed component tracking |
| 3 | `airworthiness_directive` | Low | AD compliance tracking |
| 4 | `logbook_entry` | Low | Aircraft maintenance logbook |
| 5 | `work_order_task` | Low | WO task breakdown |
| 6 | `part` / `part_lot` | Low | Parts inventory |
| 7 | `audit_log` | Low | System audit trail |
| 8 | `flight_log_entry` / `flight_log_entry_engine` | Low | Hobbs/tach recording |

### Previously Unsurfaced Tables — Now Connected (this scan)
| # | DB Table | Where Surfaced | Connection Quality |
|---|---------|----------------|-------------------|
| 1 | `student_endorsement` | Student Detail > Progress tab > Endorsements card | ✅ Field-level mapped |
| 2 | `stage_check` | Student Detail > Progress tab > Stage Checks card + accordion headers | ✅ Field-level mapped |
| 3 | `flight_log_time` | Student Detail > Progress tab > Flight Time Summary card | ✅ Field-level mapped |
| 4 | `line_item_grade` | Student Detail > Progress tab > nested under lessons in accordion | ✅ Field-level mapped |
| 5 | `test_grade` | Student Detail > Progress tab > Test Results table | ✅ Field-level mapped |
| 6 | `person_hold` | Student List > HOLD badge + Student Detail > alert banner + header badge | ✅ Field-level mapped |
| 7 | `documents` | Student Detail > Demographics tab > Documents card + Medical info | ✅ Field-level mapped |
| 8 | `info_release_authorization` | Student Detail > Demographics tab > Info Release card | ✅ Field-level mapped |
| 9 | `lesson_override` | Student Detail > Progress tab > Active Overrides card | ✅ Field-level mapped |
| 10 | `no_show` | Student List > NS badge + Student Detail > header badge + Schedule tab > No-Show History | ✅ Field-level mapped |
| 11 | `fif_notice` / `fif_acknowledgement` | Instructor layout > dashboard-wide FIF banner | ✅ Field-level mapped |
| 12 | `student_progress_forecast_cache` | Student Detail > Progress tab > Forecast card | ✅ Field-level mapped |
| 13 | `training_record_audit_exception` | Student Detail > Compliance Warning banner | ✅ Field-level mapped |
| 14 | `passenger_manifest` | Live Map > Aircraft click panel | ✅ Field-level mapped |
| 15 | `schedule_block` / `schedule_block_instance` | School Schedule > Availability background bands | ✅ Field-level mapped |
| 16 | `aircraft_engine` | School Schedule > Aircraft detail sheet | ✅ Field-level mapped |
| 17 | `aircraft_equipment` | School Schedule > Aircraft detail sheet (badges) | ✅ Field-level mapped |

### Coverage Summary
| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| DB tables with UI representation | ~38 | ~42 | +4 |
| DB tables with NO UI (🟡) | 7 | 8 | +1 (refined wildcards into specific gaps) |
| UI elements with NO DB column (🔴) | 11 | 11 | unchanged |
| 🟡 field-level entries in Student Detail | 35 | 20 | -15 |
| 🟡 field-level entries in Maintenance | 27 | 20 | -7 |
| 🟡 field-level entries in FIF Banner | 4 | 0 | -4 |
| 🟡 field-level entries in Live Map | 3 | 3 | refined (specific fields vs wildcards) |
| 🟡 field-level entries in School Schedule | 5 | 5 | refined (specific fields vs wildcards) |

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
| student_pilot, solo, xc, aircraft_class_rating, flight_review, ipc, practical_test, knowledge_test, other | `endorsement_category` | ✅ Exact match (NEW) |
| scheduled, passed, failed | `stage_check_status` | ✅ Exact match (NEW) |
| dual_received, dual_given, pic, sic, solo | `flight_log_time_kind` | ✅ Exact match (NEW) |
| knowledge, oral, end_of_stage, practical | `test_kind` | ✅ Exact match (NEW) |
| hold, grounding | `hold_kind` | ✅ Exact match (NEW) |
| medical, pilot_license, government_id, insurance, aircraft_photo | `document_kind` | ✅ Exact match (NEW) |
| prerequisite_skip, repeat_limit_exceeded, currency_waiver | `lesson_override_kind` | ✅ Exact match (NEW) |
| info, important, critical | `fif_severity` | ✅ Exact match (NEW) |
| missing_lessons, hours_deficit, missing_endorsements, missing_stage_checks, stale_rollovers, expired_overrides | `audit_exception_kind` | ✅ Exact match (NEW) |
| info, warn, critical | `audit_exception_severity` | ✅ Exact match (NEW) |
| VFR, MVFR, IFR, LIFR | — | 🔴 UI-only (external weather data) |
| bug, layout, suggestion, question, general | — | 🔴 Feedback widget only (mailto) |

---

*This document is maintained by the UI-DB Connection Agent. Update triggers: any change to UI components, mock data types, or DB schema files.*
