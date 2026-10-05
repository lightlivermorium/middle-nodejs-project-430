import "@typespec/http";

using Http;

@service(#{ title: "Flight Booking API" })
@route("/api")
namespace FlightBooking;

model Health {
  status: "ok";
}

@route("/health")
@get
op health(): Health;
