import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "/Users/tobygabriella/Desktop/MetaU Projects/world-collective/Frontend/src/Components/Contexts/AuthContext.jsx";
import { SocketProvider } from "./Components/Contexts/SocketContext.jsx";
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
const Notifications = lazy(() =>
  import("./Components/Notifications/Notifications.jsx")
);
const ListingDetailContainer = lazy(() =>
  import("./Components/DetailContainer/ListingDetailContainer.jsx")
);
const AuctionListingPage = lazy(() =>
  import("./Components/AuctionListing/AuctionListingPage.jsx")
);
const ShoppingCart = lazy(() =>
  import("./Components/ShoppingCart/ShoppingCart.jsx")
);

function App() {
  return (
    <Router>
      <SocketProvider>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<LogIn />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/" element={<Home />} />
              <Route path="/userProfile" element={<UserProfile />} />
              <Route path="/createListing" element={<CreateListing />} />
              <Route path="/listings/:id" element={<ListingDetailContainer />}>
                <Route index element={<ListingDetails />} />
              </Route>
              <Route
                path="/checkout"
                element={
                  <Elements stripe={stripePromise}>
                    <PaymentPage />
                  </Elements>
                }
              />
              <Route
                path="/listings/:filterType/:filterValue"
                element={<FilteredListing />}
              />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/users/:username" element={<OtherUsersProfile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route
                path="/listings/auctions"
                element={<AuctionListingPage />}
              />
              <Route path="/cart" element={<ShoppingCart />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;
