// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const dbUrl = "mongodb+srv://devanshagrawal:8Ef7gRg0KxqTnhNO@cluster0.qhwqrij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mapToken = "pk.eyJ1IjoiaW5zcGlyZTI1NiIsImEiOiJjbThwZzkzb2cwMXhwMmlzY3VrNjQ3dGk4In0.XK929l_AotYhiPcPU2diWw";

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  for (let obj of initData.data) {
    const geoData = await geocodingClient
      .forwardGeocode({
        query: obj.location,
        limit: 1,
      })
      .send();

    const listing = new Listing({
      ...obj,
      owner: "67df8ecdfc2dcd4eb408fa24",
      geometry: geoData.body.features[0].geometry,
    });

    await listing.save();
  }

  console.log("All listings added with dynamic coordinates");
};

initDB();


