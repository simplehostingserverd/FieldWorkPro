// src/components/AddressForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import locationService, { StateInfo, CityInfo } from '../services/locationService';

interface AddressData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressFormProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Partial<AddressData>;
  disabled?: boolean;
  required?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  data,
  onChange,
  errors = {},
  disabled = false,
  required = false
}) => {
  const [stateOptions, setStateOptions] = useState<StateInfo[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const stateInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Handle ZIP code change and auto-fill city/state
  const handleZipChange = async (zipCode: string) => {
    const formattedZip = locationService.formatZipCode(zipCode);
    
    onChange({
      ...data,
      zipCode: formattedZip
    });

    // Auto-fill city and state if ZIP is valid
    if (locationService.isValidZipCode(formattedZip)) {
      setIsLoadingLocation(true);
      try {
        const locationInfo = await locationService.getLocationByZip(formattedZip);
        if (locationInfo) {
          onChange({
            ...data,
            zipCode: formattedZip,
            city: locationInfo.name,
            state: locationInfo.stateAbbr
          });
          
          // Load cities for the state
          const cities = await locationService.getCitiesByState(locationInfo.stateAbbr);
          setCityOptions(cities);
        }
      } catch (error) {
        console.error('Error auto-filling location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    }
  };

  // Handle state search
  const handleStateSearch = (query: string) => {
    onChange({
      ...data,
      state: query
    });

    if (query.length > 0) {
      const results = locationService.searchStates(query);
      setStateOptions(results);
      setShowStateDropdown(true);
    } else {
      setStateOptions([]);
      setShowStateDropdown(false);
    }
  };

  // Handle state selection
  const handleStateSelect = async (state: StateInfo) => {
    onChange({
      ...data,
      state: state.abbreviation
    });
    setShowStateDropdown(false);
    
    // Load cities for selected state
    try {
      const cities = await locationService.getCitiesByState(state.abbreviation);
      setCityOptions(cities);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  // Handle city search
  const handleCitySearch = (query: string) => {
    onChange({
      ...data,
      city: query
    });

    if (query.length > 0 && cityOptions.length > 0) {
      setShowCityDropdown(true);
    } else {
      setShowCityDropdown(false);
    }
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    onChange({
      ...data,
      city: city
    });
    setShowCityDropdown(false);
  };

  // Filter cities based on input
  const filteredCities = cityOptions.filter(city =>
    city.toLowerCase().includes(data.city.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node) &&
          stateInputRef.current && !stateInputRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node) &&
          cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            disabled={disabled}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="123 Main Street"
          />
        </div>
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* City Field with Auto-complete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <input
            ref={cityInputRef}
            type="text"
            value={data.city}
            onChange={(e) => handleCitySearch(e.target.value)}
            onFocus={() => cityOptions.length > 0 && setShowCityDropdown(true)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="City name"
          />
          
          {/* City Dropdown */}
          {showCityDropdown && filteredCities.length > 0 && (
            <div
              ref={cityDropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredCities.slice(0, 10).map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
          
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* State Field with Auto-complete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State {required && <span className="text-red-500">*</span>}
          </label>
          <input
            ref={stateInputRef}
            type="text"
            value={data.state}
            onChange={(e) => handleStateSearch(e.target.value)}
            onFocus={() => data.state.length > 0 && setShowStateDropdown(true)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="State or abbreviation"
          />
          
          {/* State Dropdown */}
          {showStateDropdown && stateOptions.length > 0 && (
            <div
              ref={stateDropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {stateOptions.map((state, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleStateSelect(state)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  <span className="font-medium">{state.abbreviation}</span> - {state.name}
                </button>
              ))}
            </div>
          )}
          
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        {/* ZIP Code Field with Auto-fill */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.zipCode}
              onChange={(e) => handleZipChange(e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.zipCode ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="12345"
              maxLength={10}
            />
            {isLoadingLocation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FaSearch className="animate-spin text-blue-500" />
              </div>
            )}
          </div>
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter ZIP code to auto-fill city and state
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
