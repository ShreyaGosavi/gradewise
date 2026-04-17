# Database Schema & Relationships

Database: PostgreSQL, hosted on Neon DB. Schema managed via Prisma ORM.

---

## Enums

| Enum | Values |
|------|--------|
| Year | FE, SE, TE, BE |
| Department | CSE, IT, ME, CIVIL, EXTC |
| MarksType | INSEM1, INSEM2, ENDSEM, INTERNAL, PRACTICAL, ORAL |
| NoticeType | ASSIGNMENT, TEST, NOTICE, EVENT |

---

## Tables

### Admin
Stores administrator accounts. Admins are seeded manually — there is no signup flow.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key, auto-increment |
| email | String | Unique |
| password | String | Bcrypt hashed |
| name | String | |
| createdAt | DateTime | Auto |

---

### Teacher
Stores teacher accounts. Created by admin only. Password is auto-generated and emailed on creation.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| email | String | Unique |
| password | String | Bcrypt hashed |
| name | String | |
| isActive | Boolean | Soft delete flag, default true |
| createdAt | DateTime | Auto |

---

### Student
Stores student accounts. Created by admin (single or bulk CSV). Password auto-generated.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| email | String | Unique |
| password | String | Bcrypt hashed |
| name | String | |
| year | Year (enum) | |
| department | Department (enum) | |
| isActive | Boolean | Soft delete flag |
| createdAt | DateTime | Auto |

---

### Class
Represents a class group, identified by the combination of year + department + division (e.g., TE-CSE-A).

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| year | Year (enum) | |
| department | Department (enum) | |
| division | String | e.g., A, B, C |
| isActive | Boolean | Soft delete flag |
| classTeacherId | Int? | FK → Teacher.id, optional, unique |
| createdAt | DateTime | Auto |

Unique constraint: `(year, department, division)`

---

### Subject
Stores subjects taught in the system (e.g., DBMS, CN).

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| name | String | Unique |
| isActive | Boolean | Soft delete flag |
| createdAt | DateTime | Auto |

---

### SubjectAssignment
Junction table. Links a teacher to a subject in a specific class — represents "Teacher X teaches Subject Y to Class Z".

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| teacherId | Int | FK → Teacher.id |
| subjectId | Int | FK → Subject.id |
| classId | Int | FK → Class.id |

Unique constraint: `(subjectId, classId)` — one subject in one class can only have one teacher.

---

### StudentClass
Junction table. Links a student to a class. A student can only be in one class at a time.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| studentId | Int | FK → Student.id, unique |
| classId | Int | FK → Class.id |

---

### Attendance
Represents one lecture session where attendance was taken.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| date | DateTime | Date of lecture |
| lectureNo | Int | Lecture number for that day |
| classId | Int | FK → Class.id |
| subjectId | Int | FK → Subject.id |
| teacherId | Int | FK → Teacher.id |
| createdAt | DateTime | Auto |

Unique constraint: `(classId, subjectId, date, lectureNo)` — prevents duplicate sessions.

---

### AttendanceRecord
Records whether one specific student was present or absent in one Attendance session.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| attendanceId | Int | FK → Attendance.id |
| studentId | Int | FK → Student.id |
| isPresent | Boolean | Default false |

Unique constraint: `(attendanceId, studentId)`

---

### Marks
Stores marks for a student in a subject for a specific exam type. One row per student per subject per type.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| studentId | Int | FK → Student.id |
| subjectId | Int | FK → Subject.id |
| classId | Int | FK → Class.id |
| type | MarksType (enum) | |
| obtained | Float | Marks scored |
| total | Float | Maximum marks |
| createdAt | DateTime | Auto |

Unique constraint: `(studentId, subjectId, type)`

---

### NoticeBoard
Notices, assignments, or events posted by a teacher for a class.

| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| title | String | |
| content | String | |
| type | NoticeType (enum) | |
| dueDate | DateTime? | Optional, for assignments and tests |
| classId | Int | FK → Class.id |
| teacherId | Int | FK → Teacher.id |
| createdAt | DateTime | Auto |

---

## Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| Class → Teacher (classTeacher) | Many-to-One (optional) | A class may have one class teacher; a teacher can be class teacher of at most one class |
| Teacher → SubjectAssignment | One-to-Many | A teacher can teach multiple subject-class combinations |
| Subject → SubjectAssignment | One-to-Many | A subject can be taught in multiple classes |
| Class → SubjectAssignment | One-to-Many | A class has multiple subjects |
| Student → StudentClass | One-to-One | A student belongs to at most one class |
| Class → StudentClass | One-to-Many | A class has many students |
| Attendance → AttendanceRecord | One-to-Many | One lecture session has one record per student |
| Student → AttendanceRecord | One-to-Many | A student has attendance records across all lectures |
| Student → Marks | One-to-Many | A student has marks for each subject and exam type |
| Class → NoticeBoard | One-to-Many | A class has many notices |
| Teacher → NoticeBoard | One-to-Many | A teacher can post many notices |