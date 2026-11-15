import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppProvider, useApp } from "./context/AppContext"
import Layout from "./components/Layout"
import PublicLayout from "./components/PublicLayout"
import Login from "./pages/Login"
import Home from "./pages/public/Home"
import AboutUs from "./pages/public/AboutUs"
import Contact from "./pages/public/Contact"
import Dashboard from "./pages/Dashboard"
import Reports from "./pages/Reports"
import Admissions from "./pages/Admissions"
import Students from "./pages/Students"
import Classes from "./pages/Classes"
import Parents from "./pages/Parents"
import Assets from "./pages/Assets"
import Inventory from "./pages/Inventory"
import Subjects from "./pages/Subjects"
import Teachers from "./pages/Teachers"
import Substitutes from "./pages/Substitutes"
import Timetable from "./pages/Timetable"
import Attendance from "./pages/Attendance"
import Exams from "./pages/Exams"
import Marks from "./pages/Marks"
import HallTickets from "./pages/HallTickets"
import Fees from "./pages/Fees"
import Payroll from "./pages/Payroll"
import { LibraryBooks, LibraryCirculation } from "./pages/Library"
import Users from "./pages/Users"
import Settings from "./pages/Settings"
import Account from "./pages/Account"
import About from "./pages/About"
import Portal from "./pages/Portal"
import {
  Notices,
  CalendarPage,
  LessonPlanning,
  Logbook,
  Discipline,
  Conduct,
  Activities,
  Helpdesk,
  Complaints,
  Documents,
  PTM,
  FeeStructure,
  DailyAccounts,
} from "./pages/simplePages"

function Protected({ children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/home" replace />
  return children
}

function RoleHome() {
  const { user } = useApp()
  if (["student", "parent"].includes(user?.role))
    return <Navigate to="/portal" replace />
  return <Dashboard />
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public site — shared navbar for home/about/contact/login */}
          <Route element={<PublicLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route path="/" element={<RoleHome />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/students" element={<Students />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/library" element={<LibraryBooks />} />
            <Route
              path="/library-circulation"
              element={<LibraryCirculation />}
            />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/substitutes" element={<Substitutes />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/ptm" element={<PTM />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/lesson-planning" element={<LessonPlanning />} />
            <Route path="/logbook" element={<Logbook />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/hall-tickets" element={<HallTickets />} />
            <Route path="/discipline" element={<Discipline />} />
            <Route path="/conduct" element={<Conduct />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/daily-accounts" element={<DailyAccounts />} />
            <Route path="/fee-structure" element={<FeeStructure />} />
            <Route path="/helpdesk" element={<Helpdesk />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/users" element={<Users />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
