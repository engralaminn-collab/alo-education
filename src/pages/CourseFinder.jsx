import React, { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL || "https://api.aloeducation.co.uk";
export default function CourseFinder(){
  const [count,setCount]=useState(null);
  useEffect(()=>{ fetch(`${API}/api/courses`).then(r=>r.json()).then(j=>setCount(j?.count ?? (j?.data?.length ?? 0))).catch(()=>setCount("error")); },[]);
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:24,fontFamily:"Arial"}}>
      <h1>Course Finder ✅</h1>
      <p>API: <b>{API}</b></p>
      <p>Total Courses: <b>{count===null?"Loading...":String(count)}</b></p>
      <p>URL: <b>/course-finder</b></p>
    </div>
  );
}
