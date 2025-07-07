// routes/detailRoutes.js
import HeaderWork from "../../client/components/HeaderWork.js";
import WorkScreen from "../../client/screens/WorkScreen.js";

const WorkRoute = async () => {
  const header = document.getElementById("header");
  header.innerHTML = await HeaderWork.render();
  await HeaderWork.after_render();

  const main = document.getElementById("content");
  main.innerHTML = await WorkScreen.render();
  if (WorkScreen.after_render) await WorkScreen.after_render();
};

export default WorkRoute;