import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./store/auth";
import { Shell } from "./components/Shell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Queue, { WalkInRegister } from "./pages/Queue";
import Consult from "./pages/Consult";
import Ehr from "./pages/Ehr";
import Appointments from "./pages/Appointments";
import Lab from "./pages/Lab";
import Pharmacy, { Inventory } from "./pages/Pharmacy";
import Billing from "./pages/Billing";
import OpPulse, { Departments } from "./pages/OpPulse";
import Staff from "./pages/Staff";
import Patients from "./pages/Patients";
import { MyBills, MyRecords } from "./pages/PatientViews";
import { Skeleton } from "./components/ui";

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10"><Skeleton className="h-40" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <Guard>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/intake" element={<WalkInRegister />} />
              <Route path="/consult/:visitId" element={<Consult />} />
              <Route path="/patients/:id" element={<Ehr />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/book" element={<Appointments />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/pharmacy" element={<Pharmacy />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/my-bills" element={<MyBills />} />
              <Route path="/records" element={<MyRecords />} />
              <Route path="/op" element={<OpPulse />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/staff" element={<Staff />} />
            </Routes>
          </Guard>
        }
      />
    </Routes>
  );
}
