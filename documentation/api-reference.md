# API Reference

Base URL: `http://localhost:8000/api`

All protected routes require: `Authorization: Bearer <token>`

Response format:
{
"success": true/false,
"message": "...",
"data": {...}
}

Paginated list endpoints additionally return:
{
"meta": { "total", "page", "limit", "totalPages", "hasNext", "hasPrev" }
}

---

## Admin Module — `/api/admin`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | None | Admin login. Body: `{ email, password }`. Returns JWT token. |
| GET | `/auth/me` | Admin | Returns the logged-in admin's profile. |

### Teachers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/teachers` | Admin | Add a new teacher. Body: `{ name, email }`. Auto-generates password and sends welcome email. |
| GET | `/teachers` | Admin | List all active teachers. Supports `?department=CSE&page=1&limit=10`. |
| GET | `/teachers/:id` | Admin | Get a single teacher with all their class and subject assignments. |
| DELETE | `/teachers/:id` | Admin | Soft deletes the teacher (marks `isActive: false`). |

### Students

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/students` | Admin | Add a new student. Body: `{ name, email, year, department }`. Auto-generates password and sends welcome email. |
| POST | `/students/bulk` | Admin | Bulk add students via CSV upload. Field: `file` (multipart). CSV columns: `name, email, year, department`. Returns successful and failed rows. |
| GET | `/students` | Admin | List all active students. Supports `?year=TE&department=CSE&classId=1&page=1&limit=10`. |
| GET | `/students/:id` | Admin | Get a single student with their class info. |
| DELETE | `/students/:id` | Admin | Soft deletes the student. |

### Classes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/classes` | Admin | Create a new class. Body: `{ year, department, division }`. Combination must be unique (e.g., TE + CSE + A). |
| GET | `/classes` | Admin | List all active classes with their teacher, subjects, and students. Supports `?year=TE&department=CSE&page=1&limit=10`. |
| GET | `/classes/:id` | Admin | Get a single class with full details. |
| DELETE | `/classes/:id` | Admin | Soft deletes the class. |

### Subjects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/subjects` | Admin | Create a new subject. Body: `{ name }`. |
| GET | `/subjects` | Admin | List all active subjects and where they are taught. Supports `?page=1&limit=10`. |
| GET | `/subjects/:id` | Admin | Get a single subject with all class assignments. |
| DELETE | `/subjects/:id` | Admin | Soft deletes the subject. |

### Assignments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/assignments/class-teacher` | Admin | Assign a teacher as class teacher of a class. Body: `{ classId, teacherId }`. One class can have only one class teacher. |
| DELETE | `/assignments/class-teacher/:classId` | Admin | Remove the class teacher from a class. |
| POST | `/assignments/subject-teacher` | Admin | Assign a teacher to teach a subject in a class. Body: `{ classId, subjectId, teacherId }`. One subject in one class can only have one teacher. |
| DELETE | `/assignments/subject-teacher/:assignmentId` | Admin | Remove a subject-teacher assignment. |
| POST | `/assignments/student-class` | Admin | Assign a student to a class. Body: `{ studentId, classId }`. Student's year and department must match the class. |
| DELETE | `/assignments/student-class/:studentId` | Admin | Remove a student from their class. |

---

## Teacher Module — `/api/teacher`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | None | Teacher login. Body: `{ email, password }`. Returns JWT. |
| GET | `/auth/me` | Teacher | Returns teacher profile, all assignments, and dashboard stats (totalStudents, totalSubjectsTeaching, totalClassesTeaching, totalLecturesTaken, isClassTeacher). |

### Attendance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance` | Teacher | Mark attendance for a lecture. Body: `{ classId, subjectId, date, lectureNo, records: [{ studentId, isPresent }] }`. Teacher must be assigned to that subject in that class. |
| PUT | `/attendance/:attendanceId` | Teacher | Update an existing lecture's attendance. Body: `{ records: [{ studentId, isPresent }] }`. Only the teacher who created it can update. |
| GET | `/attendance/:classId/:subjectId` | Teacher | View all lectures and records for a class-subject combination. |
| GET | `/attendance/:classId/:subjectId/summary` | Teacher | View per-student attendance summary with total lectures, attended count, and percentage. |

### Marks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/marks` | Teacher | Add marks for all students in a class for one exam type. Body: `{ classId, subjectId, type, total, records: [{ studentId, obtained }] }`. |
| PUT | `/marks` | Teacher | Update marks for students for an existing exam type. Body: same as POST but without `total`. |
| GET | `/marks/:classId/:subjectId` | Teacher | View all marks for a class-subject, grouped by exam type. |

### Internal Marks Calculator

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/internal-marks/calculate` | Teacher | Calculates internal marks for all students automatically. Body: `{ classId, subjectId, totalInternal, attendanceMarks }`. Fetches all entered mark slots and attendance, applies equal weightage per slot, calculates attendance score proportionally, stores result as INTERNAL type in Marks table. Returns full breakdown per student. |

### Notices

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/notices` | Teacher | Post a notice to a class. Body: `{ classId, title, content, type, dueDate? }`. Teacher must be assigned to that class (as class teacher or subject teacher). |
| GET | `/notices/:classId` | Teacher | View all notices for a class, newest first. |
| DELETE | `/notices/:noticeId` | Teacher | Delete a notice. Only the teacher who posted it can delete it. |

---

## Student Module — `/api/student`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | None | Student login. Body: `{ email, password }`. Returns JWT. |
| GET | `/auth/me` | Student | Returns student profile and their assigned class info. |

### Student Views (read-only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/attendance` | Student | View own attendance across all subjects. Returns per-subject breakdown: totalLectures, attended, percentage, and lecture-by-lecture history. |
| GET | `/marks` | Student | View own marks across all subjects. Returns per-subject marks grouped by exam type with percentage per slot. |
| GET | `/notices` | Student | View all notices posted to their class, newest first. |

---

## Shared — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/change-password` | Any role | Change password for the logged-in user (works for admin, teacher, and student — role is detected from JWT). Body: `{ currentPassword, newPassword }`. New password must be at least 6 characters. |

---

## Enums

**Year:** `FE | SE | TE | BE`

**Department:** `CSE | IT | ME | CIVIL | EXTC`

**MarksType:** `INSEM1 | INSEM2 | ENDSEM | INTERNAL | PRACTICAL | ORAL`

**NoticeType:** `ASSIGNMENT | TEST | NOTICE | EVENT`