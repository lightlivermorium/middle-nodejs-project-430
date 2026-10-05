import "@typespec/http";

using Http;

@service(#{ title: "Flight Booking API" })
@route("/api")
namespace FlightBooking;

model Health {
  status: "ok";
}

model City {
  code: string;
  name: string;
  country: string;
}

@route("/health")
@get
op health(): Health;

@route("/cities")
@get
op listCities(): City[];
