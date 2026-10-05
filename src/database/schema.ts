import type { ColumnType, Generated } from 'kysely';

export type BookingStatus = 'confirmed' | 'cancelled';

export interface CitiesTable {
  code: string;
  name: string;
  country: string;
}

export interface AirlinesTable {
  code: string;
  name: string;
}

export interface FlightsTable {
  id: Generated<number>;
  airlineCode: string;
  number: string;
  fromCityCode: string;
  toCityCode: string;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  price: number;
  seatsAvailable: number;
}

export interface BookingsTable {
  id: Generated<number>;
  code: string;
  flightId: number;
  status: ColumnType<BookingStatus, never, BookingStatus>;
  totalPrice: number;
  contactEmail: string;
  contactPhone: string;
  createdAt: ColumnType<string, never, never>;
}

export interface PassengersTable {
  id: Generated<number>;
  bookingId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  documentNumber: string;
}

export interface Database {
  cities: CitiesTable;
  airlines: AirlinesTable;
  flights: FlightsTable;
  bookings: BookingsTable;
  passengers: PassengersTable;
}
