import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "/Users/tobygabriella/Desktop/MetaU Projects/world-collective/Frontend/src/Components/Contexts/AuthContext.jsx";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Loading from "./Components/Loading/Loading";
import "./App.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Home = lazy(() => import("./Components/Home/Home.jsx"));
const LogIn = lazy(() => import("./Components/Login/LogIn.jsx"));
const SignUp = lazy(() => import("./Components/Signup/SignUp.jsx"));
const UserProfile = lazy(() =>
  import("./Components/UserProfile/UserProfile.jsx")
);
const CreateListing = lazy(() =>
  import("./Components/CreateListing/CreateListing.jsx")
);
const ListingDetails = lazy(() =>
  import("./Components/ListingDetails/ListingDetails.jsx")
);
const FilteredListing = lazy(() =>
  import("./Components/FilteredListing/FilteredListing.jsx")
);
const SearchResults = lazy(() =>
  import("./Components/SearchResults/SearchResults.jsx")
);
const Wishlist = lazy(() => import("./Components/Wishlist/Wishlist.jsx"));
const OtherUsersProfile = lazy(() =>
  import("./Components/OtherUsersProfile/OtherUsersProfile.jsx")
);
const PaymentPage = lazy(() => import("./Components/Checkout/PaymentPage.jsx"));
const ConfirmationPage = lazy(() =>
  import("./Components/Checkout/ConfirmationPage.jsx")
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<LogIn />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/" element={<Home />} />
            <Route path="/userProfile" element={<UserProfile />} />
            <Route path="/createListing" element={<CreateListing />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route
              path="/listings/:filterType/:filterValue"
              element={<FilteredListing />}
            />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/users/:username" element={<OtherUsersProfile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route
              path="/buy/:id"
              element={
                <Elements stripe={stripePromise}>
                  <PaymentPage />
                </Elements>
              }
            />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
