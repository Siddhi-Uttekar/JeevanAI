// import dynamic from "next/dynamic";

// // Dynamically import the SpecialistMap component to disable SSR
// const SpecialistMap = dynamic(() => import("./SpecialistMap"), {
//   ssr: false,
// });

// export default function FindSpecialistPage() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-center my-6">Find a Specialist</h1>
//       <SpecialistMap />
//     </div>
//   );
// }
import FindSpecialist from "./FindSpecialist";

export default function FindSpecialistPage() {
  return (
    <div className="container mx-auto p-4">
      <FindSpecialist />
    </div>
  );
}
