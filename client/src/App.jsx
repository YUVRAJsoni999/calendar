import { useState } from "react";
import CalendarMonthView from "./components/CalendarMonthView";
import CalendarQuarterView from "./components/CalendarQuarterView";

function App() {
  const [view, setView] = useState("month");

  return (
    <div className="p-4">
      <h1>🌍 Vacation Calendar</h1>
      <button onClick={() => setView("month")}>Month View</button>
      <button onClick={() => setView("quarter")}>Quarter View</button>

      {view === "month" ? <CalendarMonthView /> : <CalendarQuarterView />}
    </div>
  );
}

export default App;



// // src/App.js
// import React, { useState } from "react";
// import CalendarView from "./components/CalendarView";

// function App() {
//   const [view, setView] = useState("monthly");

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Vacation Calendar</h1>
//       <button onClick={() => setView("monthly")}>Monthly View</button>
//       <button onClick={() => setView("quarterly")}>Quarterly View</button>
//       <CalendarView viewType={view} />
//     </div>
//   );
// }

// export default App;