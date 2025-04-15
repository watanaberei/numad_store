// routes/HomeRoute.js
import HeaderHome from "../../client/components/HeaderHome.js";
import HomeScreen from "../../client/screens/HomeScreen.js";

const HomeRoute = async () => {
  const header = document.getElementById("header");
  header.innerHTML = await HeaderHome.render();
  await HeaderHome.after_render();

  const main = document.getElementById("content");
  main.innerHTML = await HomeScreen.render();
  if (HomeScreen.after_render) await HomeScreen.after_render();
};

export default HomeRoute;