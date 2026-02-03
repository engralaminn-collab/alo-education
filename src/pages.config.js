/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import AlumniNetwork from './pages/AlumniNetwork';
import AlumniProfile from './pages/AlumniProfile';
import BookConsultation from './pages/BookConsultation';
import CRMApplications from './pages/CRMApplications';
import CRMAutomation from './pages/CRMAutomation';
import CRMCommunications from './pages/CRMCommunications';
import CRMCounselors from './pages/CRMCounselors';
import CRMCourses from './pages/CRMCourses';
import CRMDashboard from './pages/CRMDashboard';
import CRMInquiries from './pages/CRMInquiries';
import CRMMessages from './pages/CRMMessages';
import CRMReports from './pages/CRMReports';
import CRMSecureDocuments from './pages/CRMSecureDocuments';
import CRMSettings from './pages/CRMSettings';
import CRMStudents from './pages/CRMStudents';
import CRMTasks from './pages/CRMTasks';
import CRMTestimonials from './pages/CRMTestimonials';
import CRMUniversities from './pages/CRMUniversities';
import CRMUniversityOutreach from './pages/CRMUniversityOutreach';
import Contact from './pages/Contact';
import CounselorDashboard from './pages/CounselorDashboard';
import CourseDetails from './pages/CourseDetails';
import CourseMatcher from './pages/CourseMatcher';
import Courses from './pages/Courses';
import Home from './pages/Home';
import LanguagePrep from './pages/LanguagePrep';
import Messages from './pages/Messages';
import MyApplications from './pages/MyApplications';
import MyComparisons from './pages/MyComparisons';
import MyDocuments from './pages/MyDocuments';
import MyProfile from './pages/MyProfile';
import ScholarshipFinder from './pages/ScholarshipFinder';
import Services from './pages/Services';
import SharedComparison from './pages/SharedComparison';
import StudentDashboard from './pages/StudentDashboard';
import StudentPortal from './pages/StudentPortal';
import StudyInAustralia from './pages/StudyInAustralia';
import StudyInCanada from './pages/StudyInCanada';
import StudyInDubai from './pages/StudyInDubai';
import StudyInIreland from './pages/StudyInIreland';
import StudyInNewZealand from './pages/StudyInNewZealand';
import StudyInUK from './pages/StudyInUK';
import StudyInUSA from './pages/StudyInUSA';
import SubmitTestimonial from './pages/SubmitTestimonial';
import TestimonialsPage from './pages/TestimonialsPage';
import Universities from './pages/Universities';
import UniversityDetails from './pages/UniversityDetails';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AlumniNetwork": AlumniNetwork,
    "AlumniProfile": AlumniProfile,
    "BookConsultation": BookConsultation,
    "CRMApplications": CRMApplications,
    "CRMAutomation": CRMAutomation,
    "CRMCommunications": CRMCommunications,
    "CRMCounselors": CRMCounselors,
    "CRMCourses": CRMCourses,
    "CRMDashboard": CRMDashboard,
    "CRMInquiries": CRMInquiries,
    "CRMMessages": CRMMessages,
    "CRMReports": CRMReports,
    "CRMSecureDocuments": CRMSecureDocuments,
    "CRMSettings": CRMSettings,
    "CRMStudents": CRMStudents,
    "CRMTasks": CRMTasks,
    "CRMTestimonials": CRMTestimonials,
    "CRMUniversities": CRMUniversities,
    "CRMUniversityOutreach": CRMUniversityOutreach,
    "Contact": Contact,
    "CounselorDashboard": CounselorDashboard,
    "CourseDetails": CourseDetails,
    "CourseMatcher": CourseMatcher,
    "Courses": Courses,
    "Home": Home,
    "LanguagePrep": LanguagePrep,
    "Messages": Messages,
    "MyApplications": MyApplications,
    "MyComparisons": MyComparisons,
    "MyDocuments": MyDocuments,
    "MyProfile": MyProfile,
    "ScholarshipFinder": ScholarshipFinder,
    "Services": Services,
    "SharedComparison": SharedComparison,
    "StudentDashboard": StudentDashboard,
    "StudentPortal": StudentPortal,
    "StudyInAustralia": StudyInAustralia,
    "StudyInCanada": StudyInCanada,
    "StudyInDubai": StudyInDubai,
    "StudyInIreland": StudyInIreland,
    "StudyInNewZealand": StudyInNewZealand,
    "StudyInUK": StudyInUK,
    "StudyInUSA": StudyInUSA,
    "SubmitTestimonial": SubmitTestimonial,
    "TestimonialsPage": TestimonialsPage,
    "Universities": Universities,
    "UniversityDetails": UniversityDetails,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};