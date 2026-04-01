// Navigation
function goTo(url) { window.location.href = url; }
function goBack() { window.history.back(); }

// ─── Auth ─────────────────────────────────────────────────────────────────────
function checkAuth() {
    const role = localStorage.getItem('role');
    if (!role) goTo('index.html');
    return role;
}

// ─── Teacher Access Helpers ───────────────────────────────────────────────────

// Forms this teacher is involved with (teaching or class teacher)
function getTeacherForms(teacher) {
    if (!teacher || teacher.role === 'admin') return ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
    const forms = new Set(teacher.forms || []);
    if (teacher.classTeacher) forms.add(teacher.classTeacher.form);
    return [...forms].sort();
}

// Streams a teacher can access for a given Form 3/4
function getAccessibleStreams(teacher, form) {
    if (!teacher || teacher.role === 'admin') return ['Science', 'Business', 'Arts'];
    const streams = new Set();
    // Streams where teacher's subject is taught
    if (teacher.subject && (teacher.forms || []).includes(form)) {
        ['Science', 'Business', 'Arts'].forEach(s => {
            if (streamSubjects[s] && streamSubjects[s].includes(teacher.subject)) streams.add(s);
        });
    }
    // Stream where teacher is class teacher
    if (teacher.classTeacher && teacher.classTeacher.form === form && teacher.classTeacher.stream) {
        streams.add(teacher.classTeacher.stream);
    }
    return [...streams];
}

// Can this teacher take attendance for the current form/stream?
function teacherCanAttend(teacher, form, stream) {
    if (!teacher || teacher.role === 'admin') return true;
    if (!teacher.classTeacher) return false;
    return teacher.classTeacher.form === form &&
           (teacher.classTeacher.stream || null) === (stream || null);
}

// Can this teacher enter grades for the current form/stream?
function teacherCanGrade(teacher, form, stream) {
    if (!teacher || teacher.role === 'admin') return true;
    if (!teacher.subject || !(teacher.forms || []).includes(form)) return false;
    if (hasStreams(form)) {
        if (!stream) return false;
        return !!(streamSubjects[stream] && streamSubjects[stream].includes(teacher.subject));
    }
    return !!(classSubjects[form] && classSubjects[form].includes(teacher.subject));
}

// ─── Firestore Helpers ────────────────────────────────────────────────────────

// Load a teacher document from Firestore by phone number.
// Returns a Promise that resolves to the teacher object (with phone included)
// or null if not found.
function loadTeacherFromFirestore(phone) {
    return db.collection('teachers').where('phone', '==', phone).get()
        .then(function(snapshot) {
            if (snapshot.empty) return null;
            return snapshot.docs[0].data();
        });
}

// Load all students for a given form (and optionally stream) from Firestore.
// Returns a Promise that resolves to an array of student objects.
function loadStudentsForClass(form, stream) {
    var query = db.collection('students').where('form', '==', form);
    if (stream) {
        query = query.where('stream', '==', stream);
    } else {
        query = query.where('stream', '==', null);
    }
    return query.get().then(function(snapshot) {
        return snapshot.docs.map(function(doc) { return doc.data(); });
    });
}

// ─── Subjects ─────────────────────────────────────────────────────────────────
const classSubjects = {
    'Form 1': ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'Agriculture', 'English Literature'],
    'Form 2': ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'Agriculture', 'English Literature']
};

const streamSubjects = {
    'Science':  ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics'],
    'Business': ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Book Keeping', 'Commerce', 'History', 'Geography', 'Civics'],
    'Arts':     ['Mathematics', 'English', 'Kiswahili', 'Biology', 'History', 'Geography', 'Civics']
};

const streamForms = ['Form 3', 'Form 4'];
function hasStreams(cls) { return streamForms.includes(cls); }

// ─── Selected Class/Stream ────────────────────────────────────────────────────
function getSelectedClass()  { return localStorage.getItem('selectedClass'); }
function getSelectedStream() { return localStorage.getItem('selectedStream'); }

function getCurrentSubjects() {
    const cls = getSelectedClass();
    if (hasStreams(cls)) {
        const stream = getSelectedStream();
        return stream ? streamSubjects[stream] : [];
    }
    return classSubjects[cls] || [];
}

// ─── Attendance ───────────────────────────────────────────────────────────────
let attendance = {};

function mark(student, status) {
    attendance[student] = status;
    alert(student + ' marked as ' + status);
}

function saveAttendance() {
    const date = new Date().toISOString().split('T')[0];
    const cls = getSelectedClass();
    const stream = getSelectedStream();
    const record = {
        date,
        class: cls,
        stream: stream || null,
        attendance: {...attendance},
        timestamp: new Date().toISOString()
    };
    db.collection('attendance').add(record)
        .then(function() {
            alert('Attendance Saved!');
            attendance = {};
        })
        .catch(function(err) {
            alert('Error saving attendance: ' + err.message);
        });
}

// ─── Grade Helpers (Tanzania NECTA) ──────────────────────────────────────────

// Grade letter to points (A=1 best, F=5 worst)
function gradeToPoints(grade) {
    const map = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'F': 5 };
    return map[grade.toUpperCase()] || 5;
}

// Average points back to grade letter
function pointsToGrade(points) {
    if (points <= 1.5) return 'A';
    if (points <= 2.5) return 'B';
    if (points <= 3.5) return 'C';
    if (points <= 4.5) return 'D';
    return 'F';
}

// Division from array of per-subject points (uses best 7)
function calculateDivision(pointsArray) {
    const best7 = pointsArray.slice().sort(function(a, b) { return a - b; }).slice(0, 7);
    const total = best7.reduce(function(s, p) { return s + p; }, 0);
    if (total <= 17) return 'Division I';
    if (total <= 21) return 'Division II';
    if (total <= 25) return 'Division III';
    if (total <= 33) return 'Division IV';
    return 'Division 0';
}

// ─── Grades ───────────────────────────────────────────────────────────────────
let grades = {};

function saveGrades() {
    const selects = document.querySelectorAll('#grades-list select.grade-select');
    const studentNames = Array.from(document.querySelectorAll('#grades-list .student-name')).map(el => el.textContent);
    studentNames.forEach((student, index) => {
        if (selects[index]) grades[student] = selects[index].value;
    });
    const date = new Date().toISOString().split('T')[0];
    const cls = getSelectedClass();
    const stream = getSelectedStream();
    const subject = document.getElementById('subject-select') ? document.getElementById('subject-select').value : '';
    const examTypeEl = document.getElementById('exam-type-select');
    const examType = examTypeEl ? examTypeEl.value : '';
    const record = {
        date,
        class: cls,
        stream: stream || null,
        subject,
        examType,
        grades: {...grades},
        timestamp: new Date().toISOString()
    };
    db.collection('grades').add(record)
        .then(function() {
            alert('Grades Saved!');
            grades = {};
        })
        .catch(function(err) {
            alert('Error saving grades: ' + err.message);
        });
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
function viewProfile(student) {
    const cls = getSelectedClass();
    const stream = getSelectedStream();
    alert('Name: ' + student + '\nClass: ' + cls + (stream ? ' — ' + stream : ''));
}

function logout() {
    ['role', 'teacherPhone', 'teacherData', 'student', 'selectedClass', 'selectedStream', 'studentClass', 'studentStream',
     'forcePasswordChange', 'changePasswordPhone', 'changePasswordCollection'].forEach(k => localStorage.removeItem(k));
    goTo('index.html');
}
