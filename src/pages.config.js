import Home from './pages/Home';
import Universities from './pages/Universities';
import UniversityDetails from './pages/UniversityDetails';
import Courses from './pages/Courses';
import CourseMatcher from './pages/CourseMatcher';
import Contact from './pages/Contact';
import About from './pages/About';
import StudentDashboard from './pages/StudentDashboard';
import MyApplications from './pages/MyApplications';
import MyDocuments from './pages/MyDocuments';
import CRMDashboard from './pages/CRMDashboard';
import CRMStudents from './pages/CRMStudents';
import CRMInquiries from './pages/CRMInquiries';
import CRMApplications from './pages/CRMApplications';
import CRMUniversities from './pages/CRMUniversities';
import CRMCourses from './pages/CRMCourses';
import CRMCounselors from './pages/CRMCounselors';
import CRMReports from './pages/CRMReports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Universities": Universities,
    "UniversityDetails": UniversityDetails,
    "Courses": Courses,
    "CourseMatcher": CourseMatcher,
    "Contact": Contact,
    "About": About,
    "StudentDashboard": StudentDashboard,
    "MyApplications": MyApplications,
    "MyDocuments": MyDocuments,
    "CRMDashboard": CRMDashboard,
    "CRMStudents": CRMStudents,
    "CRMInquiries": CRMInquiries,
    "CRMApplications": CRMApplications,
    "CRMUniversities": CRMUniversities,
    "CRMCourses": CRMCourses,
    "CRMCounselors": CRMCounselors,
    "CRMReports": CRMReports,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};