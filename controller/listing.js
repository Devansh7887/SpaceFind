const { response } = require("express");
const Listing = require("../models/listing.js");

// Geoapify API Key
const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.newRoute = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({
    path: "reviews", populate: {
      path: "author",
    },
  }).populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createRoute = async(req,res,next)=>{

  // Check if file was uploaded successfully
  if (!req.file) {
    console.error("File upload failed - no file received");
    req.flash("error", "Image upload failed. Please check your Cloudinary credentials.");
    return res.redirect("/listings/new");
  }

  console.log("File uploaded successfully:", req.file);

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  
  // Try geocoding with Geoapify
  try {
    const location = encodeURIComponent(req.body.listing.location);
    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/search?text=${location}&apiKey=${geoapifyApiKey}`;
    
    const response = await fetch(geoapifyUrl);
    const data = await response.json();
    
    console.log("Geocoding successful");
    
    // Check if geocoding returned valid results
    if (data.features && data.features.length > 0) {
      // Geoapify returns [longitude, latitude] which is correct for GeoJSON
      newListing.geometry = {
        type: "Point",
        coordinates: [
          data.features[0].properties.lon,
          data.features[0].properties.lat
        ]
      };
    } else {
      console.log("No geocoding results found, using default coordinates");
      newListing.geometry = {
        type: "Point",
        coordinates: [0, 0]
      };
    }
  } catch (err) {
    console.error("Geocoding error (using default coordinates):", err.message);
    // Use default coordinates if geocoding fails
    newListing.geometry = {
      type: "Point",
      coordinates: [0, 0]
    };
  }

  newListing.image.url = url;
  newListing.image.filename = filename;
  
  try {
    let saved = await newListing.save();
    console.log("Listing saved successfully:", saved._id);
    req.flash("success","New Listing Created!")
    res.redirect("/listings");
  } catch (err) {
    console.error("Error saving listing:", err);
    req.flash("error", "Failed to save listing: " + err.message);
    res.redirect("/listings/new");
  }

}


module.exports.editRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_30,w_25");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateRoute = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}

module.exports.destroyRoute = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}
