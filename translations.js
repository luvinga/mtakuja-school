var TRANSLATIONS = {
    en: {
        'login_title': 'Login Screen',
        'login_as': 'Login as:',
        'teacher': 'Teacher',
        'parent': 'Parent',
        'phone': 'Phone Number:',
        'password': 'Password:',
        'login_btn': 'Login',
        'dashboard': 'Dashboard',
        'logout': 'Logout',
        'back': '← Back',
        'view_attendance': 'View Attendance Report',
        'view_grades': 'View Grades Report',
        'view_result': 'View Result Slip',
        'view_notices': 'View Notices',
        'view_timetable': '📅 View Timetable',
        'save': 'Save',
        'loading': 'Loading...',
        'no_data': 'No data found.',
        'notifications': 'Notifications',
        'mark_read': 'Mark all read'
    },
    sw: {
        'login_title': 'Ingia Mfumo',
        'login_as': 'Ingia kama:',
        'teacher': 'Mwalimu',
        'parent': 'Mzazi',
        'phone': 'Namba ya Simu:',
        'password': 'Nenosiri:',
        'login_btn': 'Ingia',
        'dashboard': 'Dashibodi',
        'logout': 'Toka',
        'back': '← Rudi',
        'view_attendance': 'Tazama Ripoti ya Mahudhurio',
        'view_grades': 'Tazama Ripoti ya Alama',
        'view_result': 'Tazama Stakabadhi ya Matokeo',
        'view_notices': 'Tazama Matangazo',
        'view_timetable': '📅 Tazama Ratiba',
        'save': 'Hifadhi',
        'loading': 'Inapakia...',
        'no_data': 'Hakuna data.',
        'notifications': 'Arifa',
        'mark_read': 'Soma zote'
    }
};

function getCurrentLang() {
    return localStorage.getItem('appLang') || 'en';
}

function t(key) {
    var lang = getCurrentLang();
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['en'][key]) || key;
}

function applyTranslations() {
    var lang = getCurrentLang();
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        var translation = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['en'][key]);
        if (translation) el.textContent = translation;
    });
}
