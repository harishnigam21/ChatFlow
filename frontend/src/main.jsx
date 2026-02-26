import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import Store from "./redux/Store.js";
import App from "./App.jsx";
import Loading from "./components/common/Loading.jsx";
const Home = lazy(() => import("./Home.jsx"));
const ChatMain = lazy(() => import("./components/chat/Main.jsx"));
const Auth = lazy(() => import("./components/auth/Auth.jsx"));
const Signin = lazy(() => import("./components/auth/Signin.jsx"));
const Signup = lazy(() => import("./components/auth/Signup.jsx"));
const Login = lazy(() => import("./components/User_friendly_Error/Login.jsx"));
const NotFound = lazy(
  () => import("./components/User_friendly_Error/NotFound.jsx"),
);
const Refresh = lazy(
  () => import("./components/User_friendly_Error/Refresh.jsx"),
);
const BadRequest = lazy(
  () => import("./components/User_friendly_Error/BadRequest.jsx"),
);
const ServerError = lazy(
  () => import("./components/User_friendly_Error/ServerError.jsx"),
);
const LazyLoader = () => {
  return (
    <div className="flex absolute top-0 left-0 w-screen h-screen bg-bgprimary">
      <Loading />
    </div>
  );
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LazyLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/auth",
        element: (
          <Suspense fallback={<LazyLoader />}>
            <Auth />
          </Suspense>
        ),
        children: [
          {
            path: "signin",
            element: (
              <Suspense fallback={<LazyLoader />}>
                <Signin />
              </Suspense>
            ),
          },
          {
            path: "signup",
            element: (
              <Suspense fallback={<LazyLoader />}>
                <Signup />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/chat",
        element: (
          <Suspense fallback={<LazyLoader />}>
            <ChatMain />
          </Suspense>
        ),
      },
    ],
  },

  {
    path: "msg/login",
    element: (
      <Suspense fallback={<LazyLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "msg/not-found",
    element: (
      <Suspense fallback={<LazyLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
  {
    path: "msg/bad-request",
    element: (
      <Suspense fallback={<LazyLoader />}>
        <BadRequest />
      </Suspense>
    ),
  },
  {
    path: "msg/server-error",
    element: (
      <Suspense fallback={<LazyLoader />}>
        <ServerError />
      </Suspense>
    ),
  },
  {
    path: "msg/refresh",
    element: (
      <Suspense fallback={<LazyLoader />}>
        <Refresh />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
  
]);
createRoot(document.getElementById("root")).render(
  <Provider store={Store}>
    <RouterProvider router={router} />
  </Provider>,
);
