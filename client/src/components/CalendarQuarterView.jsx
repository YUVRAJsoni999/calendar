// import { startOfQuarter, endOfQuarter, eachMonthOfInterval, format } from "date-fns";
// import CalendarMonthView from "./CalendarMonthView";

// function CalendarQuarterView({ holidays = [], year = new Date().getFullYear() }) {
//   const today = new Date();
//   const startQuarter = startOfQuarter(today);
//   const endQuarter = endOfQuarter(today);
//   const months = eachMonthOfInterval({ start: startQuarter, end: endQuarter });

//   return (
//     <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
//       <h2 style={{ textAlign: "center", margin: "20px 0", color: "#2c3e50" }}>
//         Quarter View ({format(startQuarter, "MMM yyyy")} - {format(endQuarter, "MMM yyyy")})
//       </h2>

//       <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
//         {months.map((month, i) => (
//           <div
//             key={i}
//             style={{
//               flex: 1,
//               backgroundColor: "#fff",
//               borderRadius: "10px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//               padding: "15px",
//               transition: "transform 0.2s",
//             }}
//           >
//             <h3 style={{ textAlign: "center", marginBottom: "15px", color: "#34495e" }}>
//               {format(month, "MMMM yyyy")}
//             </h3>
//             <CalendarMonthView holidays={holidays} month={month} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default CalendarQuarterView;


// Updated CalendarQuarterView.js
import { startOfQuarter, endOfQuarter, eachMonthOfInterval, format } from "date-fns";
import CalendarMonthView from "./CalendarMonthView";

function CalendarQuarterView({ year = new Date().getFullYear() }) {
  const today = new Date();
  const startQuarter = startOfQuarter(today);
  const endQuarter = endOfQuarter(today);
  const months = eachMonthOfInterval({ start: startQuarter, end: endQuarter });

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ textAlign: "center", margin: "20px 0", color: "#2c3e50" }}>
        Quarter View ({format(startQuarter, "MMM yyyy")} - {format(endQuarter, "MMM yyyy")})
      </h2>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        {months.map((month, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "15px",
              transition: "transform 0.2s",
              minHeight: "600px" // Add stable height
            }}
          >
            <CalendarMonthView month={month} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarQuarterView;

