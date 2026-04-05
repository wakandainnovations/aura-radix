import React, { useEffect } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { dashboardService } from "../../api/dashboardService";

// Set to true to enable debug logging
const DEBUG_MODE = false;

export default function TimeRangeSelector({
  dateRange,
  setDateRange,
  label = "Time Range:",
  className = "",
  selectedEntity,
  entityType,
  onSentimentDataFetched,
}) {
  const dateRangeOptions = [
    { value: "DAY", label: "Past 7 Days", days: 7, apiParam: "DAY" },
    { value: "DAY15", label: "Past 15 Days", days: 15, apiParam: "DAY15" },
    { value: "DAY30", label: "Past 30 Days", days: 30, apiParam: "DAY30" },
    { value: "WEEK", label: "Weeks", days: 14, apiParam: "WEEK" },
    { value: "MONTH", label: "Months", days: 28, apiParam: "MONTH" },
  ];

  // Debug: Log component mount and dateRange changes
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("⏱️ TimeRangeSelector mounted/updated");
      console.log("  dateRange:", dateRange);
      console.log("  selectedEntity:", selectedEntity);
      console.log("  entityType:", entityType);
    }
  }, [dateRange, selectedEntity, entityType]);

  // Handle radio change
  const handleRadioChange = (newValue) => {
    if (DEBUG_MODE) {
      console.log("📻 Radio changed to:", newValue);
    }
    setDateRange(newValue);
  };

  // Fetch sentiment data when dateRange changes
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("🔄 Effect triggered - dateRange changed to:", dateRange);
    }

    if (!selectedEntity?.id || !entityType || !dateRange) {
      if (DEBUG_MODE) {
        console.log("⚠️ Skipping API call - missing data:", {
          hasEntity: !!selectedEntity?.id,
          hasEntityType: !!entityType,
          hasDateRange: !!dateRange,
        });
      }
      return;
    }

    const fetchSentimentData = async () => {
      try {
        const selectedOption = dateRangeOptions.find(
          (opt) => opt.value === dateRange,
        );
        const apiParam = selectedOption?.apiParam || "DAY";

        if (DEBUG_MODE) {
          console.log("📡 Fetching sentiment data with:", {
            entityId: selectedEntity.id,
            period: apiParam,
          });
        }

        const response = await dashboardService.getSentimentOverTime(
          selectedEntity.id,
          apiParam,
        );

        if (DEBUG_MODE) {
          console.log("✅ Sentiment data fetched:", response);
        }

        // Notify parent component about new data
        if (onSentimentDataFetched) {
          onSentimentDataFetched(response);
        }
      } catch (error) {
        console.error("❌ Error fetching sentiment data:", error);
      }
    };

    fetchSentimentData();
  }, [dateRange, selectedEntity?.id, entityType]);

  return (
    <div
      className={`flex items-center gap-4 bg-card border border-border rounded-lg p-4 w-fit ${className}`}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <RadioGroup.Root
        value={dateRange || "DAY"}
        onValueChange={handleRadioChange}
        className="flex items-center gap-4"
      >
        {dateRangeOptions.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroup.Item
              value={option.value}
              id={`time-range-${option.value}`}
              className="w-5 h-5 rounded-full border-2 border-muted-foreground hover:border-primary data-[state=checked]:border-primary data-[state=checked]:border-[3px] transition-all cursor-pointer"
            >
              <RadioGroup.Indicator className="flex items-center justify-center w-full h-full">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              </RadioGroup.Indicator>
            </RadioGroup.Item>
            <label
              htmlFor={`time-range-${option.value}`}
              className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup.Root>

      {/* Debug info */}
      {/* <div className="ml-4 text-xs text-muted-foreground">
        Current: <span className="font-mono text-primary">{dateRange || 'NOT SET'}</span>
      </div> */}
    </div>
  );
}
