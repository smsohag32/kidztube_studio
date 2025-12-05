import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Routers";
import { Provider } from "react-redux";
import { store } from "./redux-store";
import ThemeProvider from "./context/theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
   <>
      <Provider store={store}>
         <ThemeProvider>
            <RouterProvider router={router} />
         </ThemeProvider>
      </Provider>
   </>
);
