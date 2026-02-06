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
import AlumniNetwork from './pages/AlumniNetwork';
import AlumniProfile from './pages/AlumniProfile';
import BookConsultation from './pages/BookConsultation';
import CRMApplications from './pages/CRMApplications';
import CRMAutomation from './pages/CRMAutomation';
import CRMBulkCampaigns from './pages/CRMBulkCampaigns';
import CRMCommunications from './pages/CRMCommunications';
import CRMCounselors from './pages/CRMCounselors';
import CRMCourses from './pages/CRMCourses';
import CRMDashboard from './pages/CRMDashboard';
import CRMImportStudents from './pages/CRMImportStudents';
import CRMInquiries from './pages/CRMInquiries';
import CRMMessages from './pages/CRMMessages';
import CRMPerformanceDashboard from './pages/CRMPerformanceDashboard';
import CRMPerformanceReports from './pages/CRMPerformanceReports';
import CRMReports from './pages/CRMReports';
import CRMSecureDocuments from './pages/CRMSecureDocuments';
import CRMSettings from './pages/CRMSettings';
import CRMStudentProfile from './pages/CRMStudentProfile';
import CRMStudentSuccess from './pages/CRMStudentSuccess';
import CRMStudents from './pages/CRMStudents';
import CRMTasks from './pages/CRMTasks';
import CRMTestimonials from './pages/CRMTestimonials';
import CRMUniversities from './pages/CRMUniversities';
import CRMUniversityOutreach from './pages/CRMUniversityOutreach';
import CompareCourses from './pages/CompareCourses';
import CompleteProfile from './pages/CompleteProfile';
import CourseDetails from './pages/CourseDetails';
import CourseFinder from './pages/CourseFinder';
import Courses from './pages/Courses';
import IELTSPrep from './pages/IELTSPrep';
import LanguagePrep from './pages/LanguagePrep';
import ManagerDashboard from './pages/ManagerDashboard';
import Messages from './pages/Messages';
import MyApplications from './pages/MyApplications';
import MyComparisons from './pages/MyComparisons';
import MyDocuments from './pages/MyDocuments';
import MyProfile from './pages/MyProfile';
import PTEPrep from './pages/PTEPrep';
import Resources from './pages/Resources';
import SharedComparison from './pages/SharedComparison';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudyInAustralia from './pages/StudyInAustralia';
import StudyInCanada from './pages/StudyInCanada';
import StudyInDubai from './pages/StudyInDubai';
import StudyInIreland from './pages/StudyInIreland';
import StudyInNewZealand from './pages/StudyInNewZealand';
import StudyInUSA from './pages/StudyInUSA';
import SubmitTestimonial from './pages/SubmitTestimonial';
import TestimonialsPage from './pages/TestimonialsPage';
import Universities from './pages/Universities';
import CounselorDashboard from './pages/CounselorDashboard';
import CourseFinderResults from './pages/CourseFinderResults';
import Home from './pages/Home';
import StudyInUK from './pages/StudyInUK';
import ScholarshipFinder from './pages/ScholarshipFinder';
import Services from './pages/Services';
import UniversityDetails from './pages/UniversityDetails';
import StudentPortal from './pages/StudentPortal';
import Contact from './pages/Contact';
import CourseMatcher from './pages/CourseMatcher';
import About from './pages/About';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AlumniNetwork": AlumniNetwork,
    "AlumniProfile": AlumniProfile,
    "BookConsultation": BookConsultation,
    "CRMApplications": CRMApplications,
    "CRMAutomation": CRMAutomation,
    "CRMBulkCampaigns": CRMBulkCampaigns,
    "CRMCommunications": CRMCommunications,
    "CRMCounselors": CRMCounselors,
    "CRMCourses": CRMCourses,
    "CRMDashboard": CRMDashboard,
    "CRMImportStudents": CRMImportStudents,
    "CRMInquiries": CRMInquiries,
    "CRMMessages": CRMMessages,
    "CRMPerformanceDashboard": CRMPerformanceDashboard,
    "CRMPerformanceReports": CRMPerformanceReports,
    "CRMReports": CRMReports,
    "CRMSecureDocuments": CRMSecureDocuments,
    "CRMSettings": CRMSettings,
    "CRMStudentProfile": CRMStudentProfile,
    "CRMStudentSuccess": CRMStudentSuccess,
    "CRMStudents": CRMStudents,
    "CRMTasks": CRMTasks,
    "CRMTestimonials": CRMTestimonials,
    "CRMUniversities": CRMUniversities,
    "CRMUniversityOutreach": CRMUniversityOutreach,
    "CompareCourses": CompareCourses,
    "CompleteProfile": CompleteProfile,
    "CourseDetails": CourseDetails,
    "CourseFinder": CourseFinder,
    "Courses": Courses,
    "IELTSPrep": IELTSPrep,
    "LanguagePrep": LanguagePrep,
    "ManagerDashboard": ManagerDashboard,
    "Messages": Messages,
    "MyApplications": MyApplications,
    "MyComparisons": MyComparisons,
    "MyDocuments": MyDocuments,
    "MyProfile": MyProfile,
    "PTEPrep": PTEPrep,
    "Resources": Resources,
    "SharedComparison": SharedComparison,
    "StaffDashboard": StaffDashboard,
    "StudentDashboard": StudentDashboard,
    "StudyInAustralia": StudyInAustralia,
    "StudyInCanada": StudyInCanada,
    "StudyInDubai": StudyInDubai,
    "StudyInIreland": StudyInIreland,
    "StudyInNewZealand": StudyInNewZealand,
    "StudyInUSA": StudyInUSA,
    "SubmitTestimonial": SubmitTestimonial,
    "TestimonialsPage": TestimonialsPage,
    "Universities": Universities,
    "CounselorDashboard": CounselorDashboard,
    "CourseFinderResults": CourseFinderResults,
    "Home": Home,
    "StudyInUK": StudyInUK,
    "ScholarshipFinder": ScholarshipFinder,
    "Services": Services,
    "UniversityDetails": UniversityDetails,
    "StudentPortal": StudentPortal,
    "Contact": Contact,
    "CourseMatcher": CourseMatcher,
    "About": About,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};