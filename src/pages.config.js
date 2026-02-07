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
import ApplicationForm from './pages/ApplicationForm';
import BookConsultation from './pages/BookConsultation';
import CRMAIAssistant from './pages/CRMAIAssistant';
import CRMAnalyticsDashboard from './pages/CRMAnalyticsDashboard';
import CRMAnalyticsOutreach from './pages/CRMAnalyticsOutreach';
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
import Contact from './pages/Contact';
import CounselorDashboard from './pages/CounselorDashboard';
import CounselorMessaging from './pages/CounselorMessaging';
import CourseDetails from './pages/CourseDetails';
import CourseFinder from './pages/CourseFinder';
import CourseFinderResults from './pages/CourseFinderResults';
import CourseMatcher from './pages/CourseMatcher';
import Courses from './pages/Courses';
import DuolingoPrep from './pages/DuolingoPrep';
import Home from './pages/Home';
import IELTSPrep from './pages/IELTSPrep';
import InAppMessaging from './pages/InAppMessaging';
import LanguagePrep from './pages/LanguagePrep';
import ManagerDashboard from './pages/ManagerDashboard';
import Messages from './pages/Messages';
import MyApplications from './pages/MyApplications';
import MyComparisons from './pages/MyComparisons';
import MyDocuments from './pages/MyDocuments';
import MyProfile from './pages/MyProfile';
import OETPrep from './pages/OETPrep';
import OnboardingStatus from './pages/OnboardingStatus';
import PTEPrep from './pages/PTEPrep';
import Resources from './pages/Resources';
import ScholarshipFinder from './pages/ScholarshipFinder';
import Services from './pages/Services';
import SharedComparison from './pages/SharedComparison';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentDashboardPersonalized from './pages/StudentDashboardPersonalized';
import StudentPortal from './pages/StudentPortal';
import StudyInAustralia from './pages/StudyInAustralia';
import StudyInCanada from './pages/StudyInCanada';
import StudyInDubai from './pages/StudyInDubai';
import StudyInIreland from './pages/StudyInIreland';
import StudyInNewZealand from './pages/StudyInNewZealand';
import StudyInUK from './pages/StudyInUK';
import StudyInUSA from './pages/StudyInUSA';
import SubmitTestimonial from './pages/SubmitTestimonial';
import TOEFLPrep from './pages/TOEFLPrep';
import TestimonialsPage from './pages/TestimonialsPage';
import Universities from './pages/Universities';
import UniversityComparison from './pages/UniversityComparison';
import UniversityDetailsPage from './pages/UniversityDetailsPage';
import UniversityOnboarding from './pages/UniversityOnboarding';
import UniversityPartnerPortal from './pages/UniversityPartnerPortal';
import CounselorChat from './pages/CounselorChat';
import CounselorPerformanceDashboard from './pages/CounselorPerformanceDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AlumniNetwork": AlumniNetwork,
    "AlumniProfile": AlumniProfile,
    "ApplicationForm": ApplicationForm,
    "BookConsultation": BookConsultation,
    "CRMAIAssistant": CRMAIAssistant,
    "CRMAnalyticsDashboard": CRMAnalyticsDashboard,
    "CRMAnalyticsOutreach": CRMAnalyticsOutreach,
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
    "Contact": Contact,
    "CounselorDashboard": CounselorDashboard,
    "CounselorMessaging": CounselorMessaging,
    "CourseDetails": CourseDetails,
    "CourseFinder": CourseFinder,
    "CourseFinderResults": CourseFinderResults,
    "CourseMatcher": CourseMatcher,
    "Courses": Courses,
    "DuolingoPrep": DuolingoPrep,
    "Home": Home,
    "IELTSPrep": IELTSPrep,
    "InAppMessaging": InAppMessaging,
    "LanguagePrep": LanguagePrep,
    "ManagerDashboard": ManagerDashboard,
    "Messages": Messages,
    "MyApplications": MyApplications,
    "MyComparisons": MyComparisons,
    "MyDocuments": MyDocuments,
    "MyProfile": MyProfile,
    "OETPrep": OETPrep,
    "OnboardingStatus": OnboardingStatus,
    "PTEPrep": PTEPrep,
    "Resources": Resources,
    "ScholarshipFinder": ScholarshipFinder,
    "Services": Services,
    "SharedComparison": SharedComparison,
    "StaffDashboard": StaffDashboard,
    "StudentDashboard": StudentDashboard,
    "StudentDashboardPersonalized": StudentDashboardPersonalized,
    "StudentPortal": StudentPortal,
    "StudyInAustralia": StudyInAustralia,
    "StudyInCanada": StudyInCanada,
    "StudyInDubai": StudyInDubai,
    "StudyInIreland": StudyInIreland,
    "StudyInNewZealand": StudyInNewZealand,
    "StudyInUK": StudyInUK,
    "StudyInUSA": StudyInUSA,
    "SubmitTestimonial": SubmitTestimonial,
    "TOEFLPrep": TOEFLPrep,
    "TestimonialsPage": TestimonialsPage,
    "Universities": Universities,
    "UniversityComparison": UniversityComparison,
    "UniversityDetailsPage": UniversityDetailsPage,
    "UniversityOnboarding": UniversityOnboarding,
    "UniversityPartnerPortal": UniversityPartnerPortal,
    "CounselorChat": CounselorChat,
    "CounselorPerformanceDashboard": CounselorPerformanceDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};