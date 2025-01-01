
  const city = storeData?.location?.city;
  const matchedLocation = data.location?.locations?.find(
    (loc) => loc.city === city
  );
  console.log("debug log: location02 - Location matching:", {
    cityToMatch: city,
    matchedLocation
  });

  if (matchedLocation) {
    // const locationData = {
    //   header: store.location.header || "Location",
    //   text: store.location.text,
    //   attribute: matchedLocation,
    //   footer: data.footerData?.location
    // };
    const storeLocationHeader =
    storeData.location.city + "," + storeData.location.area;
    console.log(
      "debug log: location15 - Rendering service with:",
      storeLocationHeader
    );
    console.log(
      "debug log: service01 - Rendering service with:",
      storeServiceData
    );
    try {
      storeLocation.innerHTML = components.storeLocation.render(
        storeLocationHeader,
        storeLocationData.attribute,
        storeLocationData.footer
      );
    } catch (error) {
      console.error("Error rendering service:", error);
    }
  }
//   Location Section
 