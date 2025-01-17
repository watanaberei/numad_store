// components/address.js
import { format, parseISO } from "date-fns";
import enUS from "date-fns/locale/en-US/index.js";
import gl from "date-fns/locale/gl/index.js";

export function address(address) {
  const suffixes = "ct|lido|road|rd|street|st|way|ave|avenue|dr|drive|lane|ln|grove|gardens|place|circus|crescent|bypass|close|square|hill|mews|vale|rise|row|mead|wharf";
  const regex = new RegExp(`(?<addr>.*?(?<=\\s)(${suffixes}))(?=\\s*[,\\.]*\\s*|$)`, 'i');
  const match = address.match(regex);
  return match ? match.groups.addr.trim() : null;
}

export function streetNumber(address) {
  const regex = /^(?<number>\d+)/;
  const match = address.match(regex);
  return match ? match.groups.number : null;
}

export function streetName(address) {
  const suffixes = "ct|lido|road|rd|street|st|way|ave|avenue|dr|drive|lane|ln|grove|gardens|place|circus|crescent|bypass|close|square|hill|mews|vale|rise|row|mead|wharf";
  const regex = new RegExp(`(?<=\\d+\\s)(?<street>.*?(?<=\\s)(${suffixes}))(?=\\s*[,\\.]*\\s*|$)`, 'i');
  const match = address.match(regex);
  return match ? match.groups.street.trim() : null;
}

export function state(address) {
  const regex = /,\s*(?<state>[A-Za-z]{2})/;
  const match = address.match(regex);
  return match ? match.groups.state : null;
}

export function zip(address) {
  const regex = /\s*(?<zip>\d{5}(-\d{4})?)/;
  const match = address.match(regex);
  return match ? match.groups.zip : null;
}

export function designator(address) {
  const labels = "APT|BLDG|FL|STE|RM|DEPT|Unit";
  const regex = new RegExp(`(?<designator>(${labels})\\s\\d+)`, 'i');
  const match = address.match(regex);
  return match ? match.groups.designator.trim() : null;
}


export function city(address) {
  console.log('Parsing city from address:', address);
  
  const labels = "APT|BLDG|FL|STE|RM|DEPT|Unit";
  const regex1 = new RegExp(`(?<=(${labels})\\s\\d+\\s)(?<city>[^,]+)(?=,\\s*[A-Za-z]{2})`, 'i');
  let match = address.match(regex1);
  
  if (match) {
    console.log('Found city after designator:', match.groups.city.trim());
    return match.groups.city.trim();
  }

  const suffixes = "ct|lido|road|rd|street|st|way|ave|avenue|dr|drive|lane|ln|grove|gardens|place|circus|crescent|bypass|close|square|hill|mews|vale|rise|row|mead|wharf";
  const regex2 = new RegExp(`(?<=(${suffixes})\\b)[^,]*,\\s*(?<city>[^,]+)(?=,\\s*[A-Za-z]{2})`, 'i');
  match = address.match(regex2);

  if (match) {
    console.log('Found city after street:', match.groups.city.trim());
    return match.groups.city.trim();
  }

  const regex3 = /,\s*(?<city>[^,]+)(?=,\s*[A-Za-z]{2})/;
  match = address.match(regex3);
  
  if (match) {
    console.log('Found city in fallback:', match.groups.city.trim());
    return match.groups.city.trim();
  }

  console.log('No city found in address');
  return null;
}

// export function city(address) {
//   const suffixes = "lido|road|rd|street|st|way|ave|avenue|dr|drive|lane|ln|grove|gardens|place|circus|crescent|bypass|close|square|hill|mews|vale|rise|row|mead|wharf";
//   const regex = new RegExp(`(?<=(${suffixes})\\s)(?<city>.*?)(?=,\\s*[A-Za-z]{2})`, 'i');
//   const match = address.match(regex);
//   return match ? match.groups.city.trim() : null;
// }


// export function cityDesignator(address) {
//   const labels = "APT|BLDG|FL|STE|RM|DEPT|Unit";
//   const regex = new RegExp(`(?<=(${labels})\\s\\d+\\s)(?<city>.*?)(?=,\\s*[A-Za-z]{2})`, 'i');
//   const match = address.match(regex);
//   return match ? match.groups.city.trim() : null;
// }






















  // // STORE ADDRESS
  // function getStoreAddress(address) {
  //   const suffixes = "road|rd|street|st|way|ave|avenue|dr|drive|lane|ln|grove|gardens|place|circus|crescent|bypass|close|square|hill|mews|vale|rise|row|mead|wharf";
  //   const regex = new RegExp(`(?<addr>.*?(?<=\\s)(${suffixes})(?=\\s|,))`, 'i');
  //   const match = address.match(regex);
  //   return match ? match.groups.addr.trim() : null;
  // }

  // // STORE STREET NUMBER
  // function getStoreStreetNumber(address) {
  //   const regex = /^(?<number>\d+)/;
  //   const match = address.match(regex);
  //   return match ? match.groups.number : null;
  // }

  // // STORE STREET NAME
  // function getStoreStreetName(address) {
  //   const suffixes = "road|rd|street|st|way|ave|avenue|dr|drive|lane|ln|grove|gardens|place|circus|crescent|bypass|close|square|hill|mews|vale|rise|row|mead|wharf";
  //   const regex = new RegExp(`(?<=\\d+\\s)(?<street>.*?(?<=\\s)(${suffixes}))`, 'i');
  //   const match = address.match(regex);
  //   return match ? match.groups.street.trim() : null;
  // }

  // // STORE CITY
  // function getStoreCity(address) {
  //   const suffixes = "road|rd|street|st|way|ave|avenue|dr|drive|lane|ln|grove|gardens|place|circus|crescent|bypass|close|square|hill|mews|vale|rise|row|mead|wharf";
  //   const regex = new RegExp(`(?<=(${suffixes})\\s)(?<city>.*?)(?=,\\s*[A-Za-z]{2})`, 'i');
  //   const match = address.match(regex);
  //   return match ? match.groups.city.trim() : null;
  // }

  // // STORE ADDRESS
  // function getStoreState(address) {
  //   const regex = /,\s*(?<state>[A-Za-z]{2})/;
  //   const match = address.match(regex);
  //   return match ? match.groups.state : null;
  // }

  // // Test the zip part
  // function getStoreZip(address) {
  //   const regex = /\s*(?<zip>\d{5}(-\d{4})?)/;
  //   const match = address.match(regex);
  //   return match ? match.groups.zip : null;
  // }

  // const storeAddress = "109 W Santa Fe Ave, Placentia, CA 92870";
// // console.log("Address Part:", getStoreAddress(storeAddress));
// // console.log("Street Name Part:", getStoreStreetName(storeAddress));
// // console.log("Street Number Part:", getStoreStreetNumber(storeAddress));
// // console.log("City Part:", getStoreCity(storeAddress));
// // console.log("State Part:", getStoreState(storeAddress));
// // console.log("Zip Part:", getStoreZip(storeAddress));