import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CourseFinder from "./pages/CourseFinder.jsx";
export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/course-finder" element={<CourseFinder />} />
      </Routes>
    </BrowserRouter>
  );
}
