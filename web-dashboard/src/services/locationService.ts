// src/services/locationService.ts
import axios from 'axios';

interface Place {
  'place name': string;
  longitude: string;
  latitude: string;
  state: string;
  'state abbreviation': string;
}

interface ZipCodeResponse {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places: Place[];
}

interface StateInfo {
  name: string;
  abbreviation: string;
}

interface CityInfo {
  name: string;
  state: string;
  stateAbbr: string;
  zipCode: string;
}

class LocationService {
  private readonly baseUrl = 'https://api.zippopotam.us';
  
  // US States data
  private readonly usStates: StateInfo[] = [
    { name: 'Alabama', abbreviation: 'AL' },
    { name: 'Alaska', abbreviation: 'AK' },
    { name: 'Arizona', abbreviation: 'AZ' },
    { name: 'Arkansas', abbreviation: 'AR' },
    { name: 'California', abbreviation: 'CA' },
    { name: 'Colorado', abbreviation: 'CO' },
    { name: 'Connecticut', abbreviation: 'CT' },
    { name: 'Delaware', abbreviation: 'DE' },
    { name: 'Florida', abbreviation: 'FL' },
    { name: 'Georgia', abbreviation: 'GA' },
    { name: 'Hawaii', abbreviation: 'HI' },
    { name: 'Idaho', abbreviation: 'ID' },
    { name: 'Illinois', abbreviation: 'IL' },
    { name: 'Indiana', abbreviation: 'IN' },
    { name: 'Iowa', abbreviation: 'IA' },
    { name: 'Kansas', abbreviation: 'KS' },
    { name: 'Kentucky', abbreviation: 'KY' },
    { name: 'Louisiana', abbreviation: 'LA' },
    { name: 'Maine', abbreviation: 'ME' },
    { name: 'Maryland', abbreviation: 'MD' },
    { name: 'Massachusetts', abbreviation: 'MA' },
    { name: 'Michigan', abbreviation: 'MI' },
    { name: 'Minnesota', abbreviation: 'MN' },
    { name: 'Mississippi', abbreviation: 'MS' },
    { name: 'Missouri', abbreviation: 'MO' },
    { name: 'Montana', abbreviation: 'MT' },
    { name: 'Nebraska', abbreviation: 'NE' },
    { name: 'Nevada', abbreviation: 'NV' },
    { name: 'New Hampshire', abbreviation: 'NH' },
    { name: 'New Jersey', abbreviation: 'NJ' },
    { name: 'New Mexico', abbreviation: 'NM' },
    { name: 'New York', abbreviation: 'NY' },
    { name: 'North Carolina', abbreviation: 'NC' },
    { name: 'North Dakota', abbreviation: 'ND' },
    { name: 'Ohio', abbreviation: 'OH' },
    { name: 'Oklahoma', abbreviation: 'OK' },
    { name: 'Oregon', abbreviation: 'OR' },
    { name: 'Pennsylvania', abbreviation: 'PA' },
    { name: 'Rhode Island', abbreviation: 'RI' },
    { name: 'South Carolina', abbreviation: 'SC' },
    { name: 'South Dakota', abbreviation: 'SD' },
    { name: 'Tennessee', abbreviation: 'TN' },
    { name: 'Texas', abbreviation: 'TX' },
    { name: 'Utah', abbreviation: 'UT' },
    { name: 'Vermont', abbreviation: 'VT' },
    { name: 'Virginia', abbreviation: 'VA' },
    { name: 'Washington', abbreviation: 'WA' },
    { name: 'West Virginia', abbreviation: 'WV' },
    { name: 'Wisconsin', abbreviation: 'WI' },
    { name: 'Wyoming', abbreviation: 'WY' },
    { name: 'District of Columbia', abbreviation: 'DC' }
  ];

  // Get all US states
  getStates(): StateInfo[] {
    return this.usStates;
  }

  // Search states by name or abbreviation
  searchStates(query: string): StateInfo[] {
    if (!query || query.length < 1) return [];
    
    const searchTerm = query.toLowerCase();
    return this.usStates.filter(state => 
      state.name.toLowerCase().includes(searchTerm) ||
      state.abbreviation.toLowerCase().includes(searchTerm)
    );
  }

  // Get location info by ZIP code
  async getLocationByZip(zipCode: string): Promise<CityInfo | null> {
    try {
      if (!zipCode || zipCode.length < 5) return null;
      
      const response = await axios.get<ZipCodeResponse>(`${this.baseUrl}/us/${zipCode}`);
      const data = response.data;
      
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        return {
          name: place['place name'],
          state: place.state,
          stateAbbr: place['state abbreviation'],
          zipCode: data['post code']
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching location by ZIP:', error);
      return null;
    }
  }

  // Get cities by state abbreviation (limited by API)
  async getCitiesByState(stateAbbr: string): Promise<string[]> {
    try {
      // This is a workaround since the API doesn't have a direct cities endpoint
      // We'll return some common cities for major states
      const commonCities: { [key: string]: string[] } = {
        'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose', 'Fresno', 'Long Beach', 'Oakland'],
        'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'],
        'FL': ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale'],
        'NY': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'],
        'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster'],
        'IL': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin'],
        'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton'],
        'GA': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon'],
        'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington'],
        'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn']
      };

      return commonCities[stateAbbr.toUpperCase()] || [];
    } catch (error) {
      console.error('Error fetching cities by state:', error);
      return [];
    }
  }

  // Validate ZIP code format
  isValidZipCode(zipCode: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  // Format ZIP code
  formatZipCode(zipCode: string): string {
    // Remove any non-digit characters
    const digits = zipCode.replace(/\D/g, '');
    
    if (digits.length <= 5) {
      return digits;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    
    return digits.slice(0, 5);
  }

  // Get state by abbreviation
  getStateByAbbr(abbr: string): StateInfo | null {
    return this.usStates.find(state => 
      state.abbreviation.toLowerCase() === abbr.toLowerCase()
    ) || null;
  }

  // Get state by name
  getStateByName(name: string): StateInfo | null {
    return this.usStates.find(state => 
      state.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }
}

export default new LocationService();
export type { StateInfo, CityInfo };
