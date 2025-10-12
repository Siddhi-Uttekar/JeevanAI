import { DoctorRecommendation } from "@/app/api/analyze-symptoms/type";

export const DoctorRecommendationCard = ({
  recommendation,
}: {
  recommendation: DoctorRecommendation;
}) => {
  const urgencyClasses = {
    emergency: "bg-red-100 text-red-800 border-red-200",
    urgent: "bg-orange-100 text-orange-800 border-orange-200",
    routine: "bg-green-100 text-green-800 border-green-200",
  };

  const specialtyIcons = {
    Cardiologist: "❤️",
    Neurologist: "🧠",
    Pulmonologist: "🫁",
    Endocrinologist: "🦋",
    "Primary Care Physician": "👨‍⚕️",
    "Emergency Room": "🚨",
    default: "🏥",
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        urgencyClasses[recommendation.urgency]
      } mt-4`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img">
          {specialtyIcons[
            recommendation.specialty as keyof typeof specialtyIcons
          ] || specialtyIcons.default}
        </span>
        <div>
          <h3 className="font-bold text-lg mb-1">{recommendation.specialty}</h3>
          <p className="mb-2">{recommendation.reason}</p>
          <div className="flex items-center">
            <span className="font-medium mr-2">Priority:</span>
            <span
              className={`px-2 py-1 rounded-md text-xs font-semibold ${
                urgencyClasses[recommendation.urgency]
              }`}
            >
              {recommendation.urgency.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
