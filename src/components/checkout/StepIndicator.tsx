import { CheckIcon } from "@heroicons/react/24/solid";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                  isCompleted
                    ? "border-blue-600"
                    : isCurrent
                    ? "border-blue-600"
                    : "border-gray-200"
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      isCompleted
                        ? "bg-blue-600 text-white"
                        : isCurrent
                        ? "border-2 border-blue-600 bg-white text-blue-600"
                        : "border-2 border-gray-300 bg-white text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </span>
                <span
                  className={`mt-1 text-sm ${
                    isCompleted || isCurrent ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  {step.description}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
