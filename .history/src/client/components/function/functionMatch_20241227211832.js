const storeLocationHTML = components.storeLocation.render(
    storeData,
    storeData.location,
    storeData?.location?.city
  );
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
  Location Section
  const storeLocationHTML = document.getElementById("store-location");
  if (storeLocationHTML && storeLocationData) {
    try {
      storeLocationHTML.innerHTML = components.storeLocation.render(
        storeLocationData.header,
        storeLocationData.attribute,
        storeLocationData.footer
      );

      // Pass the full storeLocationData to afterRender
      components.storeLocation.afterRender(storeLocationData);
    } catch (error) {
      console.error("Error rendering location section:", error);
    }
  }
  const storeOverviewHTML = components.storeOverview.render(
    storeOverviewData.header,
    storeOverviewData.text,
    storeOverviewData.summary,
    storeOverviewData.footer
  );
  const storeExperienceHTML = components.storeExperience.render(
    storeExperienceData.header,
    storeExperienceData.text,
    storeExperienceData.footer,
    storeExperienceData.area,
    storeExperienceData.attribute
  );
  const storeServiceHTML = components.storeService.render(
    storeServiceData.header,
    storeServiceData.text,
    storeServiceData.attributes,
    storeServiceData.footer
  );
  const storeBusinessHTML = components.storeBusiness.render(storeData);
  const storeLocationHTML = components.storeLocation.render(
    storeLocationHeader,
    storeLocationData.attribute,
    storeLocationData.footer
  );