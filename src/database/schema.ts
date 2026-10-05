import type { ColumnType, Generated } from 'kysely';

type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type BookingStatus = 'confirmed' | 'cancelled';

export interface CitiesTable {
  code: string;
  name: string;
  country: string;
  sortOrder: number;
}

export interface AirlinesTable {
  code: string;
  name: string;
}

export interface FlightsTable {
  id: Generated<string>;
  airlineCode: string;
  number: string;
  fromCityCode: string;
  toCityCode: string;
  departureAt: Timestamp;
  arrivalAt: Timestamp;
  durationMinutes: number;
  price: number;
  seatsAvailable: number;
}

export interface BookingsTable {
  id: Generated<string>;
  code: string;
  flightId: string;
  status: ColumnType<BookingStatus, never, BookingStatus>;
  totalPrice: number;
  contactEmail: string;
  contactPhone: string;
  createdAt: ColumnType<Date, never, never>;
}

export interface PassengersTable {
  id: Generated<number>;
  bookingId: string;
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
