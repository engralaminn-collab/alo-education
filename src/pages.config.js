import Home from './pages/Home';
import Universities from './pages/Universities';
import UniversityDetails from './pages/UniversityDetails';
import Courses from './pages/Courses';
import CourseMatcher from './pages/CourseMatcher';
import Contact from './pages/Contact';
import About from './pages/About';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Universities": Universities,
    "UniversityDetails": UniversityDetails,
    "Courses": Courses,
    "CourseMatcher": CourseMatcher,
    "Contact": Contact,
    "About": About,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};