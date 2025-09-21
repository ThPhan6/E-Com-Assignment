import { useState } from "react";
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

interface CountryStateSelectorProps {
  onCountryChange: (countryCode: string) => void;
  onStateChange: (state: string, stateCode: string) => void;
  onCityChange: (city: string) => void;
  errors?: {
    country?: string;
    state?: string;
    city?: string;
  };
}

export default function CountryStateSelector({
  onCountryChange,
  onStateChange,
  onCityChange,
  errors,
}: CountryStateSelectorProps) {
  const [country, setCountry] = useState<any>(undefined);
  const [currentState, setCurrentState] = useState<any>(undefined);
  const [currentCity, setCurrentCity] = useState<any>(undefined);

  const handleCountryChange = (selectedCountry: any) => {
    setCountry(selectedCountry);
    setCurrentState(undefined);
    setCurrentCity(undefined);

    if (selectedCountry) {
      onCountryChange(selectedCountry.name);
      onStateChange("", ""); // clear state
      onCityChange(""); // clear city
    } else {
      onCountryChange("");
      onStateChange("", "");
      onCityChange("");
    }
  };

  const handleStateChange = (selectedState: any) => {
    setCurrentState(selectedState);
    setCurrentCity(undefined);

    if (selectedState) {
      onStateChange(selectedState.name, selectedState.iso2 || "");
      onCityChange(""); // clear city
    } else {
      onStateChange("", "");
      onCityChange("");
    }
  };

  const handleCityChange = (selectedCity: any) => {
    setCurrentCity(selectedCity);

    if (selectedCity) {
      onCityChange(selectedCity.name);
    } else {
      onCityChange("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Country Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country *
        </label>
        <CountrySelect
          containerClassName="form-group"
          inputClassName={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors?.country ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          onChange={handleCountryChange}
          onTextChange={(_txt) => console.log(_txt)}
          placeHolder="Select Country"
          defaultValue={country}
        />
        {errors?.country && (
          <p className="text-red-500 text-xs mt-1">{errors.country}</p>
        )}
      </div>

      {/* State Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State/Province <span className="text-gray-500">(if applicable)</span>
        </label>
        <StateSelect
          countryid={country?.id}
          containerClassName="form-group"
          inputClassName={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors?.state ? "border-red-500 bg-red-50" : "border-gray-300"
          } ${!country ? "bg-gray-100" : ""}`}
          onChange={handleStateChange}
          onTextChange={(_txt) => console.log(_txt)}
          defaultValue={currentState}
          placeHolder={
            !country
              ? "Select Country First"
              : "Select State/Province (if applicable)"
          }
        />
        {errors?.state && (
          <p className="text-red-500 text-xs mt-1">{errors.state}</p>
        )}
      </div>

      {/* City Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-gray-500">(if applicable)</span>
        </label>
        <CitySelect
          countryid={country?.id}
          stateid={currentState?.id}
          containerClassName="form-group"
          inputClassName={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors?.city ? "border-red-500 bg-red-50" : "border-gray-300"
          } ${!country || !currentState ? "bg-gray-100" : ""}`}
          onChange={handleCityChange}
          defaultValue={currentCity}
          placeHolder={
            !country
              ? "Select Country First"
              : !currentState
              ? "Select State First (if applicable)"
              : "Select City (if applicable)"
          }
        />
        {errors?.city && (
          <p className="text-red-500 text-xs mt-1">{errors.city}</p>
        )}
      </div>
    </div>
  );
}
