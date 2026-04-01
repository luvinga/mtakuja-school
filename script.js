// Navigation function
function goTo(url) {
    window.location.href = url;
}

function goBack() {
    window.history.back();
}

function checkAuth() {
    const role = localStorage.getItem('role');
    if (!role) {
        goTo('index.html');
    }
    return role;
}

// Parent to student mapping
const parentStudents = {
    '0714300300': 'Student 1',
    '0714300301': 'Student 2',
    '0714300302': 'Student 3',
    '0714300303': 'Student 4',
    '0714300304': 'Student 5'
};

// Parent credentials
const parentCredentials = {
    '0714300300': 'parent1',
    '0714300301': 'parent2',
    '0714300302': 'parent3',
    '0714300303': 'parent4',
    '0714300304': 'parent5'
};

// Students list
let students = ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5"];
let attendance = {};

// Attendance functions
function mark(student, status) {
    attendance[student] = status;
    alert(student + " marked as " + status);
}

function saveAttendance() {
    let date = new Date().toISOString().split('T')[0];
    let record = { date, attendance: {...attendance} };
    let records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    records.push(record);
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    alert("Attendance Saved!");
    attendance = {};
}

// Grades function
let grades = {};

function saveGrades() {
    let inputs = document.querySelectorAll('#grades-list input');
    students.forEach((student, index) => {
        grades[student] = inputs[index].value;
    });
    let date = new Date().toISOString().split('T')[0];
    let record = { date, grades: {...grades} };
    let records = JSON.parse(localStorage.getItem('gradesRecords') || '[]');
    records.push(record);
    localStorage.setItem('gradesRecords', JSON.stringify(records));
    alert("Grades Saved!");
    grades = {};
}

// View student profile
function viewProfile(student) {
    alert("Viewing profile of " + student + "\n\nDetails:\n- Name: " + student + "\n- Class: 10A\n- Roll No: " + (students.indexOf(student) + 1));
}

function logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('student');
    goTo('index.html');
}
