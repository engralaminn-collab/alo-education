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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};