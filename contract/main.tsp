import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Flight Booking API" })
namespace FlightBookingApi;

model Health {
  status: "ok";
}

model City {
  code: string;
  name: string;
  country?: string;
}

model Money {
  amount: int32;
  currency: "RUB";
}

model Airline {
  code: string;
  name: string;
}

model Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: City;
  destination: City;
  departureAt: utcDateTime;
  arrivalAt: utcDateTime;
  durationMinutes: int32;
  price: Money;
  seatsAvailable: int32;
}

model Passenger {
  @minLength(1) firstName: string;
  @minLength(1) lastName: string;
  dateOfBirth: plainDate;
  @minLength(1) documentNumber: string;
}

model Contact {
  @minLength(1) email: string;
  @minLength(1) phone: string;
}

model Booking {
  @pattern("^[A-Z0-9]{6}$") code: string;
  status: "confirmed" | "cancelled";
  flight: Flight;
  passengers: Passenger[];
  contact: Contact;
  totalPrice: Money;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  @minLength(1) flightId: string;
  contact: Contact;
  @minItems(1) passengers: Passenger[];
}

model CancelBookingRequest {
  lastName?: string;
}

@error
model ValidationError {
  @statusCode _: 400;
  code: "validation_error";
  message: string;
}

@error
model NotFoundError {
  @statusCode _: 404;
  code: "not_found";
  message: string;
}

@route("/api/health")
interface HealthCheck {
  @operationId("health")
  @get
  check(): Health;
}

@route("/api/cities")
interface Cities {
  @operationId("listCities")
  @get
  list(): City[];
}

@route("/api/flights")
interface Flights {
  @operationId("searchFlights")
  @get
  search(
    @query origin: string,
    @query destination: string,
    @query date: plainDate,
    @query @minValue(1) passengers?: int32 = 1,
  ): Flight[] | ValidationError;

  @operationId("getFlight")
  @get
  @route("/{id}")
  get(@path id: string): Flight | NotFoundError;
}

@route("/api/bookings")
interface Bookings {
  @operationId("createBooking")
  @post
  create(@body body: CreateBookingRequest): {
    @statusCode _: 201;
    @body booking: Booking;
  } | ValidationError;

  @operationId("getBooking")
  @get
  @route("/{code}")
  get(@path code: string, @query lastName?: string): Booking | NotFoundError;

  @operationId("cancelBooking")
  @post
  @route("/{code}/cancel")
  cancel(@path code: string, @body body?: CancelBookingRequest): Booking | NotFoundError;
}
